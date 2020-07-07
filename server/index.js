const express = require('express')
const app = express()
const port = 3000

const config = require('./config/key');
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI,{
    useNewUrlParser: true, useUnifiedTopology : true, useCreateIndex: true, useFindAndModify : false 
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World!'))



const bodyParser = require('body-parser');
const {User} = require("./models/User");
const { json } = require('express');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//회원가입
app.post('/register', (req,res) => { // http://localhost:3000/register 에서 post
    // client에서 회원가입시 필요한 정보들을 가져와서 데이터베이스에 넣어줌
    const user = new User(req.body)
    user.save((err,userInfo) => { // mongeDB 메소드
        if(err) return res.json({success: false,err})
        return res.status(200).json({
            success : true
        })
    })
})

//로그인
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.post('/login', (req,res) => { 
   // 요청된 이메일 데이터베이스에 있는지확인
    User.findOne({email:req.body.email}, (err,user)=>{
        if(!user){
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }

        //요청된 비밀번호가 맞는 비밀번호인지 확인
        user.comparePassword(req.body.password, (err,isMatch)=>{
            if(!isMatch)
            return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."})
            
            //토큰 생성
            user.generateToken((err, user)=> {
                if(err) return res.status(400).send(err);
                //토큰을 저장한다. 어디에? 쿠키,로컬 등등.. -> 이 강의에서는 쿠키에 저장
                res.cookie('x_auth',user.token)
                .status(200)
                .json({loginSuccess: true, userId: user._id})
            })
        })
    })


})

const {auth} = require("./middleware/auth")
app.get('/api/users/auth',auth,(req,res) => {
    // 여기까지 미들웨어를 통과하ㅐ왔다는 얘기는 Authentication이 true 라는 뜻
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.get('/api/users/logout', auth, (req,res) => {
    User.findOneAndUpdate({_id: req.user._id},{token: ""}, (err,user) => {
        if(err) return res.json({success: false,err})
        return res.status(200).send({
            success: true
        })
    })
})


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))