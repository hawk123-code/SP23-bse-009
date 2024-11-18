const express = require('express');
let app = express();

app.use(express.static("public"));

app.set("view engine","ejs");

app.get("/contact-us", (req, res) => {
    res.render("contact-us");
});

app.get("/home", (req, res) => {
    res.render("home");
});

app.get("/", (req, res) => {
    res.send("<h1>Hello A Section</h1>");
});

app.get("/updated", (req, res) => {
    res.send("<h1>Hello A Section Updated</h1>");
});

app.listen(5000, () => {
    console.log("Server started at localhost:5000");
});
