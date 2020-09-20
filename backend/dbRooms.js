import mongoose from 'mongoose'

const roomSchema = mongoose.Schema({
    name: String,
    messages:[{
        message: String,
        name: String,
        timestamp : { 
            type : Date, 
            default: Date.now
        }
    }]
})

export default mongoose.model('roomcontents', roomSchema)