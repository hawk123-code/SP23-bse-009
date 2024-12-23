const express = require('express');
let app = express();


let category = require("./models/category_schema");
let categorizing = require("./models/category-selection-form");
app.use(express.static("public"));
app.use(express.static("uploads"));

app.set("view engine","ejs");


var expressLayouts = require("express-ejs-layouts");

app.use(expressLayouts);

const mongoose = require('mongoose');

app.use(express.urlencoded({ extended: true }));

const { router, isAuthenticated } = require('./routes/admin/admin.router');

app.use(router); 

const cookieParser=require("cookie-parser");
const expressSession=require("express-session");

app.use(cookieParser());
app.use(expressSession({secret:"My session secret"}));

app.get("/", async (req, res) => {
  let categories = await category.find();
  let selection= await categorizing.find();
  res.render("home", { categories,selection});
});

app.get("/add-to-cart/:id", (req, res) => {
  let cart = req.cookies.cart;
  console.log("Initialcart:",cart)
  if (cart && typeof cart === 'string') {
    cart = cart.trim(); 
    console.log("Trimmed cart",cart);
    try {
      cart = JSON.parse(cart);
    } catch (err) {
      console.error("Error parsing cart JSON:", err.message);
      cart = []; 
    }
  } else {
    cart = [];
  }
  console.log("Current Cart:", cart);
  let productIndex = cart.findIndex((item) => item.id === req.params.id);
  if (productIndex !== -1) {
    cart[productIndex].quantities += 1;
  } else {
    cart.push({ id: req.params.id, quantities: 1 });
  }
  res.cookie("cart", JSON.stringify(cart));
  res.redirect("/");
});


app.get("/cart", async (req, res) => {
  let cart = req.cookies.cart;
  if (cart && typeof cart === 'string') {
    cart = cart.trim(); 
    try {
      cart = JSON.parse(cart);
    } catch (err) {
      console.error("Error parsing cart JSON:", err.message);
      cart = [];
    }
  } else {
    cart = [];
  }
    let productIds = cart.map((item) => item.id);
  let products = await category.find({ _id: { $in: productIds } });
  
  let cartProducts = products.map((product) => {
    let cartItem = cart.find((item) => item.id === product._id.toString());
    return {
      ...product.toObject(), 
      quantities: cartItem ? cartItem.quantities : 0,
    };
  });
console.log("Cartproducts:",cartProducts);
  return res.render("cart", { products: cartProducts });
});

app.post("/update-quantity/:id", (req, res) => {
  let cart = req.cookies.cart;
  if (cart && typeof cart === 'string') {
    cart = cart.trim(); 
    try {
      cart = JSON.parse(cart);
    } catch (err) {
      console.error("Error parsing cart JSON:", err.message);
      cart = []; 
    }
  } else {
    cart = [];
  }

  
  let productIndex = cart.findIndex((item) => item.id === req.params.id);

  if (productIndex !== -1) {
   
    cart[productIndex].quantities = parseInt(req.body.quantity, 10); // Convert string to integer
  }
  

  res.cookie("cart", JSON.stringify(cart));
  res.redirect("/cart"); 
});

  app.get("/checkout", async (req, res) => {
    let cart = req.cookies.cart;
    if (cart && typeof cart === 'string') {
      cart = cart.trim();
      try {
        cart = JSON.parse(cart);
      } catch (err) {
        console.error("Error parsing cart JSON:", err.message);
        cart = []; 
      }
    } else {
      cart = [];
    }
      let productIds = cart.map((item) => item.id);
    let products = await category.find({ _id: { $in: productIds } });
    
    let cartProducts = products.map((product) => {
      let cartItem = cart.find((item) => item.id === product._id.toString());
      return {
        ...product.toObject(), 
        quantities: cartItem ? cartItem.quantities : 0,
      };
    });
  console.log("Cartproducts:",cartProducts);
    return res.render("checkout", { products: cartProducts });
  });


  const Order = require('./models/Order'); 

app.post("/confirm-order", async (req, res) => {
  let cart = req.cookies.cart;

  if (cart && typeof cart === "string") {
    try {
      cart = JSON.parse(cart.trim());
    } catch (err) {
      console.error("Error parsing cart JSON:", err.message);
      return res.status(400).send("Invalid cart data.");
    }
  } else {
    return res.status(400).send("Cart is empty.");
  }

  if (!cart.length) {
    return res.redirect("/cart"); 
  }

  let productIds = cart.map((item) => item.id);
  let products = await category.find({ _id: { $in: productIds } });


  let orderDetails = cart.map((cartItem) => {
    let product = products.find((p) => p._id.toString() === cartItem.id);
    if (!product) return null;

    return {
      productId: product._id,
      productName: product.product,
      quantity: cartItem.quantities,
      price: product.price,
      total: product.price * cartItem.quantities,
    };
  }).filter(Boolean);


  let totalAmount = orderDetails.reduce((sum, item) => sum + item.total, 0);


  const newOrder = new Order({
    items: orderDetails,
    totalAmount,
    orderDate: new Date(),
    user: req.user ? req.user._id : null, 
  });

  await newOrder.save();

  res.clearCookie("cart");


  res.render("order-success", {
    order: newOrder,
    orderDetails,
    totalAmount,
  });
});



app.get("/views/category",isAuthenticated, async (req, res) => {
  let page = req.query.page ? Number(req.query.page) : 1;
  let pageSize = 2;
  let categories = await category.find()
    .limit(pageSize)
    .skip((page - 1) * pageSize);
  
  let totalRecords = await category.countDocuments();
  let totalPages = Math.ceil(totalRecords / pageSize);
  

  
  res.render("category", {
    layout: "category-form-layout",
    categories,
    //selection,
    page,
    totalRecords,
    totalPages
  });
});


app.get("/search", async (req, res) => {
    res.render("search"); 
});

app.post("/search", async (req,res)=>{
  const searchQuery = req.body.query;
  console.log("Search Query:", searchQuery); 
  try {

    const results = await category.find({ 
      product: { $regex: searchQuery, $options: "i" } 
    }) 
    console.log("results:",results);

    res.render("search-results", { categories: results }); // Render the same category page with filtered results
  } catch (err) {
    console.error(err);
    res.status(500).send("Error occurred while searching.");
  }

});

app.post("/sortbyprice", async (req,res)=>{
  let prices=req.body.query;
  console.log("findings results:",prices)
  let findings=await category.find({ price: { $in: prices } })
  console.log("check:", findings);
  findings.sort((a,b)=> a.price-b.price);
  console.log("sorted:",findings);
  res.render("sortbyprice",{findings});
})

app.get("/filter",async (req,res)=>{
  let findings=await categorizing.find();
  res.render("filter",{findings});
});

app.post("/filter",async (req,res)=>{
  let input=req.body.category;
  console.log("category",input);
  let findings=await category.find({category: {$in: input }});
  console.log("findings:",findings);
  res.render("filterby_Category",{findings});
});




let categoryRouter = require("./routes/admin/category.router");
app.use(categoryRouter);


let connectionString = "mongodb://localhost:27017/sp23-bse-a";
mongoose.connect(connectionString).then(() => {
    console.log(`Connected To: ${connectionString}`);
  })
  .catch((err) => {
    console.log(err.message);
  });


app.listen(5001, () => {
    console.log("Server started at localhost:5001");
});




