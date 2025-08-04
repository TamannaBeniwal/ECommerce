const express = require("express")
const productModel = require("../models/product.model")
const jwt = require("jsonwebtoken")

const router = express.Router()

router.get("/", async (req, res)=>{


    const filter = {}

    if(req.query.category){
        filter.category = req.query.category
    }


    const products = await productModel.find(filter)

    const token = req.cookies.token

    let decode = null

    if(token){
        decode = jwt.verify(token ,  "hfdskjasfgksjdfgfdalsdf" )
    }

    
    

    res.render("home.ejs", { products : products , decode : decode})
})





module.exports = router