import express from 'express'
import "dotenv/config";
import connectDB from "./src/db/index.js"
import app from './app.js';


const port = process.env.PORT || 8000;

connectDB()
.then(() => {
    app.listen(port, () => {
        console.log(`Server listening on port ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.log("server connection failed !!!", error);
    throw error
})