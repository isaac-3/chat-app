//importing
import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Pusher from 'pusher'
import cors from 'cors'

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
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*')
//     res.setHeader('Access-Control-Allow-Headers', '*')
//     next()
// })

//DB config
const connection_url = 'mongodb+srv://admin:QXgAYFtssNod0bDA@cluster0.lt9gb.mongodb.net/chat-app?retryWrites=true&w=majority'
mongoose.connect(connection_url,{
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection

db.once('open', () => {
    console.log('db is connected')
    const msgCollection = db.collection("messagecontents")
    const changeStream = msgCollection.watch()
    changeStream.on('change', (change) => {
        if(change.operationType === 'insert'){
            const messageDetails = change.fullDocument
            pusher.trigger('messages', 'inserted', 
                {
                    name: messageDetails.name, 
                    message: messageDetails.message,
                    timestamp: messageDetails.timestamp,
                    received: messageDetails.received
                }
            )
        }else{
            console.log('err w pusher')
        }
    })
})


// api routes
app.get('/', (req, res) => {
    res.status(200).send('hello isaac check req')
})

app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body

    Messages.create(dbMessage, (err, data) => {
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
})

//listen
app.listen(port, () => {
    console.log(`listining on port ${port}`)
})