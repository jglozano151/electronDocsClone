import React from 'react';
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

// import Button from 'semantic-ui-react';
import {ContentState, Editor, EditorState, RichUtils, convertFromRaw, convertToRaw, Modifier} from 'draft-js';

// SOCKET
const io = require('socket.io-client')

export default class DocumentView extends React.Component {
  constructor(props) {
    super(props)
    // const socket = io.connect(this.props.url)
    this.state = {
      editorState: EditorState.createEmpty(),
      docName: 'Loading...',
      collaborators: [],
      bold: false,
      italic: false,
      underline: false,
      leftAlign: true,
      centerAlign: false,
      rightAlign: false,
      anchorEl: null,
      anchorEl2: null,
      newCollabs: [],
      myChange: false,
      socket: io.connect(this.props.url),
      history: []
    }
    this.onChange = (editorState) => {
      // var selectionState = editorState.getSelection()
      // var collapsed = selectionState.isCollapsed()
      // if (!collapsed) {
      //   editorState = Modifier.applyInlineStyle(editorState,selectionState,'HIGHLIGHT')
      // }


      // if (collapsed) {
      //   //render cursor
      // } else {
      //   editorState = Modifier.applyInlineStyle(editorState,selectionState,'HIGHLIGHT')
      // }
      // var selectionState = editorState.getSelection()
      // var collapsed = selectionState.isCollapsed()
      // var anchorKey = selectionState.getAnchorKey()
      // var anchorOffset = selectionState.getAnchorOffset()
      // var focusKey = selectionState.getFocusKey()
      // var focusOffset= selectionState.getFocusOffset()

      const contentState = editorState.getCurrentContent()

      this.setState({editorState})
      this.state.socket.emit('makeChange', {text: JSON.stringify(convertToRaw(contentState))})
    }
  }

  componentDidMount() {
    this.state.socket.emit('room', this.props.docId);

    this.state.socket.on('receiveChange', (data) => {
      console.log('Receiving from server: ', data.text)
      let newtext = convertFromRaw(JSON.parse(data.text))
      let editorState = EditorState.createWithContent(newtext)
      this.setState({editorState})
    })

    fetch(this.props.url + '/documentview/' + this.props.userId + '/' + this.props.docId, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(response => (response.json()))
      .then((doc) => {
        this.setState({docName: doc.title, owner: doc.owner, history: doc.revision})
        if (doc.revision) {
          let text = convertFromRaw(JSON.parse(doc.revision[doc.revision.length-1].text))
          let editorState = EditorState.createWithContent(text)
          this.setState({
            editorState: editorState
          })
        }
        let collaborators = []
        console.log(doc.collaborators)
        Promise.all(
          doc.collaborators.map((collab) => {
            fetch(this.props.url + '/users/' + collab, {
              headers: {
                'Content-Type': 'application/json'
              }
            })
              .then(response => response.json())
              .then((user) => {
                collaborators.push(user.name)
                console.log(collaborators)
              })
          })
          .then(this.setState({collaborators}))
        )
      })
      .catch((err) => {
        alert('Failed to load document')
        console.log(err)
      })
  }
  viewList(userId) {
    this.props.changePage('docList', userId, null)
  }
  // Modal functions
  handleOpen = event => {
    this.setState({anchorEl: event.currentTarget})
  }
  handleClose = () => {
    this.setState({anchorEl: null, newCollabs: []})
  }
  handleOpen2 = event => {
    this.setState({anchorEl2: event.currentTarget})
  }
  handleClose2 = () => {
    this.setState({anchorEl2: null})
  }
  updateCollabs = (e) => {
    let collaborators = e.target.value.split(',')
    this.setState({newCollabs: collaborators})
  }
  saveCollabs = () => {
    console.log(this.state.newCollabs)
    fetch(this.props.url + '/addCollaborators', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        docId: this.props.docId,
        collaborators: this.state.newCollabs
      })
    })
      .then(() => {
        alert(`Added ${this.state.newCollabs} as collaborators`)
        this.setState({newCollabs: []})
      })
      .catch(err=>{
        alert('Failed to save')
        console.log(err)
      })
  }
  // Changing text style functions
  _onBoldClick(e) {
    e.preventDefault()
    this.state.bold ?
      this.setState({bold: false}) : this.setState({bold: true})
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'))
    console.log(this.state.collaborators)
  }
  _onItalicClick(e) {
    e.preventDefault()
    this.state.italic ?
      this.setState({italic: false}) : this.setState({italic: true})
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'ITALIC'))
  }
  _onUnderlineClick(e) {
    e.preventDefault()
    this.state.underline ?
      this.setState({underline: false}) : this.setState({underline: true})
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'UNDERLINE'))
  }
  saveFile(e) {
    e.preventDefault()
    const contentState = this.state.editorState.getCurrentContent()
    const saveData = JSON.stringify(convertToRaw(contentState))
    fetch(this.props.url + '/savefile/' + this.props.docId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({userId: this.props.userId, text: saveData})
    })
    .then(response => (response.json()))
    .then(res => {
      if (res.success) {
        alert('file saved!')
      }
    })
    .catch(err=>console.log(err))
  }
  searchTerm = (term) => {
    console.log(term.target.value)
  }
  revertDoc = (text) => {
    let newtext = convertFromRaw(JSON.parse(text))
    let editorState = EditorState.createWithContent(newtext)
    this.setState({editorState})
  }
  // Font Color, Font Size, Left/center/right align paragraph, bullet/numbered lists
  render() {
    const { anchorEl } = this.state
    return (
      <div>
        <Card>
          <CardContent>
            <Typography variant = "headline">
              <Button onClick = {() => this.viewList(this.props.userId)} style = {{buttonStyle}} variant = "contained"/>
              Edit Document
            </Typography>
          </CardContent>
        </Card>
        <Card style = {buttonStyle}>
          <CardContent>
            <Typography style = {buttonStyle}> <ion-icon name = "create"/> Editing '{this.state.docName}' </Typography>
            {this.state.collaborators.map((collaborator) => (
              <Chip style = {buttonStyle} avatar = {<Avatar>{collaborator[0]}</Avatar>} label = {collaborator}/>
            ))}
            <Button style = {buttonStyle} variant = "contained" color = "primary"
              style = {buttonStyle} onMouseDown = {(e) => this.saveFile(e)}>
              Save
            </Button>
            {/* Text editor options styles */}
            <div>
              <Button variant = {this.state.bold ? 'contained' : 'outlined'} style = {buttonStyle} onMouseDown = {(e) => this._onBoldClick(e)}>
                <b> B </b>
              </Button>
              <Button variant = {this.state.italic ? 'contained' : 'outlined'} style = {buttonStyle} onMouseDown = {(e) => this._onItalicClick(e)}>
                <i> I </i>
              </Button>
              <Button variant = {this.state.underline ? 'contained' : 'outlined'} style = {buttonStyle} onMouseDown = {(e) => this._onUnderlineClick(e)}>
                <u> U </u>
              </Button>
              <RaisedButton style = {buttonStyle} onMouseDown = {(e) => this.changeColor(e)}>
                Color
              </RaisedButton>
              <RaisedButton style = {buttonStyle} onMouseDown = {(e) => this.alignLeft(e)}>
                <ion-icon name="list"/>
              </RaisedButton>
              <RaisedButton style = {buttonStyle} onMouseDown = {(e) => this.alignCenter(e)}>
                <ion-icon name = "menu"/>
              </RaisedButton>
              <RaisedButton style = {buttonStyle} onMouseDown = {(e) => this.alignRight(e)}>
                <ion-icon name = "remove"/>
              </RaisedButton>
              <Button variant = "contained" color = "primary" onClick = {this.handleOpen}> History </Button>
              <Popover
                open = {Boolean(anchorEl)}
                anchorEl = {anchorEl}
                onClose = {this.handleClose}
                anchorOrigin = {{vertical: 'button', horizontal: 'center'}}
                transformOrigin = {{vertical: 'top', horizontal: 'center'}}
              >
                <div style = {popoverStyle}>
                  <Typography style = {popoverStyle}> This Document's History </Typography>
                  {this.state.history.map((history) => (
                    <Card>
                      <CardContent>
                        <Typography variant = "subheading"> {history.author} </Typography>
                        <Typography variant = "subheading"> {history.time} </Typography>
                        <Button style = {buttonStyle} variant = "contained"
                          onMouseDown = {() => this.revertDoc(history.text)}>
                          Revert </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </Popover>
            </div>
            <ion-icon name = "search" style = {{marginLeft: '20px'}}/> <Input onChange={(term) => this.searchTerm(term)} />
          </CardContent>
        </Card>
        <Card style = {editorStyle}>
          <Editor style = {editorStyle} editorState = {this.state.editorState} onChange = {this.onChange.bind(this)}/>
        </Card>

      </div>
    )
  }
}

const editorStyle = {
  margin: '20px',
  minHeight: '350px',
  padding: '20px',
  'HIGHLIGHT': {
    backgroundColor: 'lightgreen'
  }
}

const buttonStyle = {
  margin: '10px'
}

const popoverStyle = {
  padding: '15px'
}
