import jwt from 'jsonwebtoken'
import {JWT_SECRET} from '../config/keys'
import mongoose from 'mongoose'

const Users = mongoose.model('usercontents')

module.exports = (req, res, next) => {
    const {authorization} = req.headers
    if(!authorization){
        return res.status(401).json({error: 'you must be loggin in'})
    }
    const token = authorization.replace("Bearer ", "")
    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if(err){
            return res.status(401).json({error: 'you must be loggin in'})
        }
        const { _id } = payload
        Users.findById(_id).then(userdata => {
            req.user = userdata
            next()
        })
    })
}