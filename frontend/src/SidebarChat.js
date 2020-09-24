import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import './SidebarChat.css'
import axios from './axios'
import { Link } from 'react-router-dom';
import Pusher from 'pusher-js'
import socketIo from 'socket.io-client'

const socket = socketIo('http://localhost:9000')

const SidebarChat = ({id, name, addNewChat}) => {

    const [seed, setSeed] = useState('')
    const [msgs, setMsgs] = useState([])
    const [newRoomName, setRoomName] = useState('')
    const [roomPrompt, setPrompt] = useState(false)

    useEffect(()=>{
        setSeed(Math.floor(Math.random() * 5000))
    },[])

    socket.on('new-msg', (newMsg) => {
        if(newMsg.roomId === id){
            setMsgs(newMsg)
        }
    })

    useEffect(() => {
        if(id){
            axios.get(`/rooms/${id}`)
            .then(room=>{
                setMsgs(room.data.room.messages.sort((a,b) => (a.timestamp < b.timestamp) ? 1 : -1)[0])
            })
        }
    },[id])

    const createChat = () => {
        if (newRoomName){
            axios.post('/rooms/new', {
                name: newRoomName
            })
        }
        setRoomName('')
        setPrompt(false)
    }

    const openPrompt = () => {
        setPrompt(true)
    }

    const handleClose = () => {
        setRoomName('')
        setPrompt(false)
    }

    const roomName = (name) => {
        setRoomName(name)
    }

    return !addNewChat ? (
        <Link to={`/rooms/${id}`}>
            <div className="sidebarChat">
                <Avatar src={`https://avatars.dicebear.com/api/avataaars/${seed}.svg`}/>
                <div className="sidebarChat__info">
                    <h2>{name}</h2>
                    <p>{msgs?.message}</p>
                </div>
            </div>
        </Link>
        
    ) : 
    (
        <div>
            <Dialog open={roomPrompt} onClose={() => handleClose()} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Create A New Room</DialogTitle>
                    <DialogContent>
                        <TextField
                            value={newRoomName}
                            onChange={(e) => roomName(e.target.value)}
                            autoFocus
                            label="Enter Your Room Name"
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => handleClose()} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={() => createChat()} color="primary">
                            Create
                        </Button>
                    </DialogActions>
            </Dialog>
            <div className="sidebarChat new__chat" onClick={() => openPrompt()}>
                <h2>Create A New Room</h2>
            </div>
        </div>

    );
}
 
export default SidebarChat;