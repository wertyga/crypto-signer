export default (needFieldsArr, model) => { // Collect model result with need fields
    // if(!(model instanceof Array)) model = [model];
    return needFieldsArr.reduce((obj, item) => {
        if(model[item]) obj[item] = model[item];

        return obj;
    }, {});
};