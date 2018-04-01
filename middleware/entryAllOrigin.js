// 让所有的都可以登录
exports.entryAllOrigin = function (req, res, next) {
    // 允许所有的非同源进行访问
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    next()
    // check header or url parameters or post parameters for token
}