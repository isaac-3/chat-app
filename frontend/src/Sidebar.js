import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import DonutLargeIcon from '@material-ui/icons/DonutLarge';
import ChatIcon from '@material-ui/icons/Chat';
import {Avatar, Button, ClickAwayListener, IconButton, MenuItem, MenuList, Paper, Popper, TextField} from '@material-ui/core'
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

const socket = socketIo('http://localhost:9000')

const Sidebar = ({allRooms}) => {

    const [rooms, setRooms] = useState(allRooms)
    const [everyRoom, setEveryRooms] = useState([])
    const [{user}, dispatch] = useStateValue()
    const [userOpts, setOpts] = useState(false)
    const [anc, setAnc] = useState(null)
    const [search, setSearch] = useState('')
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
    
    socket.on('new-room', (newRoom) => {
        setEveryRooms([...everyRoom, newRoom])
    })

    socket.on('join-room', (info) => {
        if(info.newRoom.members.includes(user._id) && info.currUser === user._id){
            setRooms([...rooms, info.newRoom])
            const newSet = everyRoom.filter(room => {
                return room._id !== info.newRoom._id
            })
            setEveryRooms(newSet)
        }
    })

    const handleClose = () => {
        setOpts(false)
    }

    const openOpts = (a) => {
        setAnc(a)
        setOpts(true)
    }

    const logOut = () => {
        localStorage.clear()
        dispatch({
            type: actionTypes.LOG_OUT
        })
        history.push('/login')
    }

    const joinChat = () => {
        axios.post("/joinroom",{
            user,
            tag: search
        })
        .then(res => {
            localStorage.setItem("user", JSON.stringify(res.data.result))
        })
        setSearch('')
    }

    const autoFocus = true

    return (
        <div className='sidebar'>
            <Popper className='userOpts' open={userOpts} disablePortal placement='bottom-start' anchorEl={anc}>
                <Paper >
                    <ClickAwayListener onClickAway={()=>handleClose()}>
                        <MenuList autoFocusItem={autoFocus}>
                        <MenuItem>Profile</MenuItem>
                        <MenuItem>My account</MenuItem>
                        <MenuItem onClick={()=>logOut()}>Logout</MenuItem>
                        </MenuList>
                    </ClickAwayListener>
                </Paper>
            </Popper>

            <div className='sidebar__header'>
                <Avatar src="https://media.istockphoto.com/videos/multicolored-motion-gradient-background-shades-of-gray-video-id1063727164?s=640x640"/>
                <div  className='sidebar__headerRight'>
                    <IconButton>
                        <DonutLargeIcon/>
                    </IconButton>
                    <IconButton>
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
                    renderInput={(params) => <TextField {...params} label="Open Rooms" style={{marginBottom: '14px'}}/>}
                    />
                    <Button onClick={() => joinChat()}>
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