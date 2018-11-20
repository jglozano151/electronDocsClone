//ROUTES
import React from 'react'
import Modal from 'react-modal'
import RaisedButton from 'material-ui/RaisedButton';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import AddIcon from '@material-ui/icons/Add';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Fade from '@material-ui/core/Fade';
import Popover from '@material-ui/core/Popover';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

export default class DocList extends React.Component {
 constructor(props) {
   super(props)
   this.state = {
     newModalIsOpen: false,
     collabModalIsOpen: false,
     docList: []
   }
 }

 //Fetch all documents for a user
 componentDidMount() {
   fetch('/getDocList/' + this.props.userId, {
     method: 'GET',
     headers: {
       'Content-Type': 'application/json',
     }
   })
   .then(response => (response.json()))
   .then((res) => {
     if (res.success) {
       this.setState({
         docList: res.docs
       })
     } else {
       alert('Failed to fetch document list for userID: ' + this.props.userId)
     }
   })
 }

 //Modal for creating new document
 openNewModal() {
  this.setState({newModalIsOpen: true});
 }

 //Create new document as author
 saveNewModal() {
   fetch('/newDoc', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       userId: this.props.userId,
       title: this.state.newDocTitle,
       password: this.state.newDocPassword
     })
   })
   .then(response => (response.json()))
   .then((res) => {
     if (res.success) {
       this.setState({
         newDocTitle:'',
         newDocPassword:'',
         newModalIsOpen: false
       })
       this.props.changePage('documentview', this.props.userId, res.docId) //Navigate to the created document
     } else {
       alert('Failed to create new document')
     }
   })
 }

 //Cancel creating new document
 cancelNewModal() {
   this.setState({
     newDocTitle:'',
     newDocPassword:'',
     newModalIsOpen: false
   })
 }

 //Modal for joining a document as collaborator
 openCollabModel() {
   this.setState({collabModalIsOpen: true})
 }

 //Join a document as collaborator
 joinCollabModal() {
   fetch('/joinDoc', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       userId: this.props.userId,
       docId: this.state.collabDocID,
       password: this.state.collabDocPassword
     })
   })
   .then(response => (response.json()))
   .then((res) => {
     if (res.success) {
       let docId = this.state.collabDocID
       this.setState({
         collabDocID:'',
         collabDocPassword:'',
         collabModalIsOpen: false
       })
       this.props.changePage('documentview', this.props.userId, docId) //Navigate to specified document
     } else {
       alert('Failed to join document')
     }
   })
 }

 //Cancel joining a document
 cancelCollabModal() {
   this.setState({
     collabDocID:'',
     collabDocPassword:'',
     collabModalIsOpen: false
   })
 }

 //Redirect to view the selected document
 viewDoc(docId) {
   this.props.changePage('documentview', this.props.userId, docId)
 }

//logout
logout() {
  fetch('/logout')
  .then(response => (response.json()))
  .then((res) => {
    if (res.success) {
      this.props.changePage('homepage',null,null)
      console.log('logout success')
    }
  })
  .catch((err) => console.log('logout error', err))
}

 render() {
   return (
     <Card>
       <CardContent>
         <Typography variant = "headline" style = {{margin: '10px'}}> Document List  </Typography>
         <div>
           <Button style = {buttonStyle} variant = "contained"
             onClick={()=>this.openNewModal()}> New Document
           </Button>
           <Modal style={modalStyle} isOpen={this.state.newModalIsOpen}>
             <Typography variant = "headline" style = {{marginBottom: '20px'}}> Create a New Document </Typography>
             <div style={divStyle}>
               <FormControl style={formStyle}>
                 <InputLabel htmlFor="name-simple">Title</InputLabel>
                 <Input onChange={(e) => this.setState({newDocTitle: e.target.value})} />
               </FormControl>
               <FormControl style={formStyle}>
                 <InputLabel htmlFor="name-simple">Password</InputLabel>
                 <Input type="password" onChange={(e) => this.setState({newDocPassword: e.target.value})} />
               </FormControl>
             </div>
             <div style={newStyle}>
               <Button style = {buttonStyle} variant = "contained" color = "primary"
                 onClick={()=>this.saveNewModal()}> Create </Button>
               <Button style = {buttonStyle} variant = "contained"
                 onClick={()=>this.cancelNewModal()}> Cancel </Button>
             </div>
           </Modal>
           <Button style = {buttonStyle} variant = "contained"
             onClick={()=>this.openCollabModel()}> Join Document</Button>
           <Button style = {buttonStyle} variant = "contained"
             onClick={()=>this.logout()}> Logout</Button>
           <Modal style={modalStyle} isOpen={this.state.collabModalIsOpen}>
             <Typography variant = "headline" style = {{marginBottom: '20px'}}>
               Join a Document as Collaborator </Typography>
             <div style={divStyle}>
               <FormControl style={formStyle}>
                 <InputLabel htmlFor="name-simple">Document ID</InputLabel>
                 <Input onChange={(e) => this.setState({collabDocID: e.target.value})} />
               </FormControl>
               <FormControl style={formStyle}>
                 <InputLabel htmlFor="name-simple">Password</InputLabel>
                 <Input type="password" onChange={(e) => this.setState({collabDocPassword: e.target.value})} />
               </FormControl>
             </div>
             <div style={newStyle}>
               <Button style = {buttonStyle} variant = "contained" color = "primary" onClick={()=>this.joinCollabModal()}>Join</Button>
               <Button style = {buttonStyle} variant = "contained" onClick={()=>this.cancelCollabModal()}>Cancel</Button>
             </div>
           </Modal>
         </div>
         {this.state.docList.map(item => (
           <Card style = {{margin: '20px', maxWidth: '400px'}}>
             <CardContent>
               <Typography variant = "display1"> {item.title} </Typography>
               <Typography variant = "subheading"> Author: <Name name = {item.owner} url = {this.props.url}/> </Typography>
               <Typography variant = "subheading">
                 Collaborators: {item.collaborators.map((collab) =>
                   <Name name = {collab} url = {this.props.url}/>)}
               </Typography>
               <Button style = {buttonStyle}
                 variant = "contained"
                 onClick = {() => this.viewDoc(item._id)}
                 color = "primary"
               > View
               </Button>
             </CardContent>
           </Card>
         ))}
       </CardContent>
     </Card>
   )
 }
}

class Name extends React.Component {
 state = {
   name: ''
 }
 componentDidMount () {
   fetch(this.props.url + '/users/' + this.props.name)
     .then((result) => result.json())
     .then((res) => this.setState({name: res.name}))
 }
 render() {
   return (
     <Chip style = {buttonStyle} avatar = {<Avatar>{this.state.name[0]}</Avatar>} label = {this.state.name}/>
   )
 }
}

const buttonStyle = {
 margin: '10px'
}

const modalStyle = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
}

const formStyle = {
  width:'200px',
  margin: '2px'
}

const divStyle = {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  margin:'10px'
}

const newStyle = {
  display: 'flex',
  justifyContent: 'center',
}
