import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import DonutLargeIcon from '@material-ui/icons/DonutLarge';
import ChatIcon from '@material-ui/icons/Chat';
import {Avatar, ClickAwayListener, IconButton, MenuItem, MenuList, Paper, Popper} from '@material-ui/core'
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SearchOutlined from '@material-ui/icons/SearchOutlined';
import SidebarChat from './SidebarChat'
import axios from './axios'
import Pusher from 'pusher-js'
import { useStateValue } from './StateProvider';
import socketIo from 'socket.io-client'
import { useHistory } from 'react-router-dom';
import { actionTypes } from './reducer';

const socket = socketIo('http://localhost:9000')

const Sidebar = ({allRooms}) => {

    const [rooms, setRooms] = useState(allRooms)
    const [{user}, dispatch] = useStateValue()
    const [userOpts, setOpts] = useState(false)
    const [anc, setAnc] = useState(null)
    let history = useHistory()
    
    socket.on('new-room', (newRoom) => {
        setRooms([...rooms, newRoom])
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

    return (
        <div className='sidebar'>
            <Popper className='userOpts' open={userOpts} disablePortal placement='bottom-start' anchorEl={anc}>
                <Paper >
                    <ClickAwayListener onClickAway={()=>handleClose()}>
                        <MenuList autoFocusItem='true'>
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
                    <input placeholder='search chat' type='text'/>
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