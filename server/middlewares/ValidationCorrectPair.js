export default (req, res, next) => {
    const { userId, price, pair } = req.body;
    if(!userId || !price || !pair) {
        res.status(400).json({
            errors: 'Some data missed'
        });
        return;
    } else {
        next();
    }
};