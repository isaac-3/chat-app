import {Avatar,Badge, Button,ClickAwayListener,debounce,Dialog,DialogActions,DialogContent,DialogTitle,IconButton, List,ListItem,ListItemAvatar,ListItemText,MenuItem,MenuList,Paper,Popper,TextField,withStyles} from "@material-ui/core";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import React, { useEffect, useState } from "react";
import "./Chat.css";
import SearchOutlined from "@material-ui/icons/SearchOutlined";
import AttachFile from "@material-ui/icons/AttachFile";
import MoreVert from "@material-ui/icons/MoreVert";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import MicIcon from "@material-ui/icons/Mic";
import axios from "./axios";
import { useHistory, useParams } from "react-router-dom";
import { useStateValue } from "./StateProvider";
import Pusher from "pusher-js";
import socketIo from "socket.io-client";
import SendIcon from "@material-ui/icons/Send";
import CloseIcon from "@material-ui/icons/Close";
import Chatt from "./Chatt";
import { actionTypes } from "./reducer";
import df from 'dateformat'

const Chat = () => {

  const socket = socketIo("http://localhost:9000");
  const [input, setInput] = useState("");
  const { roomId } = useParams();
  const [roomName, setroomName] = useState("");
  const [roomMembers, setroomMembers] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [{ user }, dispatch] = useStateValue();
  const [userOpts, setOpts] = useState(false);
  const [memOpts, setmemOpts] = useState(false);
  const [anc, setAnc] = useState(null);
  const [seed, setSeed] = useState("");
  const history = useHistory();
  const [msgOpts, setMsgOpts] = useState(false);
  const [msgAnc, setMsgAnc] = useState(null);
  const [msgId, setMsgId] = useState(null);
  const [postBy, setPostBy] = useState(null);
  const [editMsg, setEditMsg] = useState(false);
  const [prevMsg, setPrevMsg] = useState('');
  const [focus, setFocus] = useState(false);
  const [type, setType] = useState(null);

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 5000));
  }, []);

  useEffect(() => {
    if (roomId) {
      axios.get(`/rooms/${roomId}/${user._id}`)
      .then((room) => {
        setroomName(room.data.room.name);
        setroomMembers(room.data.room.members);
        setMsgs(room.data.room.messages)
      });
    }
  }, [roomId]);

  const sendMessage = (e) => {
    e.preventDefault();
    axios.patch("/messages/new", {
      message: input,
      postedBy: user._id,
      roomId: roomId,
    });
    setInput("");
    setFocus(false)
  };

  const changeInput = (e) => {
    setInput(e);
  };

  useEffect(() => {
    socket.on("new-msg", (newMsg) => {
        if (newMsg.roomId === roomId) {
            setMsgs([...msgs, newMsg]);
        }
    })
    return () => {
        socket.off("new-msg");
     }
},[msgs])
  
useEffect(() =>{
      socket.on("join-room", (info) => {
    if (roomId === info.newRoom._id) {
      setroomMembers(info.newRoom.members);
    }
  });
},[roomMembers])

useEffect(() => {
    socket.on("leave-room", (info) => {
    if (roomId === info.leaveRoom._id) {
      setroomMembers(info.leaveRoom.members);
    }
  }); 
},[roomMembers])
 
useEffect(()=>{
    socket.on("edit-msg", (room) => {
      if (roomId === room.room._id) {
        setMsgs(room.room.messages)
      }
    })
    return () => {
      socket.off("edit-msg");
   }
},[prevMsg])


  useEffect(() => {
    socket.on("user-logout", (logoutUser) => {
      let newSet = [...roomMembers];
      let objIndex = newSet.findIndex((obj) => obj._id === logoutUser._id);
      if (newSet[objIndex] !== undefined) {
        newSet[objIndex].online = logoutUser.online;
        setroomMembers(newSet);
      }
    });
    // socket.off("user-logout");
  }, [roomMembers]);

  useEffect(() => {
    socket.on("user-login", (loginUser) => {
      let newSet = [...roomMembers];
      let objIndex = newSet.findIndex((obj) => obj._id === loginUser._id);
      if (newSet[objIndex] !== undefined) {
        newSet[objIndex].online = loginUser.online;
        setroomMembers(newSet);
      }
    });
    socket.off("user-login");
  }, [roomMembers]);

  const handleClose = () => {
    setOpts(false);
  };

  const handleMsgClose = () => {
      setMsgOpts(false)
      setMsgAnc(null)
      setMsgId(null)
      setPostBy(null)
  }

  const handleCloseMembers = () => {
    setmemOpts(false);
  };

  const openOpts = (a) => {
    setAnc(a);
    setOpts(true);
  };

  const openmemOpts = () => {
    setOpts(false);
    setmemOpts(true);
  };

  const openMsgOpts = (a, _id, postedBy, message) => {
    setMsgAnc(a)
    setMsgOpts(true)
    setMsgId(_id)
    setPostBy(postedBy)
    setPrevMsg(message)
  }

  const StyledBadge = withStyles(() => ({
    badge: {
      backgroundColor: "#44b700",
      boxShadow: "0 0 0 2px white",
    },
  }))(Badge);

  const leaveRoom = () => {
    axios
      .patch("/leaveroom", {
        user,
        roomId: roomId,
      })
      .then((res) => {
        dispatch({
          type: actionTypes.SET_USER,
          user: res.data.result,
        });
        localStorage.setItem("user", JSON.stringify(res.data.result));
      });
    history.push("/rooms");
  };

  const delMsg = () => {
      axios.patch('/delmsg', {
          msgId,
          roomId,
          user
      })
      .then(res=> {
          if(res.data.roomId=== roomId && res.data.userId === user._id){
            const lastMSgArr = res.data.room.messages.filter(x => !(x.deletedBy.some(e => e._id === res.data.userId)))
              setMsgs(lastMSgArr)
          }
      })
      setMsgOpts(false)
  }

  const openEditMsg = () => {
    setEditMsg(true)
    setMsgOpts(false)
  }

  const handleEditClose = () => {
    setEditMsg(false)
  }

  const sendEditMsg = () => {
    axios.patch('/editmsg', {
        prevMsg,
        msgId,
        roomId,
        user
    })
    setEditMsg(false)
  }

  const isTyping = () => {
    if(focus && input.length > 1){
      socket.emit('SEND_MESSAGE', {
          userName: user.name,
          userId: user._id
      });
    }else{
      socket.emit('SEND_MESSAGE', {
        userName: 'unknown',
        userId: 'unknown'
      });
    }
  }
  
  useEffect(()=>{
    socket.on('RECEIVE_MESSAGE', (u) => {
        let x = document.querySelector(".curr_typing")
        x.innerHTML = `${u.data.userName} is typing ...`
        setType(u)
    });
    return () => {
      socket.off("RECEIVE_MESSAGE");
   }
  },[input])

  const cc = () => {
    setFocus(false)
    setType(null)
    isTyping()
  }
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  return (
    <div className="chat">
      <Dialog
        open={memOpts}
        onClose={() => handleCloseMembers()}
        aria-labelledby="form-dialog-title"
      >
        <MuiDialogTitle id="form-dialog-title">
          Members
          <IconButton
            style={{ float: "right", padding: "4px" }}
            onClick={() => handleCloseMembers()}
          >
            <CloseIcon />
          </IconButton>
        </MuiDialogTitle>
        <List>
          {roomMembers.map((member) => (
            <ListItem key={member._id} button style={{ textAlign: "center" }}>
              <ListItemAvatar>
                <StyledBadge
                  overlap="circle"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  variant={member.online ? "dot" : null}
                >
                  <Avatar
                    src={`https://avatars.dicebear.com/api/avataaars/${seed}.svg`}
                  />
                </StyledBadge>
              </ListItemAvatar>
              <ListItemText
                primary={member.name}
                style={{ float: "left", fontWeight: "900" }}
              />
            </ListItem>
          ))}
        </List>
      </Dialog>
      <Dialog open={editMsg} onClose={() => handleEditClose()} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Edit Message</DialogTitle>
                    <DialogContent>
                        <TextField
                            value={prevMsg}
                            onChange={(e) => setPrevMsg(e.target.value)}
                            autoFocus
                            label="New Msg"
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button 
                        onClick={() => handleEditClose()}
                         color="primary">
                            Cancel
                        </Button>
                        <Button 
                        onClick={() => sendEditMsg()}
                        color="primary">
                            Edit
                        </Button>
                    </DialogActions>
            </Dialog>
      <Popper
        className="userOpts"
        open={userOpts}
        disablePortal
        placement="bottom-start"
        anchorEl={anc}
      >
        <Paper>
          <ClickAwayListener onClickAway={() => handleClose()}>
            <MenuList autoFocusItem={true}>
              <MenuItem onClick={() => openmemOpts()}>View Members</MenuItem>
              <MenuItem onClick={() => leaveRoom()}>Leave Grpup</MenuItem>
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>
      <Popper
        open={msgOpts}
        disablePortal
        placement="bottom-start"
        anchorEl={msgAnc}
        style={{zIndex: '1'}}
      >
        <Paper>
          <ClickAwayListener onClickAway={() => handleMsgClose()}>
            <MenuList autoFocusItem={true}>
              <MenuItem 
              onClick={() => delMsg()}
              >Delete Msg</MenuItem>
                {postBy === user._id &&
              <MenuItem 
              onClick={() => openEditMsg()}
              >Edit Msg</MenuItem>}
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>
      <div className="chat__header">
        <Avatar src={`https://avatars.dicebear.com/api/avataaars/${seed}.svg`}/>
        <div className="chat__headerInfo">
          <h3>{roomName}</h3>
          <p className="curr_typing" 
          style={{display: type && type.data.userId === user._id ? "none" : type && type.data.userName === "unknown" && type.data.userId === "unknown" ? "none": null}}
          ></p>
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
        {msgs.map(({ _id, postedBy, message, timestamp, deletedBy }) => (
          <p key={_id} className={`chat__message ${postedBy._id === user._id && "chat__receiver"} ${postedBy._id !== user._id && "chat__sender"}`} style={{display: deletedBy.some(e => e._id === user._id) ? "none" : null}}
          >
            <span className="chat__name">{postedBy.name}</span>{message}
            <span className="chat__opts">
              <span className="chat__timestamp">{df(timestamp, "ddd mmm dS , h:MM TT")}</span>
              <IconButton onClick={(e) => openMsgOpts(e.target, _id, postedBy._id, message)} size="small">
                  <MoreVert fontSize="small"/>
              </IconButton>
            </span>
          </p>
        ))}
      </div>
      <div className="chat__footer">
        <InsertEmoticonIcon />
        <form>
          <input
            value={input}
            onFocus={() => setFocus(true)}
            onBlur={() => cc()}
            onChange={(e) => changeInput(e.target.value)}
            onKeyDown={() => isTyping()}
            placeholder="Type A Message"
            type="text"
          />
          <IconButton type="submit" onClick={(e) => sendMessage(e)}>
            <SendIcon />
          </IconButton>
        </form>
        <MicIcon />
      </div>
    </div>
  );
};

export default Chat;
