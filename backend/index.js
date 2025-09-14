const express = require('express');
const path = require("path");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.static("public"));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Swati@2706",
  database: "campus_connect"
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL Connected...");
});

app.get("/", (req,res)=>{
    res.sendFile(path.join(__dirname, "../frontend/landing.html"));
});


app.get("/campus-connect", (req,res)=>{
    res.sendFile(path.join(__dirname, "../frontend/landing.html"));
});

app.get("/campus-connect/viit", (req,res)=>{
    res.send("Page with vignan header and two cards for student/faculty");
});

app.get("/campus-connect/viit/studentlogin", (req,res)=>{
    res.render("slogin");
});

app.post("/campus-connect/viit/studentlogin", (req, res) => {
  const { regNo, password } = req.body;
  db.query("SELECT * FROM students WHERE reg_no = ?", [regNo], async (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.send("Invalid registration number");
    }

    const user = results[0];
    if (password !== user.password) {
        return res.send("Invalid password");
    }

    res.send("Login successful! Welcome " + user.name);
    });
});


app.get("/campus-connect/viit/facultylogin", (req,res)=>{
    res.render("flogin");
});

app.listen(port, ()=>{
    console.log(`Listening at port ${port} on http://localhost:3000`);
});