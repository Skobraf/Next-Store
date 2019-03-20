const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutations = {
    async createItem(parent, args, ctx, info) {
        const item = await ctx.db.mutation.createItem({
            data: {
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
                permissoins: { set: ['USER']},
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
        return user;
    }
};

module.exports = Mutations;
