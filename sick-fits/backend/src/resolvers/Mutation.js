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
    }
};

module.exports = Mutations;
