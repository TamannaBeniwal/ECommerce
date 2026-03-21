
const mongoose = require("mongoose");

const connect = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/ecommerce");
        console.log("MongoDB Connected ");
    } catch (err) {
        console.log("DB Error:", err);
    }
};

module.exports = connect;