import React, { useState } from 'react';
import { Button } from '@material-ui/core'
import './Login.css'
import {Link, useHistory, useParams} from 'react-router-dom'
import axios from './axios'
import Alert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import ForumIcon from '@material-ui/icons/Forum';

const Resetpassword = () => {

    const [password, setPassword] = useState('')
    const history = useHistory()
    const [err__open, setErrOpen] = useState(false)
    const [fields__open, setFieldOpen] = useState(false)
    const [exist__open, setExsistOpen] = useState(false)
    const {token} = useParams()

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
        axios.post('/newpassword',{
            password,
            token
        })
        .then(data=>{
            if(data.data.error){
                setExsistOpen(true)
            }else{
                history.push('/login')
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
                {/* <img src="https://www.kindpng.com/picc/m/74-747955_redes-sociales-logos-png-whatsapp-logo-png-transparent.png" alt=""/> */}
                <ForumIcon style={{fontSize: "100px"}} className=" logo_icon"/>
                <div className="login__manuel">
                    <input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    />
                    <Button
                        onClick={()=>postdata()}
                    >Update Password</Button>
                </div>
            </div>
        </div>
    );
}
 
export default Resetpassword;