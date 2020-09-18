import mongoose from 'mongoose'

const chatappSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: Boolean
})

export default mongoose.model('messagecontents', chatappSchema)