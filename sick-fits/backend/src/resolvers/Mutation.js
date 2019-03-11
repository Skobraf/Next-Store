const Mutations = {
    async createItem(parent, args, ctx, info) {
        const item = await ctx.db.mutation.createItem({
            data: {
                ...args
            }
        }, info);
        console.log(item);
        return item;
    }
   // createDog(parent, args, ctx, info) {
   //     console.log(args)
   // }
};

module.exports = Mutations;
