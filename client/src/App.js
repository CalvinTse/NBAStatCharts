import React, { Component } from 'react';
import logo from './images/BallLogo.png';
import loading from './images/loading.gif';
import './App.css';
import axios from 'axios'
import Chart from './components/Chart';
import LineChart from './components/LineChart';
import BarGraph from './components/BarGraph';

const DATA_STATUS = {
  NONE: 1,
  LOADING:2,
  AVALIABLE:3
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      show_charts: DATA_STATUS.NONE,
      player_stats:''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({name: event.target.value});
  }

  async lookupPlayer(player_name) {
    console.log('Retrieving player: ' + player_name);
    this.setState({show_charts: DATA_STATUS.LOADING});
    await axios.get(`/scrapePlayer?playername=${player_name}`)
      .then(response => {
        const stat_data = response.data;
        if(stat_data.stats.length > 0) {
          this.setState({show_charts: DATA_STATUS.AVALIABLE, player_stats: stat_data});
        } else {
          this.setState({show_charts: DATA_STATUS.NONE});
        }  
      })
  }

  handleSubmit(event) {
    this.lookupPlayer(this.state.name);
    event.preventDefault();
  }

  render() {
    var data_to_display;
    var bargraph;
    var player_name;
    var player_pic;
    
    switch (this.state.show_charts) {
      case DATA_STATUS.NONE:
        data_to_display = <h3>Player Stats could not be found</h3>;
        break;
      case DATA_STATUS.LOADING:
        data_to_display = <img src={loading} className="loading" alt="loading"/>;
        break;
      case DATA_STATUS.AVALIABLE: 
        player_pic = <img src={this.state.player_stats.img_url} className="player_pic" alt={this.state.player_stats.name}/>;
        player_name = <h2>Displaying stats for {this.state.player_stats.name}</h2>;
        data_to_display = <LineChart player_stats={this.state.player_stats}/>;
        bargraph = <BarGraph player_stats={this.state.player_stats}/>;
        break;
      default:
        data_to_display = <h3>Player Stats could not be found</h3>;
        break; 
    }

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
        <div id = 'player_name'>
         {player_name}
        </div>
        <div id = 'player_pic'>
         {player_pic}
        </div>
        <div className = 'stats_chart'>
          {data_to_display}
          {bargraph}
        </div>
      </div>
    );
  }
}

export default App;
