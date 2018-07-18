//ROUTES
import React from 'react';

const url="http://5953b3c6.ngrok.io"

const Homepage = require('./comp/homepage').default
const Signup = require('./comp/signup').default
const DocList = require('./comp/docList').default
import DocumentView from './comp/documentview'


export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      page: 'homepage' // start with homepage
    }
  }

  changePage(page,userId,docId) {
    this.setState({
      page: page,
      userId: userId,
      docId: docId
    })
  }

  render() {
    let comp;
    if (this.state.page === 'homepage') { //render homepage
      comp = <Homepage url={url} changePage={this.changePage.bind(this)} />
    } else if (this.state.page === 'signup') { //render signup
      comp = <Signup url={url} changePage={this.changePage.bind(this)}/>
    } else if (this.state.page === 'docList') { //render document list for user
      comp = <DocList url={url} changePage={this.changePage.bind(this)}
                      userId={this.state.userId}
                      />
    } else if (this.state.page === 'documentview') { //render specified document as user
      comp = <DocumentView url={url} changePage={this.changePage.bind(this)}
                          userId={this.state.userId}
                          docId={this.state.docId}
                          />
    }
    return(comp)
  }
}
