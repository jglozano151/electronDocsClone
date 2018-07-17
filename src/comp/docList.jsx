// ROUTES
import React from 'react'
import Modal from 'react-modal'

export default class DocList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newModalIsOpen: false,
      collabModalIsOpen: false,
    }
  }

  componentDidMount() {
    fetch(this.props.url+'/getDocList/' + this.props.userId, {
      method: 'GET',
      headers: {
        Content-Type: 'application/json',
      }
    })
    .then((res) => {
      if (res.success) {
        this.setState({
          docList: res.docs
        })
      } else {
        alert('Failed to fetch document list for userID: ' + this.props.userId)
      }
    })
  }

  //Modal for creating new document
  openNewModal() {
   this.setState({newModalIsOpen: true});
  }

  //Create new document as author
  saveNewModal() {
    fetch(this.props.url+'/newDoc', {
      method: 'POST',
      headers: {
        Content-Type: 'application/json',
      },
      body: JSON.stringify({
        userId: this.props.userId,
        title: this.state.newDocTitle,
        password: this.state.newDocPassword
      })
    })
    .then((res) => {
      if (res.success) {
        this.setState({
          newDocTitle:'',
          newDocPassword:'',
          newModalIsOpen: false
        })
        this.props.changePage('documentview', this.props.userId, res.docId)
      } else {
        alert('Failed to create new document')
      }
    })
  }

  //Cancel creating new document
  cancelNewModal() {
    this.setState({
      newDocTitle:'',
      newDocPassword:'',
      newModalIsOpen: false
    })
  }

  //Modal for joining a document as collaborator
  openCollabModel() {
    this.setState({collabModalIsOpen: true})
  }

  //Join a document as collaborator
  joinCollabModal() {
    fetch(this.props.url+'/joinDoc', {
      method: 'POST',
      headers: {
        Content-Type: 'application/json',
      },
      body: JSON.stringify({
        userId: this.props.userId,
        docId: this.state.collabDocID,
        password: this.state.collabDocPassword
      })
    })
    .then((res) => {
      if (res.success) {
        this.setState({
          collabDocID:'',
          collabDocPassword:'',
          collabModalIsOpen: false
        })
        this.props.changePage('documentview', this.props.userId, this.state.collabDocID)
      } else {
        alert('Failed to join document')
      }
    })
  }

  //Cancel joining a document
  cancelCollabModal() {
    this.setState({
      collabDocID:'',
      collabDocPassword:'',
      collabModalIsOpen: false
    })
  }

  //Redirect to view the selected document
  viewDoc(docId) {
    this.props.changePage('documentview', this.props.userId, docId)
  }


  render() {
    return (
      <div>
        <h2>Document List</h2>

        <button onClick={()=>openNewModal()}>New Document</button>
        <Modal
          isOpen={this.state.newModalIsOpen}
          style={customStyles}
        >
          <h2>Create a New Document</h2>
          Title: <input placeholder="Title"
                value={this.state.newDocTitle}
                onChange={(e)=>this.setState({newDocTitle:e.target.value})}/>
          Password: <input type="password"
                          placeholder="Password"
                          value={this.state.newDocPassword}
                          onChange={(e)=>this.setState({newDocPassword:e.target.value})}/>
          <button onClick={()=>this.saveNewModal()}>Create</button>
          <button onClick={()=>this.cancelNewModal()}>Cancel</button>
        </Modal>

        <ul>
          {this.state.docList.map(item => (
            <li onClick={() => this.viewDoc(item.id)}>
              Title: {item.title}
              Author: {item.owner}
              Collaborators: {item.collaborators}
            </li>
          ))}
        </ul>

        <button onClick={()=>openCollabModel()}>Join Document</button>
        <Modal
          isOpen={this.state.collabModalIsOpen}
          style={customStyles}
        >
          <h2>Join a document as collaborator</h2>
          Document ID: <input placeholder="Document ID"
                value={this.state.collabDocID}
                onChange={(e)=>this.setState({collabDocID:e.target.value})}/>
          Password: <input type="password"
                          placeholder="Password"
                          value={this.state.collabDocPassword}
                          onChange={(e)=>this.setState({collabDocPassword:e.target.value})}/>
          <button onClick={()=>this.joinCollabModal()}>Join</button>
          <button onClick={()=>this.cancelCollabModal()}>Cancel</button>
        </Modal>


      </div>
    )
  }
}

// SOCKET
// import React from 'react'
// import Modal from 'react-modal'
//
// export default class DocList extends React.Component {
//   constructor(props) {
//     super(props)
//     this.state = {
//       newModalIsOpen: false,
//       collabModalIsOpen: false,
//     }
//   }
//
//   //Modal for creating new document
//   openNewModal() {
//    this.setState({newModalIsOpen: true});
//   }
//
//   //Create new document as author
//   saveNewModal() {
//     this.setState({
//       newDocTitle:'',
//       newDocPassword:'',
//       newModalIsOpen: false
//     })
//     this.props.socket.emit('newDoc', this.props.userId, this.state.newDocTitle, this.state.newDocPassword)
//   }
//
//   //Cancel creating new document
//   cancelNewModal() {
//     this.setState({
//       newDocTitle:'',
//       newDocPassword:'',
//       newModalIsOpen: false
//     })
//   }
//
//   //Modal for joining a document as collaborator
//   openCollabModel() {
//     this.setState({collabModalIsOpen: true})
//   }
//
//   //Join a document as collaborator
//   joinCollabModal() {
//     this.setState({
//       collabDocID:'',
//       collabDocPassword:'',
//       collabModalIsOpen: false
//     })
//     this.props.socket.emit('collabDoc', this.props.userId, this.state.collabDocID, this.state.collabDocPassword)
//   }
//
//   //Cancel joining a document
//   cancelCollabModal() {
//     this.setState({
//       collabDocID:'',
//       collabDocPassword:'',
//       collabModalIsOpen: false
//     })
//   }
//
//   //Redirect to view the selected document
//   viewDoc(docId) {
//     this.props.socket.emit('goToDocumentView', this.props.userId, docId)
//   }
//
//
//   render() {
//     return (
//       <div>
//         <h2>Document List</h2>
//
//         <button onClick={()=>openNewModal()}>New Document</button>
//         <Modal
//           isOpen={this.state.newModalIsOpen}
//           style={customStyles}
//         >
//           <h2>Create a New Document</h2>
//           Title: <input placeholder="Title"
//                 value={this.state.newDocTitle}
//                 onChange={(e)=>this.setState({newDocTitle:e.target.value})}/>
//           Password: <input type="password"
//                           placeholder="Password"
//                           value={this.state.newDocPassword}
//                           onChange={(e)=>this.setState({newDocPassword:e.target.value})}/>
//           <button onClick={()=>this.saveNewModal()}>Create</button>
//           <button onClick={()=>this.cancelNewModal()}>Cancel</button>
//         </Modal>
//
//         <ul>
//           {this.props.docArr.map(item => (
//             <li onClick={() => this.viewDoc(item.id)}>
//               Title: {item.title}
//               Author: {item.owner}
//               Collaborators: {item.collaborators}
//             </li>
//           ))}
//         </ul>
//
//         <button onClick={()=>openCollabModel()}>Join Document</button>
//         <Modal
//           isOpen={this.state.collabModalIsOpen}
//           style={customStyles}
//         >
//           <h2>Join a document as collaborator</h2>
//           Document ID: <input placeholder="Document ID"
//                 value={this.state.collabDocID}
//                 onChange={(e)=>this.setState({collabDocID:e.target.value})}/>
//           Password: <input type="password"
//                           placeholder="Password"
//                           value={this.state.collabDocPassword}
//                           onChange={(e)=>this.setState({collabDocPassword:e.target.value})}/>
//           <button onClick={()=>this.joinCollabModal()}>Join</button>
//           <button onClick={()=>this.cancelCollabModal()}>Cancel</button>
//         </Modal>
//
//
//       </div>
//     )
//   }
// }
