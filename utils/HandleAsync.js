// function to handle asynchronous errors from mongodb
const HandleAsync = (fnc) => {
    return (req, res, next) => {
        fnc(req, res, next).catch(e => next(e));
    }
}
module.exports = HandleAsync;