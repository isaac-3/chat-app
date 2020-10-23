import { Button } from '@material-ui/core';
import React,{useState, useEffect} from 'react';
import {Link, useHistory} from 'react-router-dom'
import './Signup.css'
import axios from './axios'
import Alert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import ForumIcon from '@material-ui/icons/Forum';

const Signup = () => {

    const history = useHistory()
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [success__open, setSuccOpen] = useState(false)
    const [err__open, setErrOpen] = useState(false)
    const [fields__open, setFieldOpen] = useState(false)
    const [exist__open, setExsistOpen] = useState(false)

    const handleSuccClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setSuccOpen(false)
      };

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
        axios.post('/signup',{
            name,
            email,
            password
        })
        .then(data=>{
            if(data.data.error){
                setExsistOpen(true)
            }else{
                setSuccOpen(true)
                // history.push('/login')
            }
        })
        .catch(err => {
            setFieldOpen(true)
        })
    }

    return (
        <div className="signup">
            <Snackbar open={exist__open} autoHideDuration={3000} onClose={handleExistClose} anchorOrigin={{ vertical: "top", horizontal: "center" }} className="signup__alert">
                <Alert variant="outlined" severity="error">
                    User already exisit with that email
                </Alert>
            </Snackbar>
            <Snackbar open={fields__open} autoHideDuration={3000} onClose={handleFieldClose} anchorOrigin={{ vertical: "top", horizontal: "center" }} className="signup__alert">
                <Alert variant="outlined" severity="error">
                    Please Enter all the fields!
                </Alert>
            </Snackbar>
            <Snackbar open={err__open} autoHideDuration={3000} onClose={handleErrClose} anchorOrigin={{ vertical: "top", horizontal: "center" }} className="signup__alert">
                <Alert variant="outlined" severity="error">
                    Invalid Email
                </Alert>
            </Snackbar>
            <Snackbar open={success__open} autoHideDuration={3000} onClose={handleSuccClose} anchorOrigin={{ vertical: "top", horizontal: "center" }} className="signup__alert">
                <Alert variant="outlined" severity="success">
                    Successfully Signuped Up!
                </Alert>
            </Snackbar>
            <div className="signup__container">
                {/* <img src="https://www.kindpng.com/picc/m/74-747955_redes-sociales-logos-png-whatsapp-logo-png-transparent.png" alt=""/> */}
                <ForumIcon style={{fontSize: "100px"}} className=" logo_icon"/>
                <div className="signup__manuel">
                    <input
                    type="text"
                    placeholder="name"
                    value={name}
                    onChange={(e)=>setName(e.target.value)}
                    />
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
                        onClick={() => postdata()}
                    >Signup</Button>
                    <h5 className="signup__text"><Link to='/login'>Already have an account ?</Link></h5>
                    <h5 className="signup__text"><Link to='/reset'>Forgot password</Link></h5>
                </div>
            </div>
        </div>
    );
}
 
export default Signup;