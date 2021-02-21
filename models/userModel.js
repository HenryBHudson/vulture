const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Chat = require('./chatModel');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email already registered'],
        lowercase: true,
        validate: {
            validator: function(el) {
                const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(el);
            },
            message: 'Email is not valid'
        }
    },
    role: {
        type: String,
        enum: ['Editor', 'Admin', 'Manager'],
        default: 'Editor'
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 8,
        select: false
    },
    cpassword: {
        type: String,
        validate: {
            // This only works on CREATE and SAVE
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords are not the same'
        }
    },
    projects: [{
        id: String,
        role: String
    }],
    groupcode: String,
    passwordCA: Date, //password changed at
    passwordRToken: String,
    passwordRExp: Date,
    chats: [String],
    currentChat: String,
    status: String
});

userSchema.pre('save', async function(next) {
    //Only run this function if pass was modified
    if(!this.isModified('password')) return next();

    //Hash pass with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    
    //Delete cpass
    this.cpassword = undefined;

    next();
});

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordCA = Date.now() - 1000;
    next();
})

userSchema.methods.correctPassword = async function(candidatePass, userPass) {
    return await bcrypt.compare(candidatePass, userPass);
};

userSchema.methods.changedPasswordAfter = function(TokenTimestamp){
    if(this.passwordCA){
        const changedTS = parseInt(this.passwordCA.getTime() / 1000, 10);
        return TokenTimestamp < changedTS;
    }
    return false;
}

userSchema.methods.createResetPasswordToken = function(){
    const rToken = crypto.randomBytes(32).toString('hex');

    this.passwordRToken = crypto.createHash('sha256').update(rToken).digest('hex');
    this.passwordRExp = Date.now() + 10 * 60 * 1000;

    console.log({rToken}, this.passwordRToken);

    return rToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;