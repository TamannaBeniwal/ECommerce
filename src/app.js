const express = require("express")
const indexRouter = require("./router/indexrouter.js")
const productRouter = require("./router/productrouter.js")
const userRouter = require("./router/userrouter.js")
const cookieParser = require("cookie-parser")
const cartRouter = require("./router/cartrouter");

require('dotenv').config()

const path = require("path")
const app = express()


app.use(cookieParser())


app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views")); 
app.use(express.static(path.join(__dirname , "../public")))
app.use(express.json())
app.use(express.urlencoded({extended : true}))



app.use("/", indexRouter)
app.use("/products", productRouter)
app.use("/users",userRouter)
app.use("/cart", cartRouter);


module.exports = app