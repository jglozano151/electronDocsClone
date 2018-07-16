import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
// import Button from 'semantic-ui-react';
import {Editor, EditorState, RichUtils, convertFromRaw, convertToRaw} from 'draft-js';

export default class DocumentView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      editorState: EditorState.createEmpty(),
      docName: 'Test Doc',
      bold: false,
      italic: false,
      underline: false,
      leftAlign: true,
      centerAlign: false,
      rightAlign: false,
      // Use socket to load the viewers into this state every time one joins or leaves
      viewers: [{initials: 'JL', name: 'Joe Lozano'}]
    }
    this.onChange = (editorState) => this.setState({editorState});
  }
  // On load of the component, fetch the document by its ID
  componentWillMount() {
    console.log(this.props.docId)
    // fetch('server/fetchdoc/' + this.props.docId)
    //   .then((doc) => this.setState({editorState: doc}))
  }
  _onBoldClick(e) {
    e.preventDefault()
    console.log(convertToRaw(this.state.editorState.getCurrentContent()))
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
    fetch('server/savefile' + this.props.docId, {
      method: 'POST',
      body: JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()))
    })
  }
  // Font Color, Font Size, Left/center/right align paragraph, bullet/numbered lists
  render() {
    return (
      <div>
        <Card>
          <CardContent>
            <Typography variant = "headline"> Edit Document </Typography>
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
            </div>
            <div>
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
            <Chip style = {buttonStyle} avatar = {<Avatar> JL </Avatar>} label = 'Joe Lozano'/>
            <Chip style = {buttonStyle} avatar = {<Avatar> IC </Avatar>} label = 'Isabelle Chun'/>
            <Chip style = {buttonStyle} avatar = {<Avatar> YS </Avatar>} label = 'Yuna Shin'/>
            <Button variant = "contained" color = "secondary"
              style = {buttonStyle} onMouseDown = {(e) => this.saveFile(e)}>
              Save
            </Button>
          </CardContent>
        </Card>
        <Card style = {buttonStyle}>
          <CardContent>
            <Typography style = {buttonStyle}> <ion-icon name = "create"/> Editing '{this.state.docName}' </Typography>
            <div>
              {this.state.viewers.map((viewer) => {
                <div>
                  <Chip avatar = {<Avatar> {viewer.initials} </Avatar>} label = {viewer.name}/>
                  <p> Test </p>
                </div>
              })}
            </div>
            <Editor style = {editorStyle} editorState = {this.state.editorState} onChange = {this.onChange}/>
          </CardContent>
        </Card>
      </div>
    )
  }
}

const editorStyle = {
  margin: '20px',
  border: '1px solid black',
  borderRadius: '5px'
}

const buttonStyle = {
  margin: '10px'
}
