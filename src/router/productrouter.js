const express = require("express");
const ImageKit = require("imagekit");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const productModel = require("../model/productmodel")


const router = express.Router();

// detail/174396959435698324

router.get("/detail/:id", async (req, res)=>{
    const productId = req.params.id

    const product = await productModel.findById(productId)

  res.render("productDetail.ejs" , {product : product})

})

router.get("/update/:id", async(req,res)=>{

  const productId = req.params.id

  const product = await productModel.findById(productId)

  res.render("productUpdate.ejs", {product : product})
})


router.post("/update/:id", upload.single("image") ,async (req, res)=>{
  const {title , description , category , price  } = req.body

  const productId = req.params.id


  await productModel.findByIdAndUpdate(productId , {
    title : title,
    description : description,
    category : category,
    price : price
  })



  res.redirect(`/products/detail/${productId}`)

})


router.get("/delete/:id", async(req,res )=>{
  const productId = req.params.id

  await productModel.findByIdAndDelete(productId)

  res.redirect("/")
})

router.get("/add", (req, res) => {
  res.render("productForm");
});

router.post("/add", upload.single("image"), async(req, res) => {
  const {title , description , category , price  } = req.body


  
  
  var imagekit = new ImageKit({
    // publicKey: "public_M0PAK4NmC1d2995cVHB6hjiBgaE=",
    // privateKey : "private_KT7FkfaTOTLNy6lVG+V7iKE2ba4=",
    // urlEndpoint: "https://ik.imagekit.io/ls436o8px",
    publicKey: process.env.PUBLIC_KEY,
    privateKey : process.env.PRIVATE_KEY,
    urlEndpoint: process.env.URLENDPOINT,

  });



  const result = await imagekit.upload({
    file : req.file.buffer,
    fileName : req.file.originalname,
    isPublished  : true,
    isPrivateFile : false
  })

  console.log("result :",result);
  
  const imageUrl = result.url


  const product =  await productModel.create({
    title : title,
    description : description,
    category : category,
    price : price ,
    image : imageUrl
  })


  res.redirect("/");
});




module.exports = router;