//ROUTES
import React from 'react'

export default class Signup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  //Sign up
  signup() {
    fetch(this.props.url+'/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: this.state.name,
        email: this.state.email,
        password: this.state.password,
      })
    })
    .then(response => (response.json()))
    .then((res) => {
      if (res.success) { // navigate to homepage after successful registration
        alert('Sign up successful')
        this.props.changePage('homepage', null, null)
      } else {
        alert('Failed to sign up')
      }
    })
  }

  render() {
    return (
      <div>
        <h2>Sign Up</h2>
        <input placeholder="Name"
              value={this.state.name}
              onChange={(e) => this.setState({name:e.target.value})} />
        <input placeholder="Email"
              value={this.state.email}
              onChange={(e) => this.setState({email:e.target.value})} />
        <input type="password"
              placeholder="Password"
              value={this.state.password}
              onChange={(e) => this.setState({password:e.target.value})}/>
        <button onClick={() => this.signup()}>Sign Up</button>
        <button onClick={() => this.props.changePage('homepage', null, null)}>Login</button>
      </div>
    )
  }
}

// SOCKET
// import React from 'react'
//
// export default class Signup extends React.Component {
//   constructor(props) {
//     super(props)
//     this.state = {}
//   }
//
//   signup() {
//     this.props.socket.emit('signup', this.state.email, this.state.password, this.state.name)
//   }
//
//   render() {
//     return (
//       <div>
//         <h2>Sign Up</h2>
//         <input placeholder="Name" value={this.state.name} onChange={(e) => this.setState(e.target.value)} />
//         <input placeholder="Email" value={this.state.email} onChange={(e) => this.setState(e.target.value)} />
//         <input type="password" placeholder="Password" value={this.state.password} onChange={(e) => this.setState(e.target.value)}/>
//         <button onClick={() => this.signup()}>Sign Up</button>
//         <button onClick={() => this.props.socket.emit('goToLogin')}>Login</button>
//       </div>
//     )
//   }
// }
