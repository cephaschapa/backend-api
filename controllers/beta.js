const asyncHandler = require("../middleware/async")
const Beta = require("../models/Beta")
const ErrorResponse = require("../utils/errorResponse")
var MY_SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);


exports.addBeta = asyncHandler(async(req, res, next)=>{

    const data = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        phone: req.body.phone,
        optIn: req.body.optIn
    }
    const query = await Beta.create(data)

    if(query){
        slack.success(`New signin from ${req.body.fname} ${req.body.lname}`);
        // console.log(query)
    }else{
        slack.bug('Something bad happened!');
    }

    res.status(201).json(
        {
            success: true,
            data: query
        }
    )
})
exports.getBetas = asyncHandler(async(req, res, next)=>{
    const query = await Beta.find()

    res.status(200).json({
        success: true,
        data: query
    })
})

// // update block
// exports.updateBeta = asyncHandler(async (req, res, next)=> {

//     const data = req.body

//     const blog = await Blogs.findByIdAndUpdate(req.params.id,data,{
//         new: true,
//         runValidators: true
//     })

//     res.status(200).json(
//         {
//             success: true,
//             data: blog
//         }
//     )
// })

// @description     Get single users
// @route           GET /api/v1/users/:id
// @access          Private/Admin


// exports.getBeta= asyncHandler(async (req, res, next)=> {
    
//     const blog = await Blogs.findById(req.params.id)

//     res.status(200).json(
//         {
//             success: true,
//             data: blog
//         }
//     )
// })

// @description     Delete user
// @route           DELETE /api/v1/users/:id
// @access          Private/Admin

// exports.deleteBlog = asyncHandler(async (req, res, next)=> {
//     await Blogs.findByIdAndDelete(req.params.id)
//     res.status(200).json(
//         {
//             success: true,
//             data: {}
//         }
//     )
// })




