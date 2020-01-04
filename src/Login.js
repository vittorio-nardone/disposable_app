import React from 'react';
import { TextField, Button, FormLabel } from '@material-ui/core';
import ReCAPTCHA from "react-google-recaptcha";

class LoginForm extends React.Component {

    constructor(props) {
      super(props);
      this.state = {address: '', domain: '@aws.gotocloud.it'};
      
  
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);

      this.recaptchaRef = React.createRef();
    }
  
    componentDidMount() {
      this.recaptchaRef.current.execute();
    }

    handleChange(event) {
      this.setState({address: event.target.value});
    }
  
    handleSubmit(event) {
        const recaptchaValue = this.recaptchaRef.current.getValue();
        if (recaptchaValue === null) {
           window.location.reload();
        } else { 
            console.log("Captcha value:", recaptchaValue);
        
          fetch('https://9ljg1w8c6j.execute-api.eu-west-1.amazonaws.com/beta/create?address=' 
             + encodeURI(this.state.address + this.state.domain)
             + '&captcha=' + recaptchaValue)
          .then(r =>  r.json().then(data => ({status: r.status, body: data})))
          .then(r => {
            console.log(r);
            console.log('Response from API: ' + r.body.message);
            if (r.status === 200) {
              this.props.changeAddress(this.state.address + this.state.domain);  
            }
        })
        .catch(console.log);
        }
        event.preventDefault();
    }
  
    render() {
      return (
        <form onSubmit={this.handleSubmit}>
        <ReCAPTCHA
            sitekey="6Lfb-8sUAAAAAElnudfv4yqAg5Yk3oyONVXFy0xK"
            ref={this.recaptchaRef}
            size="invisible"
        />
 
          <TextField 
              value={this.state.address} 
              onChange={this.handleChange}
              inputProps={{
                style: { textAlign: "right" }
              }} 
          />
          <FormLabel>{this.state.domain}</FormLabel>
          <Button type="submit">Open</Button>
        </form>
      );
    }
  }

  export default LoginForm