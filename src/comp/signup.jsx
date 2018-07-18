//ROUTES
import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import AddIcon from '@material-ui/icons/Add';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Fade from '@material-ui/core/Fade';
import Popover from '@material-ui/core/Popover';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import IonIcons from 'ionicons'

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
      <div style = {{display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', width: '100%', height: '100%'}}>
        <div>
          <Card style = {{marginBottom: '20px', display: 'flex', justifyContent: 'center'}}>
            <CardContent>
              <Typography variant="display1">Sign Up</Typography>
              <FormControl style={buttonStyle}>
                <InputLabel htmlFor="name-simple">Name</InputLabel>
                <Input onChange={(e) => this.setState({name: e.target.value})} />
              </FormControl>
              <FormControl style={buttonStyle}>
                <InputLabel htmlFor="name-simple">Email</InputLabel>
                <Input onChange={(e) => this.setState({email: e.target.value})} />
              </FormControl>
              <FormControl style={buttonStyle}>
                <InputLabel htmlFor="name-simple">Password</InputLabel>
                <Input onChange={(e) => this.setState({password: e.target.value})} />
              </FormControl>
              <div style = {{display: 'flex', justifyContent: 'center'}}>
                <Button style={buttonStyle} onMouseDown={() => this.signup()}  variant = "contained">Sign Up</Button>
                <Button style={buttonStyle} onMouseDown={() => this.props.changePage('homepage', null, null)} variant = "contained">Login</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
}

const buttonStyle = {
  margin: '10px'
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
