import { Avatar, Badge, Button, ClickAwayListener, debounce, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemAvatar, ListItemText, MenuItem, MenuList, Paper, Popper, withStyles } from '@material-ui/core';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import React, { useEffect, useState } from 'react';
import './Chat.css';
import SearchOutlined from '@material-ui/icons/SearchOutlined';
import AttachFile from '@material-ui/icons/AttachFile';
import MoreVert from '@material-ui/icons/MoreVert';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import MicIcon from '@material-ui/icons/Mic';
import axios from './axios'
import {useHistory, useParams} from 'react-router-dom'
import { useStateValue } from './StateProvider';
import Pusher from 'pusher-js'
import socketIo from 'socket.io-client'
import SendIcon from '@material-ui/icons/Send';
import CloseIcon from '@material-ui/icons/Close';
import Chatt from './Chatt';
import { actionTypes } from './reducer';

const socket = socketIo('http://localhost:9000')

const Chat = () => {

    const [input, setInput] = useState("")
    const {roomId} = useParams()
    const [roomName, setroomName] = useState('')
    const [roomMembers, setroomMembers] = useState([])
    const [msgs, setMsgs] = useState([])
    const [{user}, dispatch] = useStateValue()
    const [userOpts, setOpts] = useState(false)
    const [memOpts, setmemOpts] = useState(false)
    const [anc, setAnc] = useState(null)
    const [seed, setSeed] = useState('')
    const history = useHistory()

    useEffect(()=>{
        setSeed(Math.floor(Math.random() * 5000))
    },[])

    useEffect(()=>{
        if(roomId){
            axios.get(`/rooms/${roomId}`)
            .then(room=>{
                setroomName(room.data.room.name)
                setroomMembers(room.data.room.members)
                setMsgs(room.data.room.messages)
            })
        }
    },[roomId])

    const sendMessage = (e) => {
        e.preventDefault()
        axios.patch('/messages/new', {
            message: input,
            postedBy: user._id,
            roomId: roomId
        })
        setInput('')
    }

    const changeInput = (e) => {
        setInput(e)
    }

    socket.on('new-msg', (newMsg) => {
        if(newMsg.roomId === roomId){
            setMsgs([...msgs, newMsg])
        }
        socket.off('new-msg')
    })

    socket.on('join-room', (info) => {
        if(roomId === info.newRoom._id){
            setroomMembers(info.newRoom.members)
        }
    })

    socket.on("leave-room",(info) => {
        if(roomId === info.leaveRoom._id){
            setroomMembers(info.leaveRoom.members)
        }
    })

    useEffect(()=>{
        socket.on("user-logout", logoutUser => {
            let newSet = [...roomMembers]
            let objIndex = newSet.findIndex((obj => obj._id === logoutUser._id))
            if(newSet[objIndex] !== undefined){
                newSet[objIndex].online = logoutUser.online
                setroomMembers(newSet)
            }
        })
        socket.off('user-logout')
    },[roomMembers])
    
    useEffect(()=>{
        socket.on('user-login', loginUser => {
            let newSet = [...roomMembers]
            let objIndex = newSet.findIndex((obj => obj._id === loginUser._id))
            if(newSet[objIndex] !== undefined){
                newSet[objIndex].online = loginUser.online
                setroomMembers(newSet)
            }
        })
        socket.off('user-login')
    },[roomMembers])

    console.log(roomId)

    const handleClose = () => {
        setOpts(false)
    }

    const handleCloseMembers = () => {
        setmemOpts(false)
    }

    const openOpts = (a) => {
        setAnc(a)
        setOpts(true)
    }

    const openmemOpts = () => {
        setOpts(false)
        setmemOpts(true)
    }

    const StyledBadge = withStyles(() => ({
        badge: {
          backgroundColor: '#44b700',
          boxShadow: "0 0 0 2px white",
        },
      }))(Badge);

    const leaveRoom = () => {
        axios.patch('/leaveroom',{
            user,
            roomId: roomId
        })
        .then(res=>{
            dispatch({
                type: actionTypes.SET_USER,
                user: res.data.result
            })
            localStorage.setItem("user", JSON.stringify(res.data.result))
        })
        history.push('/rooms')
    }

    return (
        // roomId !== undefined ? (
                    <div className='chat'>
                                <Dialog open={memOpts} onClose={() => handleCloseMembers()} aria-labelledby="form-dialog-title">
                        <MuiDialogTitle id="form-dialog-title">Members
                            <IconButton style={{float: "right", padding: "4px"}}  onClick={() => handleCloseMembers()}>
                                <CloseIcon />
                            </IconButton>
                        </MuiDialogTitle>
                        <List >
                        {roomMembers.map(member => (
                            <ListItem key={member._id} button style={{textAlign: "center"}}>
                                <ListItemAvatar>
                                <StyledBadge
                                    overlap="circle"
                                    anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                    }}
                                    variant={member.online ? "dot" : null}
                                    // variant={user.online && user._id === member._id ? "dot" : null}
                                >
                                    <Avatar src={`https://avatars.dicebear.com/api/avataaars/${seed}.svg`}/>
                                </StyledBadge>
                                </ListItemAvatar>
                                <ListItemText primary={member.name} style={{float: "left", fontWeight: "900"}}/>
                            </ListItem>
                        ))}
                        </List>
                </Dialog>
                <Popper className='userOpts' open={userOpts} disablePortal placement='bottom-start' anchorEl={anc}>
                    <Paper >
                        <ClickAwayListener onClickAway={()=>handleClose()}>
                            <MenuList autoFocusItem={true}>
                            <MenuItem
                                onClick={() => openmemOpts()}
                            >View Members</MenuItem>
                            <MenuItem
                                onClick={() => leaveRoom()}
                            >Leave Grpup</MenuItem>
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Popper>
                <div className="chat__header">
                    <Avatar />
                    <div className="chat__headerInfo">
                        <h3>{roomName}</h3>
                        {/* {isTyping && "User is typing..."} */}
                    </div>
                    <div className="chat__headerRight">
                        <IconButton>
                            <SearchOutlined />
                        </IconButton>
                        <IconButton>
                            <AttachFile />
                        </IconButton>
                        <IconButton onClick={(e) => openOpts(e.target)}>
                            <MoreVert />
                        </IconButton>
                    </div>
                </div>
                <div className="chat__body">
                {/* <div style={{width: "100px", height: "100px", backgroundColor: "red", zIndex: '1', marginLeft: "auto", marginRight: "auto", alignItems:"center"}}>
                </div> */}
                
                    {msgs.map(({_id, postedBy, message, timestamp} )=> (
                        <p key={_id} className={`chat__message ${postedBy._id === user._id && "chat__receiver"}`}>
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
                        <input value={input} onChange={e=> changeInput(e.target.value)} placeholder="Type A Message" type="text"/>
                        <IconButton type="submit" onClick={(e) =>sendMessage(e)}>
                            <SendIcon/>
                        </IconButton>
                    </form>
                    <MicIcon/>
                </div>
                    </div>
        // ) : (
        //     // <div style={{display: roomId !== undefined ? "none" : null}}>
        //         <Chatt/>
        //     // </div>
        // )
    );
}
 
export default Chat;