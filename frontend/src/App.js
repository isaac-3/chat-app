import React, { useEffect, useState } from 'react';
import './App.css';
import Chat from './Chat';
import Sidebar from './Sidebar';
import Pusher from 'pusher-js'
import axios from './axios'
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import Login from './Login';
import { useStateValue } from './StateProvider';
import Signup from './Signup';
import { actionTypes } from './reducer';
import Chatt from './Chatt'
import Reset from './Reset';
import Resetpassword from './Resetpassword';
// import socketIo from 'socket.io-client'

// const socket = socketIo('http://localhost:9000')

function App() {
  
  const [{user}, dispatch] = useStateValue()
  const [allRooms, setRooms] = useState([])
  const loggedUser = JSON.parse(localStorage.getItem("user"))
  
  useEffect(() => {
    if(loggedUser){
      axios.get(`/users/${loggedUser._id}`)
      .then(data =>{
        dispatch({
          type: actionTypes.SET_USER,
          user: data.data.user
        })
      })
    }
  },[])
  //renderss

  useEffect(() => {
    if(loggedUser){
    axios.post('/rooms/sync',{
      user: loggedUser
    })
    .then(res=>{
      setRooms(res.data)
    })
  }
  },[])

  

  return (
    <div className="app">
      <Router >
      <Route exact path="/reset" component={Reset}/>
      <Route exact path="/reset/:token" component={Resetpassword}/>
      {!user ? (
        <div>
          <Route exact path="/login">
            <Login/>
          </Route>
            <Route exact path="/signup">
            <Signup/>
          </Route>
        </div>
          
      ) : (
        <div className="app__body">
          <Sidebar allRooms={allRooms}/>
          <Route exact path="/rooms/:roomId" component={Chat}/>
          <Route exact path="/rooms" component={Chatt}/>
      </div>
      )}
      </Router>
    </div>
  );
}

export default App;
