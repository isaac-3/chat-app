//importing
import express from 'express'
import mongoose from 'mongoose'
import Pusher from 'pusher'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import socket from 'socket.io'
import http from 'http'

//
import Messages from './dbMessages.js'
import Rooms from './dbRooms.js'
import Users from './dbUser.js'
// const router = express.Router()

// app config
// const app = express()
// const http = createServer(app)
// const io = (http)
const port = process.env.PORT || 9000

const app = express();
const server = app.listen(port, () => {
    console.log('listening for requests on port', port)
});

let io = socket(server)
io.on('connection', (socket) => {
  console.log(`${socket.id} is connected here`)
});

// const pusher = new Pusher({
//     appId: '1075101',
//     key: '5954b58616a76df09f9f',
//     secret: '4b57ac402b162b0a471c',
//     cluster: 'us2',
//     encrypted: true
//   });

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

// db.once('open', () => {
//     console.log('roomdb is connected')
//     const roomCollection = db.collection("roomcontents")
//     const changeStream = roomCollection.watch({ fullDocument: 'updateLookup' })
//     changeStream.on('change', (change) => {
//         console.log(change.operationType)
//         if(change.operationType === 'insert'){
//             const roomDetails = change.fullDocument
//             pusher.trigger('rooms', 'inserted', 
//                 {
//                     _id: roomDetails._id,
//                     name: roomDetails.name,
//                     messages: roomDetails.messages
//                 }
//             )
//         }else if(change.operationType === 'update'){
//             const roomId = change.fullDocument._id
//             const {message, name, timestamp, _id} = change.fullDocument.messages.sort((a,b) => (a.timestamp < b.timestamp) ? 1 : -1)[0]
//             pusher.trigger('rooms', 'newmsg',
//                 {
//                     message,
//                     name,
//                     timestamp,
//                     _id,
//                     roomId
//                 }
//             )
//         }else{
//             console.log("err w pusher")
//         }
//     })
// })


// api routes
app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

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
            const {message, postedBy, timestamp, _id} = result.messages.sort((a,b) => (a.timestamp < b.timestamp) ? 1 : -1)[0]
            io.emit('new-msg',
                {
                    message,
                    postedBy: postedBy,
                    timestamp,
                    _id,
                    roomId
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

app.get('/rooms/:roomId', (req, res) => {
    Rooms.findOne({_id: req.params.roomId})
    .populate("messages.postedBy", "_id name online")
    .populate("members", "_id name online")
    .then(room => {
        res.json({room})
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
