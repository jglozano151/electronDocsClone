import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import AddIcon from '@material-ui/icons/Add';
// import Button from 'semantic-ui-react';
import {ContentState, Editor, EditorState, RichUtils, convertFromRaw, convertToRaw} from 'draft-js';

// const socket = io.connect('http://')

const dummyProps = {
  title: 'Test doc',
  text: 'Testing text 123'
}

export default class DocumentView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      editorState: EditorState.createEmpty(),
      docName: 'Loading...',
      bold: false,
      italic: false,
      underline: false,
      leftAlign: true,
      centerAlign: false,
      rightAlign: false,
    }
    this.onChange = (editorState) => {
      this.setState({editorState})
      // io.emit('makeChange', {text: this.state.editorState})
    }
    // socket.on('makeChange', (data) => this.setState({editorState: data.text}))
  }
  componentWillMount() {
    // let blockArray = convertFromRaw(dummyProps.text)
    // let contentState = ContentState.createFromBlockArray(blockArray)
    let editorState = EditorState.createWithContent(contentState)
    // this.setState({editorState: editorState, docname: dummyProps.title})
  }
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
    console.log(convertToRaw(this.state.editorState.getCurrentContent))
  }
  // Font Color, Font Size, Left/center/right align paragraph, bullet/numbered lists
  render() {
    return (
      <div>
        <Card>
          <CardContent>
            <Typography variant = "headline"> Edit Document </Typography>
          </CardContent>
        </Card>
        <Card style = {buttonStyle}>
          <CardContent>
            <Typography style = {buttonStyle}> <ion-icon name = "create"/> Editing '{this.state.docName}' </Typography>
            <Chip style = {buttonStyle} avatar = {<Avatar> JL </Avatar>} label = 'Joe Lozano'/>
            <Chip style = {buttonStyle} avatar = {<Avatar> IC </Avatar>} label = 'Isabelle Chun'/>
            <Chip style = {buttonStyle} avatar = {<Avatar> YS </Avatar>} label = 'Yuna Shin'/>
            <Button style = {buttonStyle} variant = "fab" mini color = "primary"><ion-icon name = "add"/></Button>
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
              <RaisedButton style = {buttonStyle} onMouseDown = {(e) => this.changeFontSize(e)}>
                Size
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
