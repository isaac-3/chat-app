import React, { useState } from 'react';
import { Button } from '@material-ui/core'
import './Login.css'
import {auth, provider} from './firebase'
import { useStateValue } from './StateProvider';
import { actionTypes } from './reducer';
import {Link, useHistory} from 'react-router-dom'
import axios from './axios'
import Alert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import ForumIcon from '@material-ui/icons/Forum';

const Login = () => {

    const [{}, dispatch] = useStateValue()
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const history = useHistory()
    const [err__open, setErrOpen] = useState(false)
    const [fields__open, setFieldOpen] = useState(false)
    const [exist__open, setExsistOpen] = useState(false)

    const handleErrClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setErrOpen(false)
    };

    const handleFieldClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setFieldOpen(false)
    };

    const handleExistClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setExsistOpen(false)
    };

    const postdata = () => {
        if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)){
            setErrOpen(true)
            return
        }
        axios.post('/login',{
            email,
            password
        })
        .then(data=>{
            if(data.data.error){
                setExsistOpen(true)
            }else{
                dispatch({
                    type: actionTypes.SET_USER,
                    user: data.data.user
                })
                localStorage.setItem("user", JSON.stringify(data.data.user))
                history.push('/rooms')
            }
        }).catch(err => {
            setFieldOpen(true)
        })
    }
    
    return (
        <div className="login">
            <Snackbar open={fields__open} autoHideDuration={3000} onClose={handleFieldClose} anchorOrigin={{ vertical: "top", horizontal: "center" }} className="signup__alert">
                <Alert variant="outlined" severity="error">
                    Please Enter all the fields!
                </Alert>
            </Snackbar>
            <Snackbar open={err__open} autoHideDuration={3000} onClose={handleErrClose} anchorOrigin={{ vertical: "top", horizontal: "center" }} className="signup__alert">
                <Alert variant="outlined" severity="error">
                    Invalid Email!
                </Alert>
            </Snackbar>
            <Snackbar open={exist__open} autoHideDuration={3000} onClose={handleExistClose} anchorOrigin={{ vertical: "top", horizontal: "center" }} className="signup__alert">
                <Alert variant="outlined" severity="error">
                    Incorrect Email Or Password
                </Alert>
            </Snackbar>
            <div className="login__container">
                <ForumIcon style={{fontSize: "100px"}} className=" logo_icon"/>
                <div className="login__manuel">
                    <input
                    type="text"
                    placeholder="email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    />
                    <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    />
                    <Button
                        onClick={()=>postdata()}
                    >Login</Button>
                    <h5 className="login__text"><Link to='/signup'>Dont have an account ? Sign Up!</Link></h5>
                    <h5 className="signup__text"><Link to='/reset'>Forgot password</Link></h5>
                </div>
            </div>
        </div>
    );
}
 
export default Login;