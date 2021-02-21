const User = require('./../models/userModel')
const catchAsyncErr = require('./../utils/catchAsyncErr');
const AppError = require('./../utils/appError');
const Project = require('./../models/projectModel');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const Chat = require('../models/chatModel');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getUsers = catchAsyncErr(async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }
    
    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);

    const users = await User.find();
    const managers = [];
    const admins = [];
    const editors = [];

    for(const user in users){
        for(const project in users[user].projects){
            if((users[user].projects)[project].id === currentUser.groupcode){
                if((users[user].projects)[project].role === "Manager"){
                    managers.push(users[user]);
                } else if((users[user].projects)[project].role === "Admin"){
                    admins.push(users[user]);
                } else {
                    editors.push(users[user]);
                }
            }
        }
    }

    res.locals.managers = JSON.stringify(managers);
    res.locals.admins = JSON.stringify(admins);
    res.locals.editors = JSON.stringify(editors);

    res.locals.perm = currentUser.role === "Manager" ? "Manager" : "Admin";
    next();
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'Error',
        message: 'Route Not Defined'
    })
};

exports.updateCurrentChat = async(req, res) => {
    //  update currentChat on new chat opened
}

exports.updateAction = async(req, res) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }
    
    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);

    try{
        currentUser.lastAction = new Date(Date.now()).toUTCString();
        currentUser.markModified('lastAction');
        currentUser.save();
        
        res.status(200).json({
            status: 'Success'
        })
    } catch(err) {
        res.status(400).json({
            status: 'Error'
        })
    }
    
}

exports.getChats = async(req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }
    
    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);


    const currentChat = currentUser.currentChat;
    const chats = currentUser.chats;
    var chatusers = [];
    var currentChatUser;

    for(const c in chats){
        const ch = await Chat.find({"code": chats[c]});
        const chat = ch[0];
        for(const u in chat.members){
            if(chat.members[u] != currentUser._id){
                const user = await User.findById(chat.members[u]);
                chatusers.push([user.name, user._id, chats[c], user.status]);
                if(chat.code === currentUser.currentChat){
                    currentChatUser = {name: user.name, status: user.status}
                }
            }
        }
    }

    res.locals.chats = chats; // chat objects
    res.locals.currentChatUser = currentChatUser; // users name
    res.locals.currentChat = currentChat; // current chat id
    res.locals.chatusers = chatusers; // [name, _id, link, status] --> _id needs to be used incase of email switch

    next();
}

exports.updateStatus = async(req, res) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }
    
    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);
    
    try{
        currentUser.status = req.body.status;
        currentUser.markModified('status');
        currentUser.save();

        res.status(200).json({
            status: 'Success'
        })
    } catch(err){
        res.status(400).json({
            status: 'Error'
        })
    }
    
}

exports.leaveProject = async(req, res) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }
    
    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);

    try{
        const projects = currentUser.projects;
        let newp = [];
        for(const p in projects){
            if(projects[p].id != req.body.code){
                newp.push(projects[p]);
            }
        }
        if(req.body.code === currentUser.groupcode){
            if(newp.length != 0){
                currentUser.groupcode = newp[0].id;
                currentUser.role = newp[0].role;
            } else {
                currentUser.groupcode = '';
                currentUser.role = 'Editor';
            }
        }
        var managers = 0;
        const us = await User.find();
        var users = [];
        for(const u in us){
            for(const p in us[u].projects){
                if(us[u].projects[p].id === req.body.code){
                    users.push(1);
                    if(us[u].projects[p].role === 'Manager'){
                        managers += 1;
                    }
                }
            }
        }
        if(users.length < 2){
            await Project.deleteOne({"code": req.body.code});
        } else if(managers < 2){
            var admins = 0; 
            for(const u in us){
                for(const p in us[u].projects){
                    if(us[u].projects[p].id === req.body.code){
                        if(us[u].projects[p].role === 'Admin'){
                            admins += 1;
                            us[u].projects[p].role = 'Manager';
                            us[u].markModified('projects')
                            us[u].save();
                            if(us[u].groupcode === req.body.code){
                                us[u].role = 'Manager';
                                us[u].markModified('role');
                                break;
                            }
                        }
                        if(admins === 0){
                            for(const p in us[u].projects){
                                if(us[u].projects[p].id === req.body.code){
                                    us[u].projects[p].role = 'Manager';
                                    us[u].markModified('projects')
                                    us[u].save();
                                    if(us[u].groupcode === req.body.code){
                                        us[u].role = 'Manager';
                                        us[u].markModified('role');
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            } 
        }

        currentUser.projects = newp;

        currentUser.markModified('groupcode');
        currentUser.markModified('role');
        currentUser.markModified('projects');
        currentUser.save();

        res.status(200).json({
            status: 'Success'
        });
    } catch(err){
        console.log(err.message)
        res.status(400).json({
            status: 'Error'
        });
    }
}

exports.switchProject = async(req, res) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }
    
    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);

    try{
        const projects = currentUser.projects
        for(const p in projects){
            if(projects[p].id === req.body.code){
                currentUser.groupcode = projects[p].id;
                currentUser.role = projects[p].role;
            }
        }

        currentUser.markModified('groupcode');
        currentUser.markModified('role');
        currentUser.save();
        res.status(200).json({
            status: 'Success'
        });
    } catch(err){
        console.log(err.message)
        res.status(400).json({
            status: 'Error'
        });
    }
}

exports.joinProject = async(req, res) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }
    
    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);

    try{
        const project = await Project.findOne({"code": req.body.code})

        if(project){
            currentUser.projects.push({
                id: req.body.code,
                role: 'Editor'
            });
            currentUser.groupcode = req.body.code;
            currentUser.role = "Editor";
            
            currentUser.markModified('groupcode');
            currentUser.markModified('role');
            currentUser.markModified('projects');
            currentUser.save();
        }


        res.status(200).json({
            status: 'Success',
            project: project.name
        });
    } catch(err){
        res.status(400).json({
            status: 'Error'
        });
    }
}

exports.updateProfile = async(req, res) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }
    
    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);
    try{
        currentUser.name = req.body.name;
        currentUser.email = req.body.email;

        currentUser.markModified('name');
        currentUser.markModified('email');
        currentUser.save();
        res.status(200).json({
            status: 'Success'
        })
    } catch(err) {
        res.status(400).json({
            status: 'Error'
        });
    }
}

exports.changeRole = async(req, res) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }
    
    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);

    try{
        const r = {"Manager": 2, "Admin": 1, "Editor": 0};

        const user = await User.findOne({"email": req.body.email});
        console.log(user)

        if(r[currentUser.role] < r[req.body.role] || r[user.role] > r[currentUser.role]){
            console.log(true)
            res.status(400).json({
                status: 'Error'
            });
        } else {
            user.role = req.body.role;

            if(req.body.email != currentUser.email){
                for(const p in user.projects){
                    if(user.projects[p].id === currentUser.groupcode){
                        user.projects[p].role = req.body.role;
                    }
                }
            }

            user.markModified('role');
            user.save();

            res.status(200).json({
                status: 'Success'
            });
        }
    } catch(err){
        res.status(400).json({
            status: 'Error'
        });
    }
}

exports.updateUser = catchAsyncErr(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
            'This route is not for password updates. Please use /updateMyPassword.',
            400
            )
        );
    }

    const filteredBody = filterObj(req.body, 'name', 'email');

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'Success',
        data: {
            user: updatedUser
        }
    });
});

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'Error',
        message: 'Route Not Defined'
    })
};


exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'Error',
        message: 'Route Not Defined'
    })
};