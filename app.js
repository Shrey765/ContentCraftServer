console.log("--- APP.JS FILE WAS RELOADED SUCCESSFULLY ---");

import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()

// middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || true, // dev-friendly
    credentials: true
}))
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(express.static('public'))
app.use(cookieParser())

// routes
import router from './routes/user.routes.js'
app.get('/', (_req, res) => res.send('<h1>Server root is alive</h1>')) // optional, helpful in dev

app.use('/api/v1/users', router)

// fix: res.send takes ONE argument. Use a template string:
app.get('/api/v1/status', (req, res) => {
    res.send(`server is live at port ${process.env.PORT || 3000}`)
})



export default app
