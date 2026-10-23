// const express = require("express");
// const ImageKit = require("imagekit");
// const multer = require("multer");
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
// const productModel = require("../model/productmodel")


// const router = express.Router();

// // detail/174396959435698324

// router.get("/detail/:id", async (req, res)=>{
//     const productId = req.params.id

//     const product = await productModel.findById(productId)

//   res.render("productDetail.ejs" , {product : product})

// })

// router.get("/update/:id", async(req,res)=>{

//   const productId = req.params.id

//   const product = await productModel.findById(productId)

//   res.render("productUpdate.ejs", {product : product})
// })


// router.post("/update/:id", upload.single("image") ,async (req, res)=>{
//   const {title , description , category , price  } = req.body

//   const productId = req.params.id


//   await productModel.findByIdAndUpdate(productId , {
//     title : title,
//     description : description,
//     category : category,
//     price : price
//   })



//   res.redirect(`/products/detail/${productId}`)

// })


// router.get("/delete/:id", async(req,res )=>{
//   const productId = req.params.id

//   await productModel.findByIdAndDelete(productId)

//   res.redirect("/")
// })

// router.get("/add", (req, res) => {
//   res.render("productForm");
// });

// router.post("/add", upload.single("image"), async(req, res) => {
//   const {title , description , category , price  } = req.body


  
  
//   var imagekit = new ImageKit({
//     // publicKey: "public_M0PAK4NmC1d2995cVHB6hjiBgaE=",
//     // privateKey : "private_KT7FkfaTOTLNy6lVG+V7iKE2ba4=",
//     // urlEndpoint: "https://ik.imagekit.io/ls436o8px",
//     publicKey: process.env.PUBLIC_KEY,
//     privateKey : process.env.PRIVATE_KEY,
//     urlEndpoint: process.env.URLENDPOINT,

//   });



//   const result = await imagekit.upload({
//     file : req.file.buffer,
//     fileName : req.file.originalname,
//     isPublished  : true,
//     isPrivateFile : false
//   })

//   console.log("result :",result);
  
//   const imageUrl = result.url


//   const product =  await productModel.create({
//     title : title,
//     description : description,
//     category : category,
//     price : price ,
//     image : imageUrl
//   })


//   res.redirect("/");
// });




// module.exports = router;
const jwt = require("jsonwebtoken");
const express = require("express");
const ImageKit = require("imagekit");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const productModel = require("../model/productmodel");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// =================== AI SMART SEARCH ROUTE ===================
router.get("/search", async (req, res) => {
  // User login status aur cart count handle karne ke liye
  let decode = null;
  let cartCount = 0;
  if (req.cookies && req.cookies.token) {
    try {
      decode = jwt.verify(req.cookies.token, process.env.JWT_SECRET || "secret");
    } catch (e) {
      decode = null;
    }
  }

  try {
    const searchQuery = req.query.q || req.query.search;

    if (!searchQuery || !searchQuery.trim()) {
      return res.redirect("/");
    }

    // 1. Gemini AI prompt
    const prompt = `
      You are an e-commerce assistant. A user is searching for: "${searchQuery}".
      Store categories: ["Beauty", "Groceries", "Electronics", "Clothing", "Footwear"].

      Analyze the search intent and return ONLY a valid JSON object without markdown or extra text:
      {
        "keyword": "core product keyword or empty string",
        "category": "matched category or null",
        "maxPrice": number or null
      }
    `;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleaned = aiResponse.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    // 2. Build MongoDB Query
   // 2. Build MongoDB Query (Flexible Matching)
    const conditions = [];

    if (parsed.keyword) {
      conditions.push({
        $or: [
          { title: { $regex: parsed.keyword, $options: "i" } },
          { description: { $regex: parsed.keyword, $options: "i" } }
        ]
      });
    }

    if (parsed.category) {
      conditions.push({
        category: { $regex: new RegExp(parsed.category, "i") }
      });
    }

    const dbQuery = conditions.length > 0 ? { $or: conditions } : {};

    if (parsed.maxPrice) {
      dbQuery.price = { $lte: parsed.maxPrice };
    }

    const products = await productModel.find(dbQuery);

    // home.ejs render with decode and cartCount
    res.render("home.ejs", { 
      products: products, 
      searchQuery: searchQuery,
      decode: decode,
      cartCount: cartCount
    });
  } catch (error) {
    console.error("AI Search Error:", error);

    // Fallback: Agar AI me error aaye toh basic search
    const fallbackProducts = await productModel.find({
      title: { $regex: req.query.q || req.query.search || "", $options: "i" }
    });
    res.render("home.ejs", { 
      products: fallbackProducts, 
      searchQuery: req.query.q,
      decode: decode,
      cartCount: cartCount
    });
  }
});
// =============================================================

// detail/:id
router.get("/detail/:id", async (req, res) => {
  const productId = req.params.id;
  const product = await productModel.findById(productId);
  res.render("productDetail.ejs", { product: product });
});

router.get("/update/:id", async (req, res) => {
  const productId = req.params.id;
  const product = await productModel.findById(productId);
  res.render("productUpdate.ejs", { product: product });
});

router.post("/update/:id", upload.single("image"), async (req, res) => {
  const { title, description, category, price } = req.body;
  const productId = req.params.id;

  await productModel.findByIdAndUpdate(productId, {
    title: title,
    description: description,
    category: category,
    price: price
  });

  res.redirect(`/products/detail/${productId}`);
});

router.get("/delete/:id", async (req, res) => {
  const productId = req.params.id;
  await productModel.findByIdAndDelete(productId);
  res.redirect("/");
});

router.get("/add", (req, res) => {
  res.render("productForm");
});

router.post("/add", upload.single("image"), async (req, res) => {
  const { title, description, category, price } = req.body;

  var imagekit = new ImageKit({
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY,
    urlEndpoint: process.env.URLENDPOINT,
  });

  const result = await imagekit.upload({
    file: req.file.buffer,
    fileName: req.file.originalname,
    isPublished: true,
    isPrivateFile: false
  });

  console.log("result :", result);
  const imageUrl = result.url;

  await productModel.create({
    title: title,
    description: description,
    category: category,
    price: price,
    image: imageUrl
  });

  res.redirect("/");
});

module.exports = router;