import React from 'react';

const io = require('socket.io-client')
const socket = io('https://young-escarpment-43146.herokuapp.com/')

const Homepage = require('./comp/homepage').default
const Signup = require('./comp/signup').default
const DocList = require('./comp/docList').default
// const DocumentView = require('./comp/documentview').default


export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      socket: socket,
      page: 'homepage',
      userId: '',
      docArr:'',
      docId:''
    }
  }

  componentDidMount() {
    socket.on('homepage', () => this.setState({page:'homepage'}))
    socket.on('signup', () => this.setState({page:'signup'}))
    socket.on('docList', (obj) => this.setState({page:'docList', userId:obj.id, docArr:obj.docs}))
    socket.on('documentview', (obj) => this.setState({
                                          page:'documentview',
                                          userId:obj.userId,
                                          docId:obj.docId,
                                          docOwner:obj.owner,
                                          docTitle:obj.title,
                                          docCollab:obj.collaborators,
                                          docText:obj.text}))
    socket.on('error', (obj) => alert(obj.msg))
  }

  render() {
    let comp;
    if (this.state.page === 'homepage') {
      comp = <Homepage socket={this.state.socket} />
    } else if (this.state.page === 'signup') {
      comp = <Signup socket={this.state.socket} />
    } else if (this.state.page === 'docList') {
      comp = <DocList socket={this.state.socket} userId={this.state.userId}
                      docArr={this.state.docArr}/>
    } else if (this.state.page === 'documentview') {
      comp = <DocumentView socket={this.state.socket}
                    userId={this.state.userId}
                    docId={this.state.docId}
                    docOwner={this.state.docOwner}
                    docTitle={this.state.docTitle}
                    docCollab={this.state.docCollab}
                    docText={this.state.docText}
                    />
    }
    return(comp)
  }

}
