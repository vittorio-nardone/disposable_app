import React from 'react';
import { TextField, Button, FormLabel } from '@material-ui/core';
import ReCAPTCHA from "react-google-recaptcha";

class LoginForm extends React.Component {

    constructor(props) {
      super(props);
      this.state = {address: ''};
      
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
        if (recaptchaValue === '') {
           window.location.reload();
        } else { 
            console.log("Captcha value:", recaptchaValue);
        
          fetch(this.props.apiEndpoint + 'create?address=' 
             + encodeURI(this.state.address + this.props.email_domain)
             + '&captcha=' + recaptchaValue)
          .then(r =>  r.json().then(data => ({status: r.status, body: data})))
          .then(r => {
            console.log(r);
            console.log('Response from API: ' + r.body.message);
            if (r.status === 200) {
              this.props.changeAddress(this.state.address + this.props.email_domain, r.body.sessionid);  
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
            sitekey={this.props.recaptcha_key}
            ref={this.recaptchaRef}
            size="invisible"
        />
 
          <TextField 
              value={this.state.address} 
              onChange={this.handleChange}
              placeholder="(type yours)"
              inputProps={{
                style: { textAlign: "right" }
              }} 
          />
          <FormLabel>{this.props.email_domain}</FormLabel>
          <Button type="submit">Open</Button>
        </form>
      );
    }
  }

  export default LoginForm