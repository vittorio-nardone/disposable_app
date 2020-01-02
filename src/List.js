import React from 'react';
import './App.css';
import { Tooltip, IconButton, Typography, Paper, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Toolbar } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import EmailViewer from './Viewer';

class EmailList extends React.Component {
    intervalID;

    constructor(props) {
      super(props);
      this.state = {address: props.address, emails: [], selectedId: ''};
      console.log(this.state)
    }

    listIsChanged(items) {
        let new_ids = items.map(a => a.messageId);
        let old_ids = this.state.emails.map(a => a.messageId);
        return JSON.stringify(new_ids) !== JSON.stringify(old_ids);
    } 

    getList(force) {
        fetch('https://9ljg1w8c6j.execute-api.eu-west-1.amazonaws.com/beta/' + this.state.address)
        .then(res => res.json())
        .then((data) => {
            data.Items.sort(function(a,b){
                if (a.timestamp > b.timestamp) { return -1 } else { return 1 }
            })         
            if ((this.listIsChanged(data.Items) || force)) {
                    this.setState({ emails: data.Items })
                console.log(data.Items)
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
        this.intervalID = setInterval(this.checkList.bind(this), 5000);
    }   

    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    handleClick(event, messageId) {
        this.setState({ selectedId: messageId })
    }
  
    render() {
        return (
          <Paper>  
            <Paper>
            <Toolbar className="List-header">
                <Typography variant="body1">
                <b>Disposable address:</b> {this.state.address}
                </Typography>

                <Tooltip title="Refresh list">
                <IconButton color="primary" aria-label="refresh email list" onClick={this.reloadList.bind(this)}>
                    <RefreshIcon />
                </IconButton>
                </Tooltip>
            </Toolbar>
            
            <TableContainer>   
            <Table stickyHeader>
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
                    <TableCell style={email.isNew === 'true' ? {fontWeight:'bold',} : null}>{email.commonHeaders.from}</TableCell>
                    <TableCell style={email.isNew === 'true' ? {fontWeight:'bold',} : null}>{email.commonHeaders.subject}</TableCell>
                    <TableCell style={email.isNew === 'true' ? {fontWeight:'bold',} : null}>{email.commonHeaders.date}</TableCell>
                    
                </TableRow>
                ) 
            )}
            </TableBody>
            </Table>     
            </TableContainer>
            </Paper>
            <Paper>
            <EmailViewer address={this.state.address} messageId={this.state.selectedId} />
            </Paper>
          </Paper>
          )
    }
  }

  export default EmailList