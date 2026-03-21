require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = require("./src/app");

const PORT = process.env.PORT || 3000;


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");
    } catch (err) {
        console.log("DB Error:", err);
        process.exit(1);
    }
};

connectDB();

app.listen(PORT, () => {
    console.log("SERVER IS RUNNING ON PORT:", PORT);
});