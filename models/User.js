const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name:{
        type: String,
        maxlength: 50
    },
    email:{
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        maxlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role:{
        type: Number,
        default: 0
    },
    image : String,
    token:{
        type: String
    },
    tokenExp: {
        type: Number
    }

})

const bcrypt = require('bcrypt')
const saltRounds = 10
userSchema.pre('save',function(next){
    var user = this
    // 비밀번호 암호화 시킨 후 save에 보냄 (비밀번호 변경하는 경우에만)
    if(user.isModified('password')){
        bcrypt.genSalt(saltRounds,function(err,salt){
            if(err) return next(err)
    
            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    }else{
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb){
    // plainPassword : 1234567   vs   db에 있는 암호화된 비밀번호 : 어쩌구저쩌구 
    // -> plainPassword를 암호화하여 비교 
    bcrypt.compare(plainPassword, this.password, function(err,isMatch){
        if(err) return cb(err),
            cb(null, isMatch)
    })
}

var jwt = require('jsonwebtoken');
userSchema.methods.generateToken = function(cb){
    var user = this
    //jsonwebtoken 이용해서 token 생성
    var token = jwt.sign(user._id, 'secretToken');
    // user._id, + 'secretToken' = token
    // -> 
    // 'secretToken' -> user._id
    user.token = token
    user.save(function(err,user){
        if(err) return cb(err)
        cb(null,user) // null -> 에러가 없다는 뜻
    })
}

const User = mongoose.model('User',userSchema)

module.exports = {User}