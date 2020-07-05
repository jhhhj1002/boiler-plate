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
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
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


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))