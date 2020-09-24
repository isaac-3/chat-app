import { Avatar, IconButton } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import './Chat.css';
import SearchOutlined from '@material-ui/icons/SearchOutlined';
import AttachFile from '@material-ui/icons/AttachFile';
import MoreVert from '@material-ui/icons/MoreVert';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import MicIcon from '@material-ui/icons/Mic';
import axios from './axios'
import {useParams} from 'react-router-dom'
import { useStateValue } from './StateProvider';
import Pusher from 'pusher-js'
import socketIo from 'socket.io-client'
import SendIcon from '@material-ui/icons/Send';

const socket = socketIo('http://localhost:9000')

const Chat = () => {

    const [input, setInput] = useState("")
    const {roomId} = useParams()
    const [roomName, setroomName] = useState('')
    const [msgs, setMsgs] = useState([])
    const [{user}, dispatch] = useStateValue()

    useEffect(()=>{
        if(roomId){
            axios.get(`/rooms/${roomId}`)
            .then(room=>{
                setroomName(room.data.room.name)
                setMsgs(room.data.room.messages)
            })
        }
    },[roomId])

    const sendMessage = async (e) => {
        e.preventDefault()
        await axios.patch('/messages/new', {
            message: input,
            postedBy: user._id,
            roomId: roomId
        })
        setInput('')
    }

    socket.on('new-msg', (newMsg) => {
        if(newMsg.roomId === roomId){
            setMsgs([...msgs, newMsg])
        }
    })

    return (
        <div className='chat'>
            <div className="chat__header">
                <Avatar />
                <div className="chat__headerInfo">
                    <h3>{roomName}</h3>
                    <p>last seen at ...</p>
                </div>
                <div className="chat__headerRight">
                    <IconButton>
                        <SearchOutlined />
                    </IconButton>
                    <IconButton>
                        <AttachFile />
                    </IconButton>
                    <IconButton>
                        <MoreVert />
                    </IconButton>
                </div>
            </div>
            <div className="chat__body">
                {msgs.map(({postedBy, message, timestamp} )=> (
                    <p className={`chat__message ${postedBy._id === user._id && "chat__receiver"}`}>
                        <span className="chat__name">{postedBy.name}</span>
                        {message}
                        <span className="chat__timestamp">
                            {timestamp}
                        </span>
                    </p>
                ))}
            </div>
            <div className="chat__footer">
                <InsertEmoticonIcon/>
                <form>
                    <input value={input} onChange={e=> setInput(e.target.value)} placeholder="Type A Message" type="text"/>
                    <IconButton type="submit" onClick={(e) =>sendMessage(e)}>
                        <SendIcon/>
                    </IconButton>
                </form>
                <MicIcon/>
            </div>
        </div>
    );
}
 
export default Chat;