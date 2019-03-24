const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');

const { transport, maeANiceEmail } = require('../mail.js');

const Mutations = {
    async createItem(parent, args, ctx, info) {
        if(!ctx.request.userId) {
            throw new Error('You must be logged in!')
        }
        const item = await ctx.db.mutation.createItem({
            data: {
                // This is how to create a relationship between the Item and the User in Prisma
                user: {
                    connect: {
                        id: ctx.request.userId
                    }
                },
                ...args
            }
        }, info);
        console.log(item);
        return item;
    },
    updateItem(parent, args, ctx, info) {
        //take a copy of the updates
        const updates = { ...args };
        // remove the ID from updates
        delete updates.id;
        // run the update method
        return ctx.db.mutation.updateItem({
            data: updates,
            where: {id: args.id}
        },info )
    },
    async deleteItem(parent, args, ctx, info) {
        const where = {id: args.id};
        // find the item 
        const item = await ctx.db.query.item({ where }, `{id title}`);
        //check if they own the item
        
        //delete item
        return ctx.db.mutation.deleteItem({where}, info);
    },
    async signup(parent, args, ctx, info) {
        args.email = args.email.toLowerCase();
        // has the pass
        const password = await bcrypt.hash(args.password, 10);
        // create user in the db
        const user = await ctx.db.mutation.createUser({
            data: {
                ...args,
                password,
                permissions: { set: ['USER']},
            },
        },
        info
        );
        // create the JWT token
        const token = jwt.sign({userId: user.id }, process.env.APP_SECRET);
        // set jwt as cookie on the response
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 *24 *365, // 1year cooki
        });
        // return the user to the browser
        return user
    },
    async signin(parent, { email, password }, ctx, info) {
        // 1. check if there is a user with that email
        const user = await ctx.db.query.user({ where: { email } });
        if (!user) {
          throw new Error(`No such user found for email ${email}`);
        }
        // 2. Check if their password is correct
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          throw new Error('Invalid Password!');
        }
        // 3. generate the JWT Token
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
        // 4. Set the cookie with the token
        ctx.response.cookie('token', token, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 365,
        });
        // 5. Return the user
        return user;
      },
      signout(parent, args, ctx, info) {
          ctx.response.clearCookie('token');
          return { message: 'GoodBye!' };
      },
      async requestReset(parent, args, ctx, info) {
        // check if the user
        const user = await ctx.db.query.user({where: { email: args.email }});

        if(!user) {
            throw new Error('no such user with this email');
        }
        // set reset token and expiry on that user
        const randomBytesPromiseified = promisify(randomBytes);
        const resetToken = (await randomBytesPromiseified(20)).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
        const res = await ctx.db.mutation.updateUser({
            where: { email: args.email },
            data: { resetToken, resetTokenExpiry },
        });
        // email the reset token
        const mailRes = await transport.sendMail({
            from: 'skobraf@gmail.com',
            to: user.email,
            subject: 'Your Password Reset Token',
            html: maeANiceEmail(`Your Password Reset Toen is here!
            \n\n
            <a href="${process.env.FRONTEND_URL}/reset?resetToekn=${resetToken}">
                Click Here to Reset
            </a>`),
        });
        return { message: 'thanks'}
    },
    async resetPassword(parent, args, ctx, info) {
        // check if password match 
        if(args.password !== args.confirmPassword) {
            throw new Error("Yo Passwords don\'t match");
        }
        // check if it's legit reset and if it's experied in 1 Query (like sql)
        const [user] = await ctx.db.query.users({
            where: {
                resetToken: args.resetToken,
                resetTokenExpiry_gte: Date.now() - 360000,
            },
        });
        if(!user) {
            throw new Error('this token is invalid or expired!');
        }
        //hash the new password
        const password = await bcrypt.hash(args.password, 10);
        // save the new password to the user and remove old resetToken
        const updatedUser = await ctx.db.mutation.updateUser({
            where: { email: user.email },
            data: {
                password,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        // generate jwt
        const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
        // 4. Set the cookie with the token
        ctx.response.cookie('token', token, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 365,
        });
        // 5. Return the new User 
        return updatedUser;
    }
};

module.exports = Mutations;
