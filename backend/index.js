const express = require('express');
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));


app.get("/campus-connect", (req,res)=>{
    res.send("Main page of campus connect");
});

app.get("/campus-connect/viit", (req,res)=>{
    res.send("Page with vignan header and two cards for student/faculty");
});

app.get("/campus-connect/viit/studentlogin", (req,res)=>{
    res.render("slogin");
});

app.get("/campus-connect/viit/facultylogin", (req,res)=>{
    res.render("flogin");
});

app.get("/campus-connect/viit/contact-admin.html", (req,res)=>{
    res.render("admin");
});

app.listen(port, ()=>{
    console.log(`Listening at port ${port} on http://localhost:3000`);
});