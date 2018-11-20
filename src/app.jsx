//ROUTES
import React from 'react';
import { Link, Element , Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'

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

  componentDidMount() {
    Events.scrollEvent.register('begin', function(to, element) {
      console.log("begin", arguments);
    });

    Events.scrollEvent.register('end', function(to, element) {
      console.log("end", arguments);
    });

    scrollSpy.update()
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
    return(
      <Element name="test7" className="element" id="containerElement" style={{
            position: 'relative',
            height: '100vh',
            overflow: 'scroll',
            marginBottom: '100px'
          }}>
          {comp}
      </Element>
    )
  }
}
