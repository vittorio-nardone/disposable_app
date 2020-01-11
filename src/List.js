import React from 'react';
import './App.css';
import { AppBar, Grid, Tooltip, IconButton, Typography, Paper, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Toolbar } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import EmailViewer from './Viewer';

class EmailList extends React.Component {
    intervalID;

    constructor(props) {
      super(props);
      this.state = {address: props.address, emails: [], selectedId: '', sessionid: props.sessionid};
      console.log(this.state)
    }

    listIsChanged(items) {
        let new_ids = items.map(a => a.messageId);
        let old_ids = this.state.emails.map(a => a.messageId);
        return JSON.stringify(new_ids) !== JSON.stringify(old_ids);
    } 

    getList(force) {
        fetch(this.props.apiEndpoint + this.state.address + '?sessionid=' + encodeURI(this.props.sessionid))
        .then(response => {
            const statusCode = response.status;
            const data = response.json();
            return Promise.all([statusCode, data]);
          })
        .then(res => {
            console.log(res);
            if (res[0] === 400) {
                this.logout();
            } else {      
                res[1].Items.sort(function(a,b){
                    if (a.timestamp > b.timestamp) { return -1 } else { return 1 }
                });         
                if ((this.listIsChanged(res[1].Items) || force)) {
                    this.setState({ emails: res[1].Items });
                    if ((this.state.selectedId === '') && (res[1].Items.length > 0)) {
                        this.setState({ selectedId: res[1].Items[0].messageId });   
                    }
                }
            }
        })
        .catch(console.log)
    }

    reloadList() {
        this.getList(true)
    }

    checkList() {
        this.getList(false)
    }

    componentDidMount() {
        this.reloadList()
        this.intervalID = setInterval(this.checkList.bind(this), 60000);
    }   

    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    handleClick(event, messageId) {
        this.setState({ selectedId: messageId })
    }

    logout() {
        this.props.changeAddress('','');
    }
  
    capitalize(sentence, lower) {
        let string = String(sentence)
        return (lower ? string.toLowerCase() : string).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    };

    senderName(address) {
        const tokens = String(address).split('<');
        if (tokens[0] !== '') {
            return this.capitalize(tokens[0], false);
        } else {
            return address;
        }
    }

    render() {
        return (
          <Grid container spacing={3}>   
          
          <AppBar position="static">  
            <Toolbar>
                <Typography style={{flex: 1,}}>
                 Disposable address: <b>{this.state.address}</b>
                </Typography>

                <Tooltip title="Refresh list">
                <IconButton  color="inherit" onClick={this.reloadList.bind(this)}>
                    <RefreshIcon />
                </IconButton>
                </Tooltip>

                <Tooltip  title="Logout">
                <IconButton color="inherit" onClick={this.logout.bind(this)}>
                    <ExitToAppIcon />
                </IconButton>
                </Tooltip>
            </Toolbar>
          </AppBar>  
          
            <Grid item xs={6}> 
            
            <Paper elevation={3}>
            <div style={{ overflow: 'auto', height: '100vh' }}> 
            <TableContainer>  
            
            <Table stickyHeader size="small">
            <TableHead>
                <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Date</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
            {this.state.emails.map((email, i) =>  
                (
                <TableRow 
                    hover 
                    selected={email.messageId === this.state.selectedId} 
                    key={email.messageId} 
                    onClick={event => this.handleClick(event, email.messageId)}
                >
                    <TableCell style={email.isNew === 'true' ? {fontWeight:'bold',} : null}>{i+1}</TableCell>
                    <TableCell style={email.isNew === 'true' ? {fontWeight:'bold',} : null}>{this.senderName(email.commonHeaders.from)}</TableCell>
                    <TableCell style={email.isNew === 'true' ? {fontWeight:'bold',} : null}>{email.commonHeaders.subject}</TableCell>
                    <TableCell style={email.isNew === 'true' ? {fontWeight:'bold',} : null}>{email.commonHeaders.date}</TableCell>
                    
                </TableRow>
                ) 
            )}
            {this.state.emails.length === 0 ? 
                    <TableRow>
                        <TableCell colSpan="4">
                            <Typography variant="body1">No mails here</Typography>
                        </TableCell>
                    </TableRow> : null}
            </TableBody>
            </Table>   
              
            </TableContainer> 
            </div>          
            </Paper>
            </Grid>
            <Grid item xs={6}> 
                <EmailViewer address={this.state.address} messageId={this.state.selectedId} sessionid={this.state.sessionid} apiEndpoint={this.props.apiEndpoint}/> 
            </Grid>
          </Grid>
          
          )
    }
  }

  export default EmailList