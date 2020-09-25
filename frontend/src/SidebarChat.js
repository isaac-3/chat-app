import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import './SidebarChat.css'
import axios from './axios'
import { Link } from 'react-router-dom';
import Pusher from 'pusher-js'
import socketIo from 'socket.io-client'
import Alert from '@material-ui/lab/Alert';

const socket = socketIo('http://localhost:9000')

const SidebarChat = ({id, name, addNewChat}) => {

    const [seed, setSeed] = useState('')
    const [msgs, setMsgs] = useState([])
    const [newRoomName, setRoomName] = useState('')
    const [newRoomTag, setRoomTag] = useState('')
    const [roomPrompt, setPrompt] = useState(false)
    const [fields__open, setFieldOpen] = useState(false)

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
                name: newRoomName,
                tag: newRoomTag
            })
            .then(res=> {
                setRoomName('')
                setRoomTag('')
                setPrompt(false)
                setFieldOpen(false)
            })
            .catch(err=> {
                if(err){
                    setFieldOpen(true)
                }
            })
        }
    }

    const openPrompt = () => {
        setPrompt(true)
    }

    const handleClose = () => {
        setRoomName('')
        setPrompt(false)
    }

    const handleKeyDown = e => {
        if (e.key === " ") {
          e.preventDefault();
        }
      };

    const handleChange = e => {
        if (e.includes(" ")) {
            e = e.replace(/\s/g, "")
        }
        setRoomTag(e)
    }

    const handleFieldClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setFieldOpen(false)
    };

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
                            onChange={(e) => setRoomName(e.target.value)}
                            autoFocus
                            label="Enter Your Room Name"
                            fullWidth
                        />
                        {fields__open && <Alert variant="outlined" severity="error" style={{marginTop: '16px'}}>
                            Please Add A Tag!
                        </Alert>}
                        <TextField
                            style={{marginTop: '16px'}}
                            value={newRoomTag}
                            onChange={(e) => handleChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            label="Unique Tag"
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