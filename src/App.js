import React from 'react';
import logo from './logo.svg';
import './App.css';
import LoginForm from './Login'
import EmailList from './List'

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
         <div className="App-header">
          {/* <header className="App-header"> */}
            <EmailList address={this.state.address}/>
          {/* </header> */}
        </div>
      ); 
    } else {
      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
          </header>
          <LoginForm changeAddress={this.changeAddress.bind(this)}/>
        </div>
      );
    }
  }
}

export default App;
