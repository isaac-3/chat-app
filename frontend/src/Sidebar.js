import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import DonutLargeIcon from '@material-ui/icons/DonutLarge';
import ChatIcon from '@material-ui/icons/Chat';
import {Avatar, Button, ClickAwayListener, Dialog, IconButton, MenuItem, MenuList, Paper, Popper, TextField} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SearchOutlined from '@material-ui/icons/SearchOutlined';
import SidebarChat from './SidebarChat'
import axios from './axios'
import Pusher from 'pusher-js'
import { useStateValue } from './StateProvider';
import socketIo from 'socket.io-client'
import { useHistory } from 'react-router-dom';
import { actionTypes } from './reducer';
import Chat from './Chat';
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import CloseIcon from "@material-ui/icons/Close";

const socket = socketIo('http://localhost:9000')

const Sidebar = ({allRooms}) => {

    const [rooms, setRooms] = useState(allRooms)
    const [everyRoom, setEveryRooms] = useState([])
    const [{user}, dispatch] = useStateValue()
    const [userOpts, setOpts] = useState(false)
    const [anc, setAnc] = useState(null)
    const [search, setSearch] = useState('')
    const [dmOpts, setdmOpts] = useState(false)
    let history = useHistory()

    useEffect(() => {
        axios.get('/allrooms')
        .then(res => {
            let r = res.data.filter(room => {
                return !user.rooms.includes(room._id)
            })
            setEveryRooms(r)
        })
    },[])
    
    useEffect(()=>{
        socket.on('new-room', (newRoom) => {
            setEveryRooms([...everyRoom, newRoom])
        })
        // socket.off('new-room')
    },[everyRoom])

    // useEffect(() => {
        socket.on('join-room', (info) => {
            if(info.newRoom.members.some(e => e._id === user._id) && info.currUser === user._id){
                if (!(rooms.some(e => e._id === info.newRoom._id))) {
                    setRooms([...rooms, info.newRoom])
                  }
                const newSet = everyRoom.filter(room => {
                    return room._id !== info.newRoom._id
                })
                setEveryRooms(newSet)
            }
        })
    // },[rooms])

    useEffect(() => {
        socket.on("leave-room",(info) => {
            if(user._id === info.currUser._id){
                setRooms(info.currUser.rooms)
                setEveryRooms([...everyRoom, info.leaveRoom]) 
            }
        })
    },[rooms])


    const handleClose = () => {
        setOpts(false)
    }

    const openOpts = (a) => {
        setAnc(a)
        setOpts(true)
    }

    const logOut = () => {
        axios.post('/logout',{
            user: user
        })
        localStorage.clear()
        dispatch({
            type: actionTypes.LOG_OUT
        })
        history.push('/login')
    }

    const joinChat = (e) => {
        e.preventDefault()
        axios.post("/joinroom",{
            user,
            tag: search
        })
        .then(res => {
            localStorage.setItem("user", JSON.stringify(res.data.result))
        })
        setSearch('')
    }

    const handledmClose = () => {
        setdmOpts(false)
    }


    return (
        <div className='sidebar'>
            <Popper className='userOpts' open={userOpts} disablePortal placement='bottom-start' anchorEl={anc}>
                <Paper >
                    <ClickAwayListener onClickAway={()=>handleClose()}>
                        <MenuList autoFocusItem={true}>
                        <MenuItem>Profile</MenuItem>
                        <MenuItem>My account</MenuItem>
                        <MenuItem onClick={()=>logOut()}>Logout</MenuItem>
                        </MenuList>
                    </ClickAwayListener>
                </Paper>
            </Popper>
            <Dialog
                open={dmOpts}
                onClose={() => handledmClose()}
                aria-labelledby="form-dialog-title"
            >
                <MuiDialogTitle id="form-dialog-title">
                Find A User
                <IconButton
                    style={{ float: "right", padding: "4px" }}
                    onClick={() => handledmClose()}
                >
                    <CloseIcon />
                </IconButton>
                </MuiDialogTitle>

            </Dialog>
            <div className='sidebar__header'>
                <Avatar src="https://media.istockphoto.com/videos/multicolored-motion-gradient-background-shades-of-gray-video-id1063727164?s=640x640"/>
                <p className="sidebar__header__username">{user.name}</p>
                <div  className='sidebar__headerRight'>
                    <IconButton>
                        <DonutLargeIcon/>
                    </IconButton>
                    <IconButton
                        onClick={()=> setdmOpts(true)}
                    >
                        <ChatIcon/>
                    </IconButton>
                    <IconButton
                        onClick={(e) => openOpts(e.target)}
                    >
                        <MoreVertIcon/>
                    </IconButton>
                </div>
            </div>
            <div className='sidebar__search'>
                <div className='sidebar__searchContainer'>
                    <SearchOutlined/>
                    <Autocomplete
                    inputValue={search}
                    onInputChange={(e,n) => {
                        setSearch(n)
                    }}
                    id="combo-box-demo"
                    options={everyRoom}
                    getOptionLabel={(rooms) => rooms.tag}
                    style={{ flex: '1' }}
                    renderInput={(params) => <TextField {...params} label="Join A Room" style={{marginBottom: '14px'}}/>}
                    />
                    <Button onClick={(e) => joinChat(e)}>
                        JOIN
                    </Button>
                </div>
            </div>
            <div className='sidebar__chats'>
                <SidebarChat addNewChat/>
                {rooms.map(room => (
                    <SidebarChat key={room._id} id={room._id} name={room.name}/>
                ))}
            </div>
       </div>
    );
}
 
export default Sidebar;