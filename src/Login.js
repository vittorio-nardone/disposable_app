import React from 'react';
import { TextField, Button, FormLabel } from '@material-ui/core';

class LoginForm extends React.Component {
    constructor(props) {
      super(props);
      this.state = {address: '', domain: '@aws.gotocloud.it'};
      
  
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    handleChange(event) {
      this.setState({address: event.target.value});
    }
  
    handleSubmit(event) {
  
        fetch('https://9ljg1w8c6j.execute-api.eu-west-1.amazonaws.com/beta/create?address=' + encodeURI(this.state.address + this.state.domain))
        .then(r =>  r.json().then(data => ({status: r.status, body: data})))
        .then(r => {
            console.log(r);
            console.log('Response from API: ' + r.body.message);
            if (r.status === 200) {
              this.props.changeAddress(this.state.address + this.state.domain);  
            }
        })
        .catch(console.log);
        event.preventDefault();
    }
  
    render() {
      return (
        <form onSubmit={this.handleSubmit}>
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