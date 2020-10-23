//importing
import express from 'express'
import mongoose from 'mongoose'
import Pusher from 'pusher'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import socket from 'socket.io'
import nodemailer from 'nodemailer'
import sendgridTransport from 'nodemailer-sendgrid-transport'
import crypto from 'crypto'

// db import schema
import Rooms from './dbRooms.js'
import Users from './dbUser.js'

// app config
const port = process.env.PORT || 9000

const app = express();
const server = app.listen(port, () => {
    console.log('listening for requests on port', port)
});

let io = socket(server)
io.on('connection', (socket) => {
  console.log(`${socket.id} is connected here`)
  socket.on("SEND_MESSAGE", (data) => {
      io.emit('RECEIVE_MESSAGE',{
          data
      })
  })
});

//middleware
app.use(express.json())
app.use(cors())

//DB config
const connection_url = 'mongodb+srv://admin:QXgAYFtssNod0bDA@cluster0.lt9gb.mongodb.net/chat-app?retryWrites=true&w=majority'
mongoose.set('useFindAndModify', false); // for findoneandupdate
mongoose.connect(connection_url,{
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection

//nodemailer
const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key: "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"
    }
}))

// api routes
app.patch('/messages/new', (req, res) => {
    const newMsg = {
        message: req.body.message,
        postedBy: req.body.postedBy,
        timestamp: req.body.timestamp
    }
    Rooms.findByIdAndUpdate(req.body.roomId, {
        $push:{messages: newMsg}
    },{
        new: true
    })
    .populate("messages.postedBy", "_id name")
    .exec((err, result)=>{
        if(err){
            return res.status(422).json({error: err})
        }else{
            const roomId = result._id
            const {message, postedBy, timestamp, _id, deletedBy} = result.messages.sort((a,b) => (a.timestamp < b.timestamp) ? 1 : -1)[0]
            io.emit('new-msg',
                {
                    message,
                    postedBy: postedBy,
                    timestamp,
                    _id,
                    roomId,
                    deletedBy
                }
            )
            res.json(result)
        }
    })
})

app.post('/rooms/sync', (req, res) => {
    if(req.body.user){
        Rooms.find({_id: {$in: req.body.user.rooms}})
        .then(rooms=>{
            res.status(200).send(rooms)
        })
    }
})

app.get('/allrooms', (req, res) => {
    Rooms.find((err, data) => {
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

app.post('/joinroom', (req,res) => {
    Rooms.findOneAndUpdate({tag: req.body.tag}, {
        $push:{members: req.body.user._id}
    },{
        new: true
    }, (err, newRoom) => {
        if(err){
            return res.status(422).json({error: err})
        }
        Users.findByIdAndUpdate(req.body.user._id, {
            $push:{rooms: newRoom._id}
        },{
            new: true
        })
        .select("-password")
        .then(result => {
            res.json({result})
        }).catch(err => {
            return res.status(422).json({error: err})
        })
        const info = {newRoom, currUser: req.body.user._id}
        io.emit('join-room',info)
    }).populate("members", "_id name online")
})

app.patch('/leaveroom', (req,res) => {
    Rooms.findByIdAndUpdate(req.body.roomId, {
        $pull:{members: req.body.user._id}
    },{
        new: true
    }, (err, leaveRoom) => {
        if(err){
            return res.status(422).json({error: err})
        }
        Users.findByIdAndUpdate(req.body.user._id, {
            $pull:{rooms: leaveRoom._id}
        },{
            new: true
        })
        .select("-password")
        .populate("rooms","_id name tag members messages")
        .then(result => {
            const info = {leaveRoom, currUser: result}
            io.emit('leave-room',info)
            res.json({result})
        }).catch(err => {
            return res.status(422).json({error: err})
        })
    }).populate("members", "_id name online")
})

app.post('/rooms/new', (req, res) => {
    const dbRoom = req.body
    Rooms.create(dbRoom, (err, data) => {
        if(err){
            res.status(500).send(err)
        }else{
            io.emit('new-room',data)
            res.status(201).send(data)
        }
    })

})

app.get('/rooms/:roomId/:userId', (req, res) => {
    const userId = req.params.userId
    Rooms.findOne({_id: req.params.roomId})
    .populate("messages.postedBy", "_id name online")
    .populate("messages.deletedBy", "_id")
    .populate("members", "_id name online")
    .then(room => {
        const copy = [...room.messages]
        const lastMSgs = copy.filter(x => !(x.deletedBy.some(e => e._id !== req.params.userId)))
        res.json({room, lastMSgs, userId})
    }).catch(err => {
        return res.status(404).json({error: "Room Not Found"})
    })
})

app.post('/signup', (req, res) => {
    const {name, email, password} = req.body 
    if( !email || !password || !name){
        return res.status(422).json({error: 'Pls add all the fields'})
    }
    Users.findOne({email: email})
    .then((savedUser)=>{
        if(savedUser){
            return res.json({error: 'User already exisit with that email'})
        }
        bcrypt.hash(password, 12)
        .then(hashedpassword => {
            const user = new Users({
                email,
                password: hashedpassword,
                name,
            })
            user.save()
            .then(user=>{
                transporter.sendMail({
                    to: user.email,
                    from: "isaacgc0596@gmail.com",
                    subject: "Signuped successfully",
                    html: "<h1>Welcome to Chatter</h1>"
                })
                res.json({message: 'saved seccusfullt'})
            })
            .catch(err => {
                console.log(err)
            })
        })
    })
    .catch(err => {
        console.log(err)
    })
})

app.post('/login', (req, res) => {
    const { email, password } = req.body
    if(!email || !password){
        return res.status(422).json({error: 'pls add email or password!'})
    }
    Users.findOneAndUpdate({email: email}, {
        online: true
    },{
        new: true
    })
    .then(savedUser => {
        if(!savedUser){
            return res.json({error: 'User does not exist'})
        }
        bcrypt.compare(password, savedUser.password)
        .then(doMatch => {
            if(doMatch){
                const {_id, name, email, rooms, online} = savedUser
                io.emit("user-login", {_id, name, email, online})
                res.json({user: {_id, name, email, rooms, online}})
            }else{
                return res.json({error: 'invalid email or pssword'})
            }
        })
        .catch(err => {
            console.log(err)
        })
    })
})

app.post('/logout',(req, res) => {
    Users.findByIdAndUpdate(req.body.user._id, {
        online: false
    },{
        new: true
    })
    .then(user => {
        io.emit("user-logout", user)
        res.json({user})
    })
})

app.get('/users/:id', (req, res) => {
    Users.findOne({_id: req.params.id})
    .select("-password")
    .then(user=>{
        res.json({user})
    }).catch(err => {
        return res.status(404).json({error: "User Not Found"})
    })
})

app.patch('/delmsg', (req, res) => {
    let userId = req.body.user._id
    let roomId = req.body.roomId
    Rooms.findOneAndUpdate(
        { _id: req.body.roomId, "messages._id":  req.body.msgId},
        { $push: { "messages.$.deletedBy" : req.body.user._id }},{new: true}
     )
     .populate("messages.postedBy", "_id name online")
     .populate("messages.deletedBy", "_id")
     .then(room=>{
         const copy = [...room.messages]
         const lastMsgEdit = copy.sort((a,b) => (a.timestamp < b.timestamp) ? 1 : -1)
         const lastMSg = lastMsgEdit.filter(x => !(x.deletedBy.some(e => e._id !== req.body.user._id)))[0]
         const lastMSgArr = room.messages.filter(x => !(x.deletedBy.some(e => e._id !== req.body.user._id)))
         io.emit('del-msg', {
             room,
            lastMSg,
            roomId,
            userId,
            lastMSgArr
         })
        res.json({room, lastMSgArr, userId, roomId })
     })
})

app.patch('/editmsg', (req, res) => {
    Rooms.findOneAndUpdate(
        { _id: req.body.roomId, "messages._id":  req.body.msgId},
        { "messages.$.message": req.body.prevMsg},{new: true}
     )
     .populate("messages.postedBy", "_id name online")
     .populate("messages.deletedBy", "_id")
     .then(room=>{
         io.emit('edit-msg', {
             room
         })
        res.json({room})
     })
})

app.post('/resetpassword', (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
        if(err){
            console.log(err)
        }
        const token = buffer.toString("hex")
        Users.findOne({email: req.body.email})
        .then(user => {
            if(!user){
                return res.status(422).json({err: "user does not exsist"})
            }
            user.resetToken = token
            user.expireToken = Date.now() + 3600000
            user.save()
            .then(result => {
                transporter.sendMail({
                    to: user.email,
                    from: "isaacgc0596@gmail.com",
                    subject: "Password Reset",
                    html: 
                    `<p>You resquested for a password reset</p>
                    <h5>Click on this <a href="http://localhost:3000/reset/${token}">link</a> to reset your password</h5>`
                })
                res.json({message: "check your email for link"})
            })
        })
    })
})

app.post('/newpassword', (req, res) => {
    const newPassword = req.body.password
    const sentToken = req.body.token
    Users.findOne({resetToken: sentToken, expireToken: {$gt: Date.now()}})
    .then(user=>{
        if(!user){
            return res.status(422).json({error: "session expired try again!"})
        }
        bcrypt.hash(newPassword,12)
        .then(hashedpassword => {
            user.password = hashedpassword
            user.resetToken = undefined
            user.expireToken = undefined
            user.save()
        })
    })
})