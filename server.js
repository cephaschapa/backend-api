const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const logger = require('./middleware/logger')
const morgan = require('morgan')
const colors = require('colors')
const errorHandler = require('./middleware/error')
const connectDB = require('./config/db')
const fileupload = require('express-fileupload')
const coockieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const expressRateLimit = require('express-rate-limit')
const hpp = require('hpp') 
const cors = require('cors')
// const session = require('express-session')
// Load variables

dotenv.config({path: './config/config.env'})

// Connect to database
connectDB();

const app = express()

//  Body parser
app.use(express.json())

// Devlogging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

// Session
// app.use(session({
//     secret: process.env.COOKIE_SECRET,
//     resave: false,
//     saveUninitialized: false
// }))

// File uploading
app.use(fileupload())

// Sanitize Data
app.use(mongoSanitize())

// Set security headers
app.use(helmet())

// Prevent Crossite Scripting XSS attacks
app.use(xss())

// Rate limiting
const limiter = expressRateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100
})

app.use(limiter)

// Prevent http param polution
app.use(hpp())

// Enable CORS
app.use(cors())

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// Cookie Parser
app.use(coockieParser()) 

// Import Routes
const auth = require('./routes/auth')
const users = require('./routes/users')
const beta = require('./routes/beta')

// Mount routers
app.use(logger)
app.use('/api/v1/auth', auth)
app.use('/api/v1/users', users)
app.use('/api/v1/betas', beta)

// Error handler 
app.use(errorHandler)

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode in port ${PORT}`.yellow.bold))

// Hanl unhandled preomise rejections
process.on('unhandledRejection', (err,promise)=>{
    console.log(`Error: ${err.message}`.red)
    // Close server and exit process
    server.close(()=>process.exit(1))
})