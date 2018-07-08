import React, { Component } from 'react';
import logo from './images/BallLogo.png';
import './App.css';
import axios from 'axios'
import Chart from './components/Chart';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {name: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({name: event.target.value});
  }

  lookupPlayer(player_name) {
    console.log('Retrieving player: ' + player_name);
    axios.get(`/scrapePlayer?playername=${player_name}`)
      .then(response => console.log(response))
  }

  handleSubmit(event) {
    this.lookupPlayer(this.state.name)
    event.preventDefault();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">NBA Stat Charts</h1>
        </header>
        <form className="PlayerName" onSubmit={this.handleSubmit}>
          <label>
            Name: 
            <input type="text" name="name" placeholder="Enter a player's name" onChange={this.handleChange}/>
          </label>
          <input type="submit" value="Submit" />
        </form>
        <div style={{width: '100%', height: '100%'}}>
          <Chart />
        </div>
      </div>
    );
  }
}

export default App;
