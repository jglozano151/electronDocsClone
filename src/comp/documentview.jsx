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
import {ContentState, Editor, EditorState, RichUtils, convertFromRaw, convertToRaw} from 'draft-js';

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
      newCollabs: [],
    }
    this.onChange = (editorState) => {
      this.setState({editorState})
      let contentState = editorState.getCurrentContent()
      // io.emit('makeChange', {text: this.state.editorState})
    }
    // socket.on('makeChange', (data) => this.setState({editorState: data.text}))
  }
  componentWillMount() {
    fetch(this.props.url + '/documentview/' + this.props.userId + '/' + this.props.docId,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(response => (response.json()))
      .then((doc) => {
        console.log(doc)
        this.setState({docName: doc.title, owner: doc.owner})
        if (doc.text) {
          let text = convertFromRaw(JSON.parse(doc.text))
          let editorState = EditorState.createWithContent(text)
          this.setState({
            editorState: editorState
          })
          let collaborators = []
          Promise.all(
            doc.collaborators.map((collab) => {
              fetch(this.props.url + '/users/' + collab)
                .then((user) => collaborators.push(user))
            })
          )
            .then(this.setState({collaborators: collaborators}))
        }
      })
      .catch((err) => {
        alert('Failed to load document')
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
    console.log(saveData)
    fetch(this.props.url + '/savefile/' + this.props.docId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({text: saveData})
    })
    .then(response => (response.json()))
    .then(res => {
      if (res.success) {
        alert('file saved!')
      }
    })
    .catch(err=>console.log(err))
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
            <Chip style = {buttonStyle} avatar = {<Avatar> JL </Avatar>} label = 'Joe Lozano'/>
            <Chip style = {buttonStyle} avatar = {<Avatar> IC </Avatar>} label = 'Isabelle Chun'/>
            <Chip style = {buttonStyle} avatar = {<Avatar> YS </Avatar>} label = 'Yuna Shin'/>
            <Button variant = "fab" color = "primary" onClick = {this.handleOpen}> <AddIcon/> </Button>
            <Popover
              open = {Boolean(anchorEl)}
              anchorEl = {anchorEl}
              onClose = {this.handleClose}
              anchorOrigin = {{vertical: 'button', horizontal: 'center'}}
              transformOrigin = {{vertical: 'top', horizontal: 'center'}}
            >
              <div style = {popoverStyle}>
                <Typography style = {popoverStyle}> Enter the Emails of the Users That You Want To Add, Separated By Comma </Typography>
                <div>
                  <Input onChange = {this.updateCollabs}/>
                  <Button variant = 'fab' color = "secondary" onClick = {this.saveCollabs}>
                    <AddIcon/> </Button>
                </div>
              </div>
            </Popover>
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
            </div>
          </CardContent>
        </Card>
        <Card style = {editorStyle}>
          <Editor style = {editorStyle} editorState = {this.state.editorState} onChange = {this.onChange}/>
        </Card>
      </div>
    )
  }
}

const editorStyle = {
  margin: '20px',
  minHeight: '350px',
  padding: '20px'
}

const buttonStyle = {
  margin: '10px'
}

const popoverStyle = {
  padding: '15px'
}
