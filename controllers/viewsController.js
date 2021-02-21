// const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsyncErr = require('../utils/catchAsyncErr');
const AppError = require('../utils/appError');

exports.sendToChat = (req, res) => {
    res.status(200).render('chat', {
        title: 'Chat'
    })
}

exports.sendToMarkers = (req, res) => {
    res.status(200).render('markers', {
        title: 'Markers'
    })
}

exports.sendToAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Account'
    })
}

exports.sendToProjects = (req,res) => {
    res.status(200).render('projects', {
        title: 'My Projects'
    })
}

exports.sendToSettings = (req,res) => {
    res.status(200).render('settings', {
        title: 'Settings'
    })
}

exports.noProject = (req,res) => {
    res.status(200).render('noproject', {
        title: 'No Project'
    })
}

exports.sendToCreate = (req,res) => {
    res.status(200).render('create', {
        title: 'Create'
    })
}

exports.sendToMembers = (req,res) => {
    res.status(200).render('members', {
        title: 'Members'
    })
}
exports.sendToVisual = (req,res) => {
    res.status(200).render('visual', {
        title: 'Visual'
    })
}

exports.sendToDash = (req,res) => {
    res.status(200).render('overview', {
        title: 'Overview'
    })
}

exports.sendToAction = (req,res) => {
    res.status(200).render('action', {
        title: 'Action'
    })
}

exports.sendToJoin = (req,res) => {
    res.status(200).render('join', {
        title: 'Join'
    })
}

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Login'
    })
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your Account'
    })
}

exports.sendToRegister = (req, res) => {
    res.status(200).render('register', {
        title: 'Register'
    })
}

exports.updateUserData = catchAsyncErr(async(req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
            name: req.body.name,
            email: req.body.email
        },
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser
    })
    
})