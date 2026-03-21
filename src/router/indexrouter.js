const express = require("express")
const productModel = require("../model/productmodel")
const jwt = require("jsonwebtoken")
const cartModel = require("../model/cartmodel");

const router = express.Router()

router.get("/", async (req, res) => {

    const filter = {}

    // ✅ Category filter
    if(req.query.category){
        filter.category = req.query.category
    }

    // ✅ Search filter (NEW)
    if(req.query.search){
        filter.$or = [
            { title: { $regex: req.query.search, $options: "i" } },
            { category: { $regex: req.query.search, $options: "i" } }
        ]
    }

    let sortOption = {}

if(req.query.sort === "low"){
    sortOption.price = 1   // ascending
} else if(req.query.sort === "high"){
    sortOption.price = -1  // descending
}

const products = await productModel.find(filter).sort(sortOption)

    const token = req.cookies.token
    let decode = null

    // ✅ Safe JWT handling (important)
    if(token){
        try {
            decode = jwt.verify(token , "hfdskjasfgksjdfgfdalsdf")
        } catch (err) {
            decode = null
        }
    }
const cartModel = require("../model/cartmodel");

let cartCount = 0;

if(decode){
    const cart = await cartModel.findOne({ userId: decode.id });

    if(cart){
        cartCount = cart.products.length;
    }
}
    res.render("home.ejs", { 
        products: products, 
        decode: decode,
        cartCount: cartCount
    })
})

module.exports = router