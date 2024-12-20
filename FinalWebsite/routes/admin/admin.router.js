const express=require('express');
const bcrypt=require('bcrypt');
const session=require('express-session');
const Admin=require("../../models/admin");
const router=express.Router();


//these are the two middle wares that will be used

router.use(session({
    secret: 'my-secret-key', 
    resave: false,
    saveUninitialized: true,
}));


function isAuthenticated(req, res, next) {
    if (req.session && req.session.admin) {
        return next();
    }
    return res.redirect('/admin/login');
}

router.get("/admin/register",(req,res)=>{
    res.render("register",{ layout: false});
});

router.post("/admin/register",async (req,res)=>{
    const {username,password}=req.body;

    const existing=await Admin.findOne({username});

    if (existing){
        return res.send('Username already exist')
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: hashedPassword });
    await newAdmin.save();

    res.redirect('/admin/login');
});

router.get('/admin/login', (req, res) => {
    res.render('login', { layout: false }); // Create admin-login.ejs
});

router.post("/admin/login",async (req,res)=>{
    const {username,password}=req.body;

    const admin= await Admin.findOne({username});
    if(!admin){
        return res.send('Invalid username or password')
    }

    const password_validation= await bcrypt.compare(password,admin.password)

    if(!password_validation){
        return res.send("Invalid password");
    }

    req.session.admin = admin;
    res.redirect('/views/category');
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = {
    router,  
    isAuthenticated  
};



