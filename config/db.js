const mongoose = require('mongoose')

const connectDB = async () =>{
   try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser:true,
        useCreateIndex:true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold)
   } catch (error) {
       console.error(error.message)
   }
}
module.exports = connectDB