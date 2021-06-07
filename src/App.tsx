import React from 'react';
import './App.css';
import {
  AppBar, Container, Toolbar, Typography,
} from '@material-ui/core';
import Chart from './components/Chart/Chart';

const App = () => (
  <div className="App">
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">
          Admire Chart
        </Typography>
      </Toolbar>
    </AppBar>
    <Container fixed>
      <Chart />
    </Container>
  </div>
);

export default App;
