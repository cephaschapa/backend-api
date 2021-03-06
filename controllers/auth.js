const crypto = require('crypto')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require("../middleware/async")
const User = require('../models/Users')
const sendEmail = require('../utils/sendEmails')


// @description     Register user
// @route           POST /api/v1/auth/register
// @access          Public


exports.register = asyncHandler(async (req, res, next)=> {
    const user = req.body;

    const userdata = await User.create(user);

    sendTokenResponse(userdata, 200, res);

    res.status(200).json({
        success: true,
        token: token
    })
})

// @description     Login user
// @route           POST /api/v1/auth/login
// @access          Public


exports.login = asyncHandler(async (req, res, next)=> {
    const {email, password} = req.body;

    // Validate email & password
    if(!email || !password){
        return next( new ErrorResponse('Please provide and email and password', 400));
    }

    // Check for user
    const user = await User.findOne({
        email
    }).select('+password')

    if(!user){
        return next( new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if(!isMatch){
        return next( new ErrorResponse('Invalid credentials', 401));
    }

   
    sendTokenResponse(user, 200, res);

})

// @description     Log user out / clear cookie
// @route           GET /api/v1/auth/logout
// @access          Private


exports.logout = asyncHandler(async (req, res, next)=> {
    res.cookie('token', 'none',{
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    
    res.status(200).json({
        success: true,
        data: {}
    })
})


// @description     Get current logged in user
// @route           POST /api/v1/auth/me
// @access          Private

exports.getMe = asyncHandler(async (req, res, next)=>{
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    })
});


// @description     Forgot password
// @route           POST /api/v1/auth/forgotpassword
// @access          Public

exports.forgotPassword = asyncHandler(async (req, res, next)=>{

    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new ErrorResponse('There is no user with that email', 404))
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken()

    await user.save({
        validateBeforeSave:false
    });
 
    // Create reset url
    // const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetpassword/${resetToken}`
    const resetUrl = `http://localhost:5500/forgotpassword.html?resetToken=${resetToken}`

    // Send message
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
    
    try{
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        });
        res.status(200).json({
            success: true,
            data: 'Email sent'
        })
    } catch (err){
        console.log(err)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({
            validateBeforeSave: false
        })

        return next(new ErrorResponse('Email could not be sent', 500))
    }

    res.status(200).json({
        success: true,
        data: user
    })
});

// @description     Reset Password
// @route           PUT /api/v1/auth/resetpasword/:resettoken
// @access          Public
exports.resetPassword = asyncHandler(async (req, res, next)=>{
    // Get hashed token
    let resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now()
        }
    });
    if(!user){
        return next(new ErrorResponse('Invalid token', 400))
    }

    // Set new password
    user.password = req.body.password
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);

    
});

// @description     Update user details
// @route           PUT /api/v1/auth/updatedetails
// @access          Private

exports.updateDetails = asyncHandler(async (req, res, next)=>{
    // console.log('hello')
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
        number: req.body.number
    }
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate,{
        new: true,
        runValidators: true
    });
    if(!user){
        next(new ErrorResponse('User not found', 401))
    }
    res.status(200).json({
        success: true,
        data: user
    })
});

// @description     Update password for current logged in user
// @route           PUT /api/v1/auth/updatepassword
// @access          Private

exports.updatePassword = asyncHandler(async (req, res, next)=>{

    const id = req.params.id
    const currentPassword = req.body.currentPassword
    const newPassword = req.body.newPassword


    const user = await User.findById(id).select('+password');

    // Check current password
    if(!await user.matchPassword(currentPassword)){
        return next(new ErrorResponse('Password is incorrect', 401))
    }
    

    user.password = newPassword
    await user.save()

    sendTokenResponse(user, 200, res)
});


// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res)=>{
    const token = user.getSignedJwtToken(); 

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        })
}
