import { Avatar, IconButton, MenuItem } from '@material-ui/core';
import React from 'react';
import MicIcon from '@material-ui/icons/Mic';
import SendIcon from '@material-ui/icons/Send';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import SearchOutlined from '@material-ui/icons/SearchOutlined';
import AttachFile from '@material-ui/icons/AttachFile';
import MoreVert from '@material-ui/icons/MoreVert';
import './Chat.css'

const Chatt = () => {

    return (
        <div className='chat' 
        // style={{display: cc !== undefined ? "none" : null}}
        >
            <div className="chat__header">
                <Avatar />
                <div className="chat__headerInfo">
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
            </div>
            <div className="chat__footer">
                <InsertEmoticonIcon/>
                <form>
                    <input placeholder="Type A Message" type="text"/>
                    <IconButton type="submit" >
                        <SendIcon/>
                    </IconButton>
                </form>
                <MicIcon/>
            </div>
        </div>
    );
}
 
export default Chatt;