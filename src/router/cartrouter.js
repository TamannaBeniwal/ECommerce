const express = require("express");
const router = express.Router();
const cartModel = require("../model/cartmodel");
const productModel = require("../model/productmodel");
const jwt = require("jsonwebtoken");

// middleware
function isLoggedIn(req, res, next){
    const token = req.cookies.token;
    if(!token){
        return res.redirect("/users/login");
    }

    try {
        const data = jwt.verify(token, "hfdskjasfgksjdfgfdalsdf");
        req.user = data;
        next();
    } catch (err){
        return res.redirect("/users/login");
    }
}

// add to cart
router.get("/add/:id", isLoggedIn, async (req, res) => {
    const userId = req.user.id;
    const productId = req.params.id;

    let cart = await cartModel.findOne({ userId });

    if(!cart){
        cart = await cartModel.create({
            userId,
            products: [{ productId, quantity: 1 }]
        });
    } else {
        const index = cart.products.findIndex(p => p.productId == productId);

        if(index > -1){
            cart.products[index].quantity += 1;
        } else {
            cart.products.push({ productId, quantity: 1 });
        }

        await cart.save();
    }

    res.redirect("/cart");
});



router.get("/remove/:id", async (req, res) => {
    const token = req.cookies.token;

    const data = require("jsonwebtoken").verify(token, "hfdskjasfgksjdfgfdalsdf");

    const cart = await cartModel.findOne({ userId: data.id });

    cart.products = cart.products.filter(
        item => item.productId != req.params.id
    );

    await cart.save();

    res.redirect("/cart");
});

// view cart
router.get("/", isLoggedIn, async (req, res) => {
    const cart = await cartModel.findOne({ userId: req.user.id }).populate("products.productId");

    res.render("cart.ejs", { cart });
});

module.exports = router;

router.get("/checkout", (req, res) => {
    res.render("checkout.ejs");
});

router.post("/place-order", async (req, res) => {
    const token = req.cookies.token;
    const jwt = require("jsonwebtoken");

    const data = jwt.verify(token, "hfdskjasfgksjdfgfdalsdf");

    // ✅ Clear cart
    await cartModel.findOneAndDelete({ userId: data.id });

    res.render("success.ejs");
});