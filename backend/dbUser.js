import mongoose from 'mongoose'
const {ObjectId} = mongoose.Schema.Types

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    online: {
        type: Boolean,
        default: false
    },
    resetToken: String,
    expireToken: Date,
    rooms:[
        {type: ObjectId, ref: "roomcontents"}
    ] 
})

export default mongoose.model('usercontents', userSchema)