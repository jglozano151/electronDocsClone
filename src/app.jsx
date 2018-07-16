import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import {Editor, EditorState, RichUtils} from 'draft-js';
import DocumentView from './comp/documentview'

export default class App extends React.Component {
  constructor(props) {
    super(props)
  }
  // Sample placeholder code for now
  docId = '597592c3223e6e806478d'
  render() {
    return (<div>
      <h2>Welcome to React!</h2>
      <DocumentView docId = {this.docId}/>
    </div>);
  }
}
