/* eslint-disable object-shorthand */
/* eslint-disable no-undef */
const crypto = require('crypto');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsyncErr = require('./../utils/catchAsyncErr');
const sendEmail = require('./../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_S, {
        expiresIn: process.env.JWT_EXP
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXP * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('JWT', token, cookieOptions);

    // remove password from output
    user.password = undefined;

    res.status(200).json({
        status: 'Success',
        token,
        data: {
            user
        }
    });
}

exports.signup = async(req, res, next) => {
    try{

        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            cpassword: req.body.cpassword,
            mode: 'Light'
        });
        
        createSendToken(newUser, 201, res);

    } catch(err){
        res.status(400).json({
            status: 'Failed',
            message: err
        })
    }

}

exports.login = catchAsyncErr(async(req, res, next) => {
    const {email,password} = req.body;

    if(!email || !password){
        return next(new AppError('Email and Password required.', 400))
    }

    const user = await User.findOne({email}).select('+password') //'+' because password has 'select: false' in Model

    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError('Incorrect email or password', 401))//401 = Unauthorised
    }
    createSendToken(user, 200, res);
})

exports.logout = (req, res) => {
    res.cookie('JWT', 'Logged Out', {
        expires: new Date(Date.now() + 500),
        httpOnly: true
    });
    res.status(200).json({status: 'Success'});
}

exports.interceptProject = async(req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }

    //Validate Token
    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);

    const currentUser = await User.findById(decode.id);
    
    if(currentUser.groupcode === ""){
        res.status(200).render('noproject', {
            title: 'No Project'
        })
        return next(new AppError('No projects.', 401));
    }
    next();
}

exports.protect = catchAsyncErr(async (req, res, next) => {
    //Get Token
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }

    if(!token) {
        res.status(200).render('loginerror', {
            title: 'Error'
        })
        return next(new AppError('You are not logged in.', 401));
    }

    //Validate Token
    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);

    //See if user still exists
    const currentUser = await User.findById(decode.id);
    if(!currentUser){
        return next(new AppError('User with token does not exist',401));
    }

    //See if user has modified password after JWT issued
    if(currentUser.changedPasswordAfter(decode.iat)){
        return next(new AppError('User has changed password. Login again.', 401))
    }
    
    //Give access to protected route
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

// Only for rendered pages, no errors
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.JWT) {
      try {
        // 1) verify token
        const decode = await promisify(jwt.verify)(
          req.cookies.JWT,
          process.env.JWT_S
        );
  
        // 2) Check if user still exists
        const currentUser = await User.findById(decode.id);
        if (!currentUser) {
          return next();
        }
  
        // 3) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decode.iat)) {
          return next();
        }
  
        // THERE IS A LOGGED IN USER
        res.locals.user = currentUser;
        res.status(200).render('overview', {
            title: 'Overview'
        })
        return next();
      } catch (err) {
        return next();
      }
    }
    next();
};
  

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError('Insufficient Permissions', 403));//403 = Forbidden
        }
        next();
    }
};

exports.forgotPassword = catchAsyncErr(async(req, res, next) => {
    //get user
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new AppError('There is no user with this email address', 404));
    }
    //create random token
    const rToken = user.createResetPasswordToken();

    await user.save({validateBeforeSave: false});
    //send to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/1/users/resetPassword/${rToken}`;

    const message = `Forgot your password?\n\nChange your password at ${resetURL}.\n\nIf you didn't choose to change your password, please ignore this email.`;
    
    try {
        await sendEmail({
          email: user.email,
          subject: 'Vulture | Password Reset',
          message
        });
    
        res.status(200).json({
          status: 'Success',
          message: 'Token Sent'
        });

    
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});
    
        return next(new AppError('There was a problem sending the email. Try again later.'),500);
    }
});
    

exports.resetPassword = catchAsyncErr(async(req, res, next) => {
    //get user from token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        passwordRToken: hashedToken,
        passwordRExp: {$gt: Date.now()}
    });
    //check token expired, set new password
    if(!user){
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.cpassword = req.body.cpassword;
    user.passwordRToken = undefined;
    user.passwordRExp = undefined;
    await user.save();
    //update model

    //login user
    createSendToken(user, 200, res);

});

exports.updatePassword = catchAsyncErr(async(req, res, next) => {
    //get user
    const user = await User.findById(req.user.id).select('+password');
    //check is given password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('Current password is incorrect', 401))
    }
    //update password
    user.password = req.body.password;
    user.cpassword = req.body.cpassword;
    await user.save();
    //findbyidandupdate will not work
    //login user, send jwt
    createSendToken(user, 200, res)

});