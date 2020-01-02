import React from 'react';
import { Typography, Backdrop, CircularProgress } from '@material-ui/core';
import parse from 'emailjs-mime-parser'
import './App.css';
import { makeStyles } from '@material-ui/core/styles';


class EmailViewer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {address: props.address, messageId: props.messageId, messageData: ''};
      console.log(this.state)
    }

    Decodeuint8arr(uint8array){
        return new TextDecoder("utf-8").decode(uint8array);
    }

    getMailContents(data) {
        let parsed = parse(data);
        console.log(parsed);
        let result = '';
        for (const child of parsed.childNodes) { 
            if (child.contentType.value === 'text/html') {
               result = this.Decodeuint8arr(child.content);
               break;
            }
        } 
        if (result === '') {
            for (const child of parsed.childNodes) { 
                if (child.contentType.value === 'text/plain') {
                   result = this.Decodeuint8arr(child.content);
                   break;
                }
            } 
        }
        return result
    }

    getMail() {
        if ((this.state.address !== '') && (this.state.messageId !== '')) {
            fetch('https://9ljg1w8c6j.execute-api.eu-west-1.amazonaws.com/beta/' + this.state.address + '/' + this.state.messageId )
            .then(res => res.text())
            .then((data) => {
                let content = this.getMailContents(data);
                this.setState({ messageData: content });
            })
            .catch(console.log)
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState(
             {address: nextProps.address, messageId: nextProps.messageId, messageData: ''}
             , () => {
                 this.getMail();
              }
            ); 
    }

    render() {
        if (this.state.messageId === '') {
            return (
                <Typography variant="body1">
                    No mail selected
                </Typography>         
            )  
        } else if (this.state.messageData === '') {
            return (
                <center>
                    <CircularProgress color="primary" />
                </center>
            )  
        } else {
            return (
                <div className="body" dangerouslySetInnerHTML={{__html: this.state.messageData}}></div>   
            )  

        }
    }

  }

  export default EmailViewer
