require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.get("/", (req, res) => {
    res.send("<h1 style='text-align: center; font-size: 50px'>Hello World!</h1>");
});

app.use("/api/user", require("./routes/user.routes"));

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Internal Server Error");
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
