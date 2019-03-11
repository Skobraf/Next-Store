const Query = {
    dogs(parent, args, ctx, info) {
        return[{name: "snickers"}, {name:"bobi"}]
    }
};

module.exports = Query;
