import React from 'react'

export default class Signup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  signup() {
    this.props.socket.emit('signup', this.state.email, this.state.password, this.state.name)
  }

  render() {
    return (
      <div>
        <h2>Sign Up</h2>
        <input placeholder="Name" value={this.state.name} onChange={(e) => this.setState(e.target.value)} />
        <input placeholder="Email" value={this.state.email} onChange={(e) => this.setState(e.target.value)} />
        <input type="password" placeholder="Password" value={this.state.password} onChange={(e) => this.setState(e.target.value)}/>
        <button onClick={() => this.signup()}>Sign Up</button>
        <button onClick={() => this.props.socket.emit('goToLogin')}>Login</button>
      </div>
    )
  }
}
