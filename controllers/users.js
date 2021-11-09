const asyncHandler = require("../middleware/async")
const User = require('../models/Users')

// @description     Get all users
// @route           GET /api/v1/users
// @access          Private/Admin


exports.getUsers = asyncHandler(async (req, res, next)=> {
    
    // const data = await User.find()

    res.status(200).json(
        res.advancedResults
    )
})


// @description     Get single users
// @route           GET /api/v1/users/:id
// @access          Private/Admin


exports.getUser = asyncHandler(async (req, res, next)=> {
    
    const user = await User.findById(req.params.id)

    res.status(200).json(
        {
            success: true,
            data: user
        }
    )
})

// @description     Create user
// @route           POST /api/v1/users
// @access          Private/Admin


exports.createUser = asyncHandler(async (req, res, next)=> {
    const credentials = {
        name: req.body.name,
        email: req.body.email,
        password:req.body.email,
    }
    const query = await User.create(credentials)

    res.status(201).json(
        {
            success: true,
            data: query
        }
    )
})


// @description     Update user
// @route           PUT /api/v1/users/:id
// @access          Private/Admin

exports.updateUser = asyncHandler(async (req, res, next)=> {

    const credentials = req.body

    const user = await User.findByIdAndUpdate(req.params.id,credentials,{
        new: true,
        runValidators: true
    })

    res.status(200).json(
        {
            success: true,
            data: user
        }
    )
})


// @description     Delete user
// @route           DELETE /api/v1/users/:id
// @access          Private/Admin

exports.deleteUser = asyncHandler(async (req, res, next)=> {

    await User.findByIdAndDelete(req.params.id)

    res.status(200).json(
        {
            success: true,
            data: {}
        }
    )
})