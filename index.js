import express from 'express'
import "dotenv/config";
import connectDB from "./src/db/index.js"

const app = express()

app.get('/', (req, res) => {
    res.send("Hello World");
})

app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`)
})

connectDB();