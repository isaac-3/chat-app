//importing
import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Rooms from './dbRooms.js'
import Pusher from 'pusher'
import cors from 'cors'

//
const router = express.Router()

// app config
const app = express()
const port = process.env.PORT || 9000
const pusher = new Pusher({
    appId: '1075101',
    key: '5954b58616a76df09f9f',
    secret: '4b57ac402b162b0a471c',
    cluster: 'us2',
    encrypted: true
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

// db.once('open', () => {
//     console.log('db is connected')
//     const msgCollection = db.collection("messagecontents")
//     const changeStream = msgCollection.watch()
//     changeStream.on('change', (change) => {
//         if(change.operationType === 'insert'){
//             const messageDetails = change.fullDocument
//             pusher.trigger('messages', 'inserted', 
//                 {
//                     name: messageDetails.name, 
//                     message: messageDetails.message,
//                     timestamp: messageDetails.timestamp,
//                     received: messageDetails.received
//                 }
//             )
//         }else{
//             console.log('err w pusher')
//         }
//     })
// })

db.once('open', () => {
    console.log('roomdb is connected')
    const roomCollection = db.collection("roomcontents")
    const changeStream = roomCollection.watch({ fullDocument: 'updateLookup' })
    changeStream.on('change', (change) => {
        console.log(change.operationType)
        if(change.operationType === 'insert'){
            const roomDetails = change.fullDocument
            pusher.trigger('rooms', 'inserted', 
                {
                    _id: roomDetails._id,
                    name: roomDetails.name,
                    messages: roomDetails.messages
                }
            )
        }else if(change.operationType === 'update'){
            const roomDetails = change.fullDocument
            console.log(roomDetails)
            pusher.trigger('rooms', 'updated', 
                {
                    _id: roomDetails._id,
                    name: roomDetails.name,
                    messages: roomDetails.messages
                }
            )
        }else{
            console.log("err w pusher")
        }
    })
})

// db.once('open', () => {
//     console.log('db is connected')
//     const roomCollection = db.collection("roomcontents")
//     const changeStream = roomCollection.watch({ fullDocument: 'updateLookup' })
//     changeStream.on('change', (change) => {
//     // console.log(change)
//         if(change.operationType === 'update'){
//             const roomDetails = change.fullDocument
//             // console.log(roomDetails)
//             pusher.trigger('rooms', 'update', 
//                 {
//                     // name: roomDetails.name,
//                     messages: roomDetails.messages
//                 }
//             )
//         }else{
//             console.log('err w pusher')
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
        name: req.body.name,
        timestamp: req.body.timestamp
    }
    Rooms.findByIdAndUpdate(req.body.roomId, {
        $push:{messages: newMsg}
    },{
        new: true
    })
    .populate("messages")
    .exec((err, result)=>{
        if(err){
            return res.status(422).json({error: err})
        }else{
            res.json(result)
        }
    })
})

app.get('/rooms/sync', (req, res) => {
    Rooms.find((err, data) => {
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

app.post('/rooms/new', (req, res) => {
    const dbRoom = req.body
    Rooms.create(dbRoom, (err, data) => {
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
})

app.get('/rooms/:roomId', (req, res) => {
    Rooms.findOne({_id: req.params.roomId})
    .then(room => {
        res.json({room})
    }).catch(err => {
        return res.status(404).json({error: "Room Not Found"})
    })
})

//listen
app.listen(port, () => {
    console.log(`listining on port ${port}`)
})