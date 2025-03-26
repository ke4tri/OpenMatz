const express = require("express");
const { helloWorld } = require("../controllers/user.controller");
const { helloMiddleware } = require("../middlewares/hello.middleware");
const router = express.Router();

router.get("/", helloMiddleware, helloWorld);

module.exports = router;
