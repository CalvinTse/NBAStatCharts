import React, {Component} from 'react';
import {Line} from 'react-chartjs-2';

class LineChart extends Component{
  constructor() {
    super();
  }

  set_chart_options() {
    return {
      title: {
        display: true,
        text: 'Custom Chart Title'
      },
      maintainAspectRatio: true,
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Season'
          }
        }]
      }
    }
  }

  parse_object(player_profile) {
    const season = player_profile.stats.map((stat) => stat.season);
    const pts = player_profile.stats.map((stat) => stat.pts);
    const ast = player_profile.stats.map((stat) => stat.ast);
    const trb = player_profile.stats.map((stat) => stat.rebounds.trb);
    return {
      labels: season,
      datasets: [
        {
        label: `Points Per Games`,
        lineTension: 0,
        fill: false,
        borderColor: '#000000',
        backgroundColor: '#cc0000',
        data: pts,
        },
        {
          label: `Assists Per Games`,
          lineTension: 0,
          fill: false,
          borderColor: '#000000',
          backgroundColor: '#00ccff',
          data: ast,
        },
        {
          label: `Rebounds Per Games`,
          lineTension: 0,
          fill: false,
          borderColor: '#000000',
          backgroundColor: '#00cc00',
          data: trb,
        },
      ]
    };
  }

  render() {
    var data = this.props.player_stats;
    const dataset = this.parse_object(data);
    const options = this.set_chart_options();
    return (
      <div className="lineChart">
        {<Line data={dataset} options={options}/>}
      </div>
    )
  }
}

export default LineChart;