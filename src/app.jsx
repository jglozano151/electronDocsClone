import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import {Editor, EditorState, RichUtils} from 'draft-js';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editorState: EditorState.createEmpty() };
    this.onChange = editorState => this.setState({ editorState });
  }
  _onBoldClick(e) {
    e.preventDefault();
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
    console.log(this.state.editorState);
  }
  render() {
    return (<div>
      <h2>Welcome to React!</h2>
      <button color = "primary" onMouseDown = {(e) => this._onBoldClick(e)}> Bold! </button>
      <Editor editorState = {this.state.editorState} onChange = {this.onChange} />
    </div>);
  }
}
