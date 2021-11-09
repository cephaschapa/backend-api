const mongoose = require('mongoose')


const BetaSchema = new mongoose.Schema({
    fname:{
        type: String,
        required: [true, 'Please add a firstname']
    },
    lname:{
        type: String,
        required: [true, 'Please add a lastname']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
    },
    optIn: {
        type: Boolean,
        default: false,
        required: [true, 'Please add an opt'],
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals:true}
})



module.exports = mongoose.model('Beta', BetaSchema)