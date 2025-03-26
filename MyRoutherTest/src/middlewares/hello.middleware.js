const helloMiddleware = (req, res, next) => {
    console.log("Hello Middleware executed and adding message");
    req.message = "Hello from middleware";
    next();
};

module.exports = {
    helloMiddleware,
};
