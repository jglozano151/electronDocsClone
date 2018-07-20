//TO DO:
//Alignment
//highlight
//cursor

import React from 'react';
import ColorPicker from 'material-ui-color-picker'
import RaisedButton from 'material-ui/RaisedButton';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import AddIcon from '@material-ui/icons/Add';
import ListIcon from '@material-ui/icons/List';
import ReorderIcon from '@material-ui/icons/Reorder';
import TocIcon from '@material-ui/icons/Toc'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Fade from '@material-ui/core/Fade';
import Popover from '@material-ui/core/Popover';
import Input from '@material-ui/core/Input';

// import Button from 'semantic-ui-react';
import {ContentState, Editor, EditorState, RichUtils, convertFromRaw, convertToRaw, Modifier, SelectionState, CompositeDecorator} from 'draft-js';

// SOCKET
const io = require('socket.io-client')

// Constants for search & highlight functionality
const generateDecorator = (highlightTerm) => {
  const regex = new RegExp(highlightTerm, 'g');
  return new CompositeDecorator([{
    strategy: (contentBlock, callback) => {
      if (highlightTerm !== '') {
        findWithRegex(regex, contentBlock, callback);
      }
    },
    component: SearchHighlight
  }])
}

const findWithRegex = (regex, contentBlock, callback) => {
  const text = contentBlock.getText();
  let matchArr, start, end;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    end = start + matchArr[0].length;
    callback(start, end);
  }
}

const SearchHighlight = (props) => (
  <span style = {{background: 'yellow'}}>{props.children}</span>
);


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
      alignment: {'textAlign': 'left'},
      anchorEl: null,
      anchorEl2: null,
      newCollabs: [],
      myChange: false,
      socket: io.connect(this.props.url),
      history: [],
      search: '',
      replace: '',
      emitColor: '',  //color that this socket emits when making a change
      receiveChangeHighlightColor: ''  //highlight color for other user
    }

    // this.onChange = (editorState) => {
    //   var contentState = editorState.getCurrentContent()
    //   var selectionState = editorState.getSelection()
    //   this.setState({editorState})
    //   this.state.socket.emit('makeChange', {
    //     text: JSON.stringify(convertToRaw(contentState)),
    //     selection:selectionState,
    //     color: this.state.emitColor
    //   })
    // }
    this.onChange = (editorState) => {
      var contentState = editorState.getCurrentContent()
      var selectionState = editorState.getSelection()

      if (selectionState.isCollapsed()) {
        console.log(true)
        this.setState({editorState})
        this.state.socket.emit('makeChange', {
          text: JSON.stringify(convertToRaw(contentState)),
          selection: selectionState
        })
      } else {
        this.setState({editorState})
        this.state.socket.emit('sendHighlight', {
          text: JSON.stringify(convertToRaw(contentState)),
          selection: selectionState,
          viewer: this.state.viewer
        })
      }
    }
  }

  componentDidMount() {
    //this.state.socket.emit('room', this.props.docId);
    this.state.socket.emit('room', {docId: this.props.docId, userId: this.props.userId});
    this.state.socket.on('colorAssign', (viewer) => {  //colorObj has color: String,  viewer: #
      console.log('viewer string input', viewer)
      this.setState({viewer})  //, emitColor: colorObj.color})
    })

    //listening for a highlight
    this.state.socket.on('receiveHighlight', (data) => {  //data has keys text, selection, viewer
      console.log('viewer on client receiveHighlight', data.viewer)

      var contentState = this.state.editorState.getCurrentContent()
      //this.onChange(EditorState.createWithContent(contentState))
      var selectionState = SelectionState.createEmpty()  //moved to receive highlight, add new highlight portion
      var updatedSelectionState = selectionState.merge(data.selection)
      // var selectionState = this.state.editorState.getSelection()  //get previous highlight
      // contentState = Modifier.removeInlineStyle(contentState, selectionState, this.state.viewer)  //remove previous highlight
      contentState = Modifier.applyInlineStyle(contentState,updatedSelectionState, data.viewer)
      let editorState = EditorState.createWithContent(contentState)
      this.setState({editorState})
      //this.onChange(EditorState.createWithContent(contentState))
    })

    this.state.socket.on('receiveColorChange', (color) => {
      if (!styleMap.hasOwnProperty(color)) styleMap[color] = {color:color}
    })

    this.state.socket.on('receiveChange', (data) => {
      console.log('highlight color of received text', data.color)  //get color of highlight with data.color
      this.setState({receiveChangeHighlightColor: data.color})
      //console.log('Receiving from server: ', data.text)
      let contentState = convertFromRaw(JSON.parse(data.text))
      var selectionState = SelectionState.createEmpty()
      var updatedSelectionState = selectionState.merge(data.selection)
      contentState = Modifier.applyInlineStyle(contentState,updatedSelectionState,'HIGHLIGHT')

      let editorState = EditorState.createWithContent(contentState)
      this.setState({editorState})
    })

    fetch(this.props.url + '/getStyleMap', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => (response.json()))
    .then((obj) => {
      obj.arr.forEach((item) => {
        styleMap[item.color] = item.styleMap
      })
    })
    .then(() => {
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
                })
            })
            .then(this.setState({collaborators}))
          )
        })
        .catch((err) => {
          console.log(err)
        })
    })
    .catch((err) => {
      console.log('getStyleMap error', err)
    })
  }

  viewList(userId) {
    this.props.changePage('docList', userId, null);
    this.state.socket.emit('leaveRoom', {viewer: this.state.viewer, docId: this.props.docId})
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
  changeColor(color) {
    this.state.socket.emit('colorChange', color)
    var contentState = this.state.editorState.getCurrentContent()
    var selectionState = this.state.editorState.getSelection()
    if (!styleMap.hasOwnProperty(color)) styleMap[color] = {color:color}
    contentState = Modifier.applyInlineStyle(contentState,selectionState,`${color}`)
    this.onChange(EditorState.createWithContent(contentState))
  }
  myBlockStyleFn = (contentBlock) => {
    return this.state.alignment
  }
  setAlignment = (e, align) => {
    e.preventDefault()
    // this.state.socket.emit('alignmentChange', align)
    this.setState({alignment: align})
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
  onChangeSearch = (e) => {
    this.setState({
      search: e.target.value,
      editorState: EditorState.set(this.state.editorState, {decorator: generateDecorator(e.target.value)})
    })
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
              <Button onClick = {() => this.viewList(this.props.userId)}
                style = {{marginRight: '20px'}}
                variant = "contained"
                color = "primary">
                Back to DocList
              </Button>
              <ion-icon name = "create"/> {this.state.docName}
              {this.state.collaborators.map((collaborator) => (
                <Chip style = {buttonStyle} avatar = {<Avatar>{collaborator[0]}</Avatar>} label = {collaborator}/>
              ))}
              <Button style = {buttonStyle} variant = "contained" color = "primary"
                style = {buttonStyle} onMouseDown = {(e) => this.saveFile(e)}>
                Save
              </Button>
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
                        <Typography variant = "body1"> Date: {history.time.substring(0, 10)} </Typography>
                        <Typography variant = "caption"> At {history.time.substring(11, 19)} </Typography>
                        <Button style = {buttonStyle} variant = "contained"
                          onMouseDown = {() => this.revertDoc(history.text)}>
                          Revert </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </Popover>
            </Typography>
          </CardContent>
          <Typography style = {{marginLeft: '20px'}} variant="caption">Document ID: {this.props.docId}</Typography>
        </Card>
        <Card style = {buttonStyle}>
          <CardContent>
            <ion-icon name = "search"/>
            <Input value = {this.state.search}
              onChange = {this.onChangeSearch}
              placeholder = "Search..."
            />
          </CardContent>
        </Card>
        <Card style = {editorStyle}>
          <div style = {{display: 'flex', borderBottom: '1px dashed grey', marginBottom: '15px'}}>
            <div>
              <Typography variant = "caption" style = {{textAlign: 'center', marginBottom: '10px'}}> Text Styling </Typography>
              <Button variant = {this.state.bold ? 'outlined' : ''} onMouseDown = {(e) => this._onBoldClick(e)}>
                <b> B </b>
              </Button>
              <Button variant = {this.state.italic ? 'outlined' : ''} onMouseDown = {(e) => this._onItalicClick(e)}>
                <i> I </i>
              </Button>
              <Button variant = {this.state.underline ? 'outlined' : ''} onMouseDown = {(e) => this._onUnderlineClick(e)}>
                <u> U </u>
              </Button>
            </div>
            <div>
              <Typography variant = "caption" style = {{textAlign: 'center'}}> Text Alignment </Typography>
            <Button style = {buttonStyle} onMouseDown = {(e) => this.setAlignment(e,{textAlign: 'left'})}>
              <ListIcon/>
            </Button>
            <Button style = {buttonStyle} onMouseDown = {(e) => this.setAlignment(e,{textAlign: 'center'})}>
              <ReorderIcon/>
            </Button>
            <Button style = {buttonStyle} onMouseDown = {(e) => this.setAlignment(e,{textAlign: 'right'})}>
              <TocIcon/>
            </Button>
            </div>
            <div>
              <Typography variant = "caption" style = {{textAlign: 'center'}}> Choose Text Color </Typography>
              <ColorPicker
                name='color'
                defaultValue='#000'
                onChange={color => this.changeColor(color)}
              />
            </div>

          </div>
          <Editor customStyleMap={styleMap} blockStyleFn={this.myBlockStyleFn} style = {editorStyle}
                  editorState = {this.state.editorState} onChange = {this.onChange.bind(this)}/>
        </Card>

      </div>
    )
  }
}

{/* <RaisedButton style = {buttonStyle} onMouseDown = {(e) => this.changeColor(e)}>
  Color
</RaisedButton> */}

const styleMap = {
  'left': {
    textAlignment: 'left'
  },
  'center': {
    textAlign: 'center'
  },
  'right': {
    textAlignment: 'right'
  },
  'h1': { //make this color the color received from receiveChange
    backgroundColor: 'LightBlue'
  },
  'h2': {
    backgroundColor: 'LightGreen'
  },
  'h3': {
    backgroundColor: 'Red'
  },
  'h4': {
    backgroundColor: 'LightPink'
  },
  'h5': {
    backgroundColor: 'Orange'
  },
  'h6': {
    backgroundColor: 'Purple'
  }
}

const editorStyle = {
  margin: '20px',
  minHeight: '350px',
  padding: '20px',
}

const buttonStyle = {
  margin: '10px'
}

const popoverStyle = {
  padding: '15px'
}
