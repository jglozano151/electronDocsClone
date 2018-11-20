// ROUTES
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

export default class Homepage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  //Log In
  login() {
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.state.email,
        password: this.state.password,
      })
    })
    .then(response => (response.json()))
    .then((res) => {
      if (res.success) { //Navigate to document list
        this.props.changePage('docList',res.userId, null)
      } else {
        alert('Failed to login')
      }
    })
  }

  render() {
    return (
      <div style = {{display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', width: '100%', height: '100%'}}>
        <div>
          <Typography variant = "display2" style = {{marginBottom: '50px'}}> Welcome to Text Editor! <ion-icon name = "list-box"/> </Typography>
          <Card style = {{marginTop: '50px'}}>
            <CardContent>
              <Typography variant = "display1"  style = {{display: 'flex', justifyContent: 'center'}}> Log In </Typography>
              <div style={divStyle}>
                <FormControl style={formStyle}>
                  <Input onChange={(e) => this.setState({email: e.target.value})} placeholder = "Username" />
                </FormControl>
                <FormControl style={formStyle}>
                  <Input type="password" onChange={(e) => this.setState({password: e.target.value})} placeholder = "Password" />
                </FormControl>
              </div>
              <div style={divStyle}>
                <Button style={newStyle} onMouseDown={() => this.login()}  variant = "contained" color = "primary">Login</Button>
                <Button style={newStyle} onMouseDown={() => this.props.changePage('signup', null, null)} variant = "contained">Sign Up</Button>
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

const formStyle = {
  width:'200px',
  margin: '2px'
}

const divStyle = {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  margin:'10px'
}

const newStyle = {
  width: '150px',
  margin:'7px'
}
