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

  useEffect(() => {
    axios.get('/rooms/sync')
    .then(res=>{
      setRooms(res.data)
    })
    
},[])

  return (
    <div className="app">
      {!user ? (
        <Router>
          <Route exact path="/login">
            <Login/>
          </Route>
            <Route exact path="/signup">
            <Signup/>
          </Route>
        </Router>
      ) : (
        <div className="app__body">
        <Router>
          <Sidebar allRooms={allRooms}/>
          {/* <Chat /> */}
          <Switch>
            <Route exact path="/rooms/:roomId">
              <Chat />
            </Route>
            {/* <Route path="/rooms">
              <Chat />
            </Route> */}
          </Switch>
        </Router>
      </div>
      )}
    </div>
  );
}

export default App;
