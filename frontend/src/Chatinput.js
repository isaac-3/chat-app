// import { IconButton } from '@material-ui/core';
// import React, { useState } from 'react';
// import SendIcon from '@material-ui/icons/Send';
// import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
// import MicIcon from '@material-ui/icons/Mic';
// import axios from './axios'
// import { useStateValue } from './StateProvider';

// const Chatinput = ({roomId}) => {
//     const [input, setInput] = useState("")
//     const [{user}, dispatch] = useStateValue()

//     const changeInput = (e) => {
//         setInput(e)
//     }
//     const sendMessage = (e) => {
//         e.preventDefault()
//         axios.patch('/messages/new', {
//             message: input,
//             postedBy: user._id,
//             roomId: roomId
//         })
//         setInput('')
//     }
//     return (
//         <div>
//                 <InsertEmoticonIcon/>
//                 <form>
//                     <input value={input} 
//                     onChange={e=> changeInput(e.target.value)} 
//                     placeholder="Type A Message" type="text"/>
//                     <IconButton type="submit" 
//                     onClick={(e) =>sendMessage(e)}
//                     >
//                         <SendIcon/>
//                     </IconButton>
//                 </form>
//                 <MicIcon />
//         </div>
//     );
// }
 
// export default Chatinput;