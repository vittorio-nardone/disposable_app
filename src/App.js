import React from 'react';
// import logo from './emaillogo.png';
import background from './images/background.jpg'
import './App.css';
import LoginForm from './Login'
import EmailList from './List'
import { Paper, Typography } from '@material-ui/core';



import { withStyles } from "@material-ui/core/styles";
const styles = theme => ({
	"@global": {
		body: {
			backgroundImage: "url('/images/background.jpg')",
			backgroundRepeat: "no-repeat",
			backgroundPosition: "center center",
			backgroundSize: "cover",
			backgroundAttachment: "fixed",
			height: "50%"
		},

	}
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {address: ''};

  }

  changeAddress(address) {
    this.setState({address: address});
  }

  render() {
    if (this.state.address !== '') {
      return (
            <EmailList address={this.state.address} changeAddress={this.changeAddress.bind(this)}/>
      ); 
    } else {
      return (
        <div className="App" styles={{ backgroundImage:"url(${background})",
                                       backgroundSize: "cover",
                                       overflow: "hidden" }}>
          <div className="App-header">
          <Typography variant="h3"> 
                <b>Disposabl:</b><i>email</i>
              </Typography>
          </div>
          <div style={
                    { overflow: 'auto', height: '100vh', display:"flex",
                    flexDirection: "column",
                    justifyContent: "center",
                     }}>
             <Paper elevation={3}>
              
              <LoginForm changeAddress={this.changeAddress.bind(this)}/>
             </Paper>
          </div>
        </div>
      );
    }
  }
}

export default  withStyles(styles)(App);
