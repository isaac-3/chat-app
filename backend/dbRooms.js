import mongoose from 'mongoose'
const {ObjectId} = mongoose.Schema.Types

const roomSchema = mongoose.Schema({
    name: String,
    messages:[{
        message: String,
        postedBy: {type: ObjectId, ref: "usercontents"},
        timestamp : { 
            type : Date, 
            default: Date.now
        }
    }]
})

export default mongoose.model('roomcontents', roomSchema)