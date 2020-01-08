import React from 'react';
import { Typography, CircularProgress, Card, CardContent, Paper } from '@material-ui/core';
import parse from 'emailjs-mime-parser'
import './App.css';

class EmailViewer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {address: props.address, 
                    messageId: props.messageId,
                    messageData: '',
                    messageSubject: '',
                    messageFrom: '',
                    messageTo: '',
                    messageFromAddress: '',
                    messageToAddress: ''
                };
      console.log(this.state)
    }

    Decodeuint8arr(uint8array){
        return new TextDecoder("utf-8").decode(uint8array);
    }

    getMailContents(parsed) {
        let result = '';

        for (const child of parsed.childNodes) { 
            if (child.contentType.value === 'multipart/alternative') {
                if (child.childNodes.length > 0) {
                    result = this.getMailContents(child);
                    if (result !== '') {
                        break;    
                    }   
                }
            }
        }
        
        if (result === '') {
            for (const child of parsed.childNodes) { 
                if (child.contentType.value === 'text/html') {
                   result = this.Decodeuint8arr(child.content);
                   break;
                }
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

        if (result === '') {
            if (parsed.childNodes.length === 0) {
                if (parsed.contentType.value === 'text/html') {
                    result = this.Decodeuint8arr(parsed.content); 
                }    
            }
        }

        return result
    }

    getMail() {
        if ((this.state.address !== '') && (this.state.messageId !== '')) {
            fetch(this.props.apiEndpoint + this.state.address + '/' + this.state.messageId )
            .then(res => res.text())
            .then((data) => {
                let parsed = parse(data);
                console.log(parsed);
                let content = this.getMailContents(parsed);
                this.setState({ messageData: content, 
                                messageSubject: parsed.headers.subject[0].value,
                                messageFrom: parsed.headers.from[0].value[0].name,
                                messageFromAddress: parsed.headers.from[0].value[0].address,
                                messageTo: parsed.headers.to[0].value[0].name,
                                messageToAddress: parsed.headers.to[0].value[0].address,
                             });
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

    capitalize(sentence, lower) {
        let string = String(sentence)
        return (lower ? string.toLowerCase() : string).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    };

    formatAddress(name, address, label, bold) {
        let capitalized = this.capitalize(name, false);
        if (name === '') {
            return (<div><i>{label}</i>{bold ? <b>{address}</b> : address}</div>);
        } else {
            return (<div><i>{label}</i>{bold ? <b>{capitalized}</b> : capitalized} ({address})</div>);
        }
    }

    render() {
        if (this.state.messageId === '') {
            return (
                <div style={
                    { overflow: 'auto', height: '100vh', display:"flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    textAlign:"center",
                    backgroundColor: "white" }}>
                <Typography variant="body1" >
                    No mail selected
                </Typography> 
                </div>        
            )  
        } else if (this.state.messageData === '') {
            return (
                <div style={
                    { overflow: 'auto', height: '100vh', display:"flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    backgroundColor: "white" }}>
                <center>
                    <CircularProgress color="primary" />
                </center>
                </div> 
            )  
        } else {
            return (
                <div style={{ overflow: 'auto', height: '100vh', }}>
                    
                    <Card>
                        <CardContent>
                        <Typography variant="h6">
                            {this.state.messageSubject}
                        </Typography>
                        <Typography variant="body1">
                            {this.formatAddress(this.state.messageFrom,this.state.messageFromAddress, '', true)}
                        </Typography>
                        <Typography variant="body1">
                            {this.formatAddress(this.state.messageTo,this.state.messageToAddress, 'to ', false)}
                        </Typography>
                        </CardContent>
                    </Card>
                   

                    <Paper elevation={3}>
                        <div className="body" dangerouslySetInnerHTML={{__html: this.state.messageData}}></div> 
                    </Paper>
                </div>  
            )  

        }
    }

  }

  export default EmailViewer;