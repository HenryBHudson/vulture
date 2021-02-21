const Project = require('./../models/projectModel')
const {promisify} = require('util');
const catchAsyncErr = require('./../utils/catchAsyncErr');
const AppError = require('./../utils/appError');
const User = require('../models/userModel');
const Card = require('../models/cardModel');
const Marker = require('../models/markerModel')
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const moment = require('moment');


exports.getProject = catchAsyncErr(async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }
    if(token){
        const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
        const currentUser = await User.findById(decode.id);
        const project = await Project.findOne({"code":currentUser.groupcode});
        req.project = project;
        res.locals.project = project;
        
        res.locals.cards = JSON.stringify(project.cards);
        res.locals.tags = JSON.stringify(project.tags);
    }
    
    next();
})

exports.getUserProjects = async(req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }
    if(token){
        const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
        const currentUser = await User.findById(decode.id);
        const projects = currentUser.projects;
        var ps = []
        for(const proj in projects){
            const project = await Project.findOne({"code":projects[proj].id});
            ps.push(project);
        }
        res.locals.uprojects = ps;
    }
    
    next();
}

exports.getAllProjects = catchAsyncErr(async (req, res) => {
    const projects = await Project.find();

    res.status(200).json({
        status: 'Success',
        results: projects.length,
        data: {
            projects
        } 
    })
});

exports.adminProtect = async(req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }

    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);

    if(currentUser.role === "Editor"){
        res.status(200).render('noaccess', {
            title: 'No Access'
        })
        return next(new AppError('You do not have access to this page.', 401));
    }
    next();
}

exports.deleteProject = async(req, res) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }

    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);

    try{
        const oldcode = currentUser.groupcode;
        let users = await User.find();
        let newp = [];
        let pflag = false;
        for(const u in users){
            newp = [];
            pflag = false;
            let us = users[u];
            for(const p in us.projects){
                const usp = us.projects[p];
                if(usp.id === currentUser.groupcode){
                    pflag = true;
                }
            }
            if(pflag){
                for(const p in us.projects){
                    const usp = us.projects[p];
                    if(usp.id != currentUser.groupcode){
                        newp.push(usp);
                    }
                }
                if(newp.length > 0){
                    us.groupcode = newp[0].id;
                    us.role = newp[0].role;
                } else {
                    us.groupcode = '';
                    us.role = "Editor";
                }
                us.projects = newp;
                us.markModified('projects');
                us.markModified('role');
                us.markModified('groupcode');
                us.save();
            }
        }
        await Project.deleteOne({"code": oldcode});


        const proj = currentUser.projects.length > 1 ? '/overview' : '/action';
        console.log(proj);
        
        res.status(200).json({
            status: "Success",
            page: proj
        })
    } catch(err){
        res.status(400).json({
            status: "Error",
        })
    }
}

exports.deleteMarker = async(req, res) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }

    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);
    
    try{
        const project = await Project.findOne({"code": currentUser.groupcode});
        const t = project.tags;
        const cs = project.cards;
        var newt = {};
        var newct = [];
        for(const m in t){
            if(t[m].text != req.body.text){
                newt[t[m].text] = t[m];
            }
        }
        for(const c in cs){
            if(cs[c].tags.includes(req.body.text)){
                for(const ct in cs[c].tags){
                    if(cs[c].tags[ct] != req.body.text){
                        newct.push(cs[c].tags[ct]);
                    }
                }
                project.cards[cs[c].id].tags = newct;
            }
        }
        project.tags = newt;
        project.markModified('tags');
        project.markModified('cards');
        project.save();
    
        res.status(200).json({
            status: "Success"
        })
    } catch(err) {
        res.status(400).json({
            status: "Error"
        })
    }
}

exports.updateProject = async(req, res) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }

    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);
    
    try{
        const project = await Project.findOne({"code": currentUser.groupcode});
        
        project.name = req.body.name;
        project.type = req.body.type;

        project.markModified('name');
        project.markModified('type');
        project.save();

        res.status(200).json({
            status: "Success",
        })
    } catch(err){
        res.status(400).json({
            status: "Error",
        })
    }
}

exports.createProject = async(req, res) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }

    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);

    try{

        const code = Math.floor(Math.random() * (99999999 - 10000000 + 1) + 10000000);

        const project = await Project.create({
            name: req.body.name,
            type: req.body.type,
            code,
            created: {
                date: [],
                number: []
            },
            cards: Object,
            tags: Object
        })

        currentUser.projects.push({
            id: code,
            role: 'Manager'
        });

        currentUser.groupcode = code;

        currentUser.role = "Manager";

        currentUser.markModified('groupcode');
        currentUser.markModified('role');
        currentUser.markModified('projects')
        currentUser.save();

        res.status(200).json({
            status: "Success"
        })
    } catch(err){
        res.status(400).json({
            status: "Error",
        })
    }
}

exports.updateCard = async(req, res) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }

    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);
    const project = await Project.findOne({"code": currentUser.groupcode});

    try{
        let card = project.cards[req.body.id];
        
        card.summary = req.body.summary;
        card.description = req.body.description;
        card.urgency = req.body.urgency;
        card.tags = req.body.tags;
        card.flags = req.body.flags;

        
        project.markModified(`cards.${req.body.id}`)
        project.save();

        res.status(200).json({
            status: "Success"
        })
    } catch(err){
        res.status(400).json({
            status: "Error",
        })
    }
}

exports.deleteCard = async(req, res) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }

    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);
    const project = await Project.findOne({"code": currentUser.groupcode});

    try{
        delete project.cards[req.body.id];

        project.markModified('cards');
        project.save();

        res.status(204).json({
            status: "Success"
        })
    } catch(err){
        res.status(400).json({
            status: "Error",
        })
    }
}

exports.removeUser = async(req, res) => {
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

        const user = await User.findOne({"email": req.body.email})
        if(r[user.role] > r[currentUser.role]){
            res.status(400).json({
                status: 'Error'
            });
        } else {
            const projects = user.projects;
            const newp = [];
            for(const p in projects){
                if(projects[p].id != currentUser.groupcode){
                    newp.push(projects[p]);
                } 
            }
            
            user.projects = newp;
    
            if(user.groupcode === currentUser.groupcode){
                if(newp.length > 0){
                    user.groupcode = newp[0].id;
                    user.role = newp[0].role;
                } else {
                    user.groupcode = "";
                    user.role = "Editor";
                }
            }
            
            user.markModified('projects');
            user.markModified('role');
            user.markModified('groupcode');
            user.save();
    
            res.status(200).json({
                status: "Success"
            })
        }
    } catch(err){
        res.status(400).json({
            status: "Error",
        })
    }
}

exports.banUser = async(req, res) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }

    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);

    const email = req.body.email;
    try{
        const user = await User.findOne({"email": email});
        const projects = user.projects;
        const newp = [];
        for(const p in projects){
            if(projects[p].id != currentUser.groupcode){
                newp.push(projects[p]);
            } 
        }
        
        user.projects = newp;

        if(user.groupcode === currentUser.groupcode){
            if(newp.length > 0){
                user.groupcode = newp[0].id;
                user.role = newp[0].role;
            } else {
                user.groupcode = "";
                user.role = "Editor";
            }
        }

        
        user.banned.push(currentUser.groupcode);

        user.markModified('groupcode');
        user.markModified('banned');
        user.markModified('role');
        user.markModified('projects');
        user.save();

        res.status(200).json({
            status: "Success"
        })
    } catch(err){
        res.status(400).json({
            status: "Error",
        })
    }
}

exports.runVisual = async(req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }
    
    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);
    const project = await Project.findOne({"code":currentUser.groupcode});

    const today = moment();
    const date = today.format('Do MMM YYYY');
    const d = new Date();
    try{
        var dateRes = project.created.date;
        var numRes = project.created.number;

        d.setDate(d.getDate() - 7 + 1);
        
        if(dateRes[dateRes.length - 1] != date){
            let dateCheck = dateRes;
            let numGet = numRes;
            dateRes = [];
            numRes = [];
            for(var i=0;i<7;i++){
                var newDate = moment(d).format('Do MMM YYYY')
                dateRes.push(newDate)
                d.setDate(d.getDate() + 1);
                if(dateCheck.includes(newDate)){
                    numRes.push(numGet[dateCheck.indexOf(newDate)])
                } else if(i === 6){
                    numRes.push(0);
                } else {
                    numRes.push(0);
                }
            }
        } else {

        }

        project.created.date = dateRes;
        project.created.number = numRes;

        project.markModified('created');
        project.save();

        next();
    } catch(err){
        res.status(400).json({
            status: "Error",
            message: err.message
        })
    }

}

exports.createTicket = async(req, res) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }
    
    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);
    const project = await Project.findOne({"code":currentUser.groupcode});

    const key = Math.random().toString(36).substring(7);

    const newCard = await Card.create({
        summary: req.body.summary,
        description: req.body.description,
        tags: req.body.tags,
        urgency: req.body.urgency,
        id: key,
        panel: req.body.panel,
        flags: req.body.flags
    });

    const today = moment();
    const date = today.format('Do MMM YYYY');
    const d = new Date();
    
    try{
        project.cards[`${key}`] = newCard;
  
        var dateRes = project.created.date;
        var numRes = project.created.number;


        d.setDate(d.getDate() - 7 + 1);
        
        if(dateRes[dateRes.length - 1] != date){
            let dateCheck = dateRes;
            let numGet = numRes;
            dateRes = [];
            numRes = [];
            for(var i=0;i<7;i++){
                var newDate = moment(d).format('Do MMM YYYY')
                dateRes.push(newDate)
                d.setDate(d.getDate() + 1);
                if(i === 6){
                    numRes.push(1);
                }   
                if(dateCheck.includes(newDate)){
                    numRes.push(numGet[dateCheck.indexOf(newDate)])
                } else {
                    numRes.push(0);
                }
            }
        } else {
            numRes[numRes.length - 1] += 1;
        }

        project.created.date = dateRes;
        project.created.number = numRes;

        
        project.markModified('cards');
        project.markModified('created');
        project.save();

        res.status(200).json({
            status: "Success"
        })
    } catch(err){
        res.status(400).json({
            status: "Error",
            message: err.message
        })
    }
}

exports.updateCardPlace = catchAsyncErr(async(req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }
    
    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);
    const project = await Project.findOne({"code":currentUser.groupcode});

    try {

        project.cards[`${req.body.id}`].panel = req.body.newSection;
        project.markModified(`cards.${req.body.id}.panel`)
        project.save();

        res.status(204).json({
            status: "Success"
        })
    } catch(err){
        res.status(300).json({
            status: "Error",
            message: err.message
        })
    }
})

exports.createMarker = catchAsyncErr(async(req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }
    
    const decode = await promisify(jwt.verify)(token, process.env.JWT_S);
    const currentUser = await User.findById(decode.id);
    const project = await Project.findOne({"code":currentUser.groupcode});
    try {
        const marker = await Marker.create({
            text: req.body.text,
            colour: req.body.colour
        })

        console.log(marker);
        project.tags[`${req.body.text}`] = marker;
        project.markModified('tags');
        project.save();

        res.status(200).json({
            status: "Success"
        })
    } catch(err){
        res.status(300).json({
            status: "Error",
            message: err.message
        })
    }
})


