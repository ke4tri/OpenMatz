const { random } = require("../utils/random");
// Import models here
// const { User } = require("../models/user.model");

const helloWorld = (req, res) => {
    console.log(`The request message is: ${req.message}`);
    console.log("Random number: ", random(10, 100));
    return res.status(200).send("Hello World!");
};

module.exports = {
    helloWorld,
};
