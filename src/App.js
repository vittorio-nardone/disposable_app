import React from 'react';
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
			height: "100%"
		},

	}
});

const APIEndpoint = 'https://3owap4whpb.execute-api.eu-west-1.amazonaws.com/v0/';
const ReCaptcha_SiteKey = "6Lfb-8sUAAAAAElnudfv4yqAg5Yk3oyONVXFy0xK"; 

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
            <EmailList 
              address={this.state.address} 
              changeAddress={this.changeAddress.bind(this)} 
              apiEndpoint={APIEndpoint}/>
      ); 
    } else {
      return (
        <div className="App" styles={{ backgroundImage:"url(${background})",
                                       backgroundSize: "cover",
                                       overflow: "hidden" }}>
          <div className="App-header">
            <Typography variant="h3"> 
                <b>Disposabl</b><i>e-mail</i>
            </Typography>
          </div>
          <div style={
                    { overflow: 'auto', height: '100vh', display:"flex",
                    flexDirection: "column",
                    justifyContent: "center",
                     }}>
            <Paper elevation={3}>
              <LoginForm 
                changeAddress={this.changeAddress.bind(this)} 
                apiEndpoint={APIEndpoint}
                recaptcha_key={ReCaptcha_SiteKey}/>
            </Paper>
          </div>
        </div>
      );
    }
  }
}

export default  withStyles(styles)(App);
