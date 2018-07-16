import React from 'react'

export default class DocList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  //Create new document as author
  newDoc() {
    this.props.socket.emit('newDoc', this.props.userId)
  }

  render() {
    return (
      <div>
        LOGIN SUCCESS
        UserID: {this.props.userId}

        <button onClick={()=>this.newDoc()}>Create New Document</button>
      </div>
    )
  }
}
