// ROUTES
import React from 'react'

export default class Homepage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  //Log In
  login() {
    fetch(this.props.url+'/login', {
      method: 'POST',
      headers: {
        Content-Type: 'application/json',
      },
      body: JSON.stringify({
        username: this.state.email,
        password: this.state.password,
      })
    })
    .then((res) => {
      if (res.success) {
        this.props.changePage('docList',res.userId, null)
      } else {
        alert('Failed to login')
      }
    })
  }

  render() {
    return (
      <div>
        <h1>Welcome to Text Editor!</h1>
        <h2>Login</h2>
        <input placeholder="Email"
              value={this.state.email}
              onChange={(e) => this.setState({email: e.target.value})} />
        <input type="password"
              placeholder="Password"
              value={this.state.password}
              onChange={(e) => this.setState({password:e.target.value})}/>
        <button onClick={() => this.login()}>Login</button>
        <button onClick={() => }>Sign Up</button>
      </div>
    )
  }
}


//SOCKET
// import React from 'react'
//
// export default class Homepage extends React.Component {
//   constructor(props) {
//     super(props)
//     this.state = {}
//   }
//
//   login() {
//     this.props.socket.emit('login', this.state.email, this.state.password)
//   }
//
//   render() {
//     return (
//       <div>
//         <h1>Welcome to Text Editor!</h1>
//         <h2>Login</h2>
//         <input placeholder="Email" value={this.state.email} onChange={(e) => this.setState(e.target.value)} />
//         <input type="password" placeholder="Password" value={this.state.password} onChange={(e) => this.setState(e.target.value)}/>
//         <button onClick={() => this.login()}>Login</button>
//         <button onClick={() => this.props.socket.emit('goToSignup')}>Sign Up</button>
//       </div>
//     )
//   }
// }
