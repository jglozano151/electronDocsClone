import React from 'react';

// const io = require('socket.io')()
// const socket = io('http://localhost:8080')

const Homepage = require('./comp/homepage').default
const Signup = require('./comp/signup').default
const DocList = require('./comp/docList').default
import DocumentView from './comp/documentview'


export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      socket: '', //socket,
      page: '',
      userId: '',
      docArr:''
    }
  }

  // componentDidMount() {
  //   socket.on('homepage', () => this.setState({page:'homepage'}))
  //   socket.on('signup', () => this.setState({page:'signup'}))
  //   socket.on('docList', (obj) => this.setState({page:'docList', userId:obj.id, docArr:obj.docs}))
  //   socket.on('error', (obj) => alert(obj.msg))
  // }

  render() {
    // this.state.page === homepage ? <Homepage socket={this.state.socket} /> : null
    // this.state.page === signup ? <Signup socket={this.state.socket} /> : null
    // this.state.page === docList ? <DocList socket={this.state.socket} userId={this.state.userId} docArr={this.state.docArr}/> : null
    // this.state.page === documentview ? <DocumentView docId={this.state.docId} socket={this.state.socket} /> : null
    return (
      <DocumentView />
    )
  }

}
