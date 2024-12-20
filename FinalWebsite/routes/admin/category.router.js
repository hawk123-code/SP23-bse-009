const express = require("express");
let router = express.Router();
let multer = require("multer");
let categorize = require("../../models/category_schema");
let categorizing = require("../../models/category-selection-form");
let orders=require("../../models/Order");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // Directory to store files
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
  },
});
const upload = multer({ storage: storage });


router.get("/views/category/delete/:id", async (req, res) => {
    await categorize.findByIdAndDelete(req.params.id);
    return res.redirect("back");
  });

  router.get("/views/category/edit/:id", async (req, res) => {
    let selection= await categorizing.find();
    let categories = await categorize.findById(req.params.id);
    return res.render("category-form", {
      selection,
      categories,
      layout: "category-form-layout",
    });
  });
  router.post("/views/category/edit/:id",upload.single("file"),async (req, res) => {
    let categories = await categorize.findById(req.params.id);
    categories.category = req.body.category;
    categories.product=req.body.product;
    categories.price=req.body.price;
    categories.description=req.body.description;
    categories.quantity=req.body.quantity;
    if (req.file) categories.picture = req.file.filename;
    await categories.save();
    return res.redirect("/views/category");
  });
  
  


router.get("/views/category/category-form", async (req, res) => {
    let selection= await categorizing.find();
    res.render("category-form",{layout:"category-form-layout",selection});
  });

  
router.post("/views/category/category-form",
  upload.single("file"),
  async (req, res) => {
    let newProduct = new categorize(req.body);
    if (req.file) newProduct.picture = req.file.filename;
    await newProduct.save();
    return res.redirect("/views/category");
  });
  
  router.get("/views/category/category-form-selction", (req, res) => {
    res.render("category-selection-form",{layout:"category-form-layout"});
  });

  router.post("/views/category/category-form-selction", async (req, res) => {
    let newProduct = new categorizing(req.body);
    await newProduct.save();
    return res.redirect("/views/category");
  });

  router.get("/views/category/orders",async(req,res)=>{
    let findings=await orders.find();
    res.render("orders",{findings});
  })
  module.exports = router;