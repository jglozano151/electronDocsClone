// ROUTES
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
    fetch(this.props.url+'/getDocList/' + this.props.userId, {
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
    fetch(this.props.url+'/newDoc', {
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
    fetch(this.props.url+'/joinDoc', {
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

  render() {
    return (
      <Card>
        <CardContent>
          <Typography variant = "headline" style = {{margin: '10px'}}> Document List  </Typography>
          <div>
            <Button style = {buttonStyle} variant = "contained"
              onClick={()=>this.openNewModal()}> New Document
            </Button>
            <Modal isOpen={this.state.newModalIsOpen}>
              <Typography variant = "headline" style = {{marginBottom: '20px'}}> Create a New Document </Typography>
              <Input style = {{marginBottom: '10px', marginRight: '10px'}}
                placeholder="Title"
                value={this.state.newDocTitle}
                onChange={(e)=>this.setState({newDocTitle:e.target.value})}/>
              <Input type="password" style = {{marginBottom: '10px'}}
                placeholder="Password"
                value={this.state.newDocPassword}
                onChange={(e)=>this.setState({newDocPassword:e.target.value})}/>
              <div>
                <Button style = {buttonStyle} variant = "contained"
                  onClick={()=>this.saveNewModal()}> Create </Button>
                <Button style = {buttonStyle} variant = "contained"
                  onClick={()=>this.cancelNewModal()}> Cancel </Button>
              </div>
            </Modal>
            <Button style = {buttonStyle} variant = "contained"
              onClick={()=>this.openCollabModel()}> Join Document</Button>
            <Modal isOpen={this.state.collabModalIsOpen}>
              <Typography variant = "headline" style = {{marginBottom: '20px'}}>
                Join a Document as Collaborator </Typography>
              <Input style = {{marginBottom: '10px', marginRight: '10px'}} placeholder="Document ID"
                    value={this.state.collabDocID}
                    onChange={(e)=>this.setState({collabDocID:e.target.value})}/>
              <Input type="password" style = {{marginBottom: '10px'}}
                placeholder="Password"
                value={this.state.collabDocPassword}
                onChange={(e)=>this.setState({collabDocPassword:e.target.value})}/>
              <div>
                <Button style = {buttonStyle} variant = "contained" onClick={()=>this.joinCollabModal()}>Join</Button>
                <Button style = {buttonStyle} variant = "contained" onClick={()=>this.cancelCollabModal()}>Cancel</Button>
              </div>
            </Modal>
          </div>
          {this.state.docList.map(item => (
            <Card style = {{margin: '20px', maxWidth: '300px'}}>
              <CardContent>
                <Button style = {buttonStyle} variant = "contained" onClick = {() => this.viewDoc(item._id)}>
                  <Typography> {item.title} </Typography>
                </Button>
                <Typography> Author: {item.owner} </Typography>
                <Typography> Collaborators: {item.collaborators} </Typography>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    )
  }
}

const buttonStyle = {
  margin: '10px'
}
