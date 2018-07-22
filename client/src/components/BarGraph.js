import React, {Component} from 'react';
import {HorizontalBar} from 'react-chartjs-2';

class BarGraph extends Component{
  constructor() {
    super();
  }

  set_chart_options() {
    return {
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Percentage (%)'
          }
        }],
        yAxes: [{
          barPercentage:0.4,
          scaleLabel: {
            display: true,
            labelString: 'Season'
          }
        }],
      }
    }
  }

  parse_object(player_profile) {
    const season = player_profile.stats.map((stat) => stat.season);
    const fg_percent = player_profile.stats.map((stat) => {
      var avg = stat.field_goals.field_goals_percent;
      if (!avg || avg.length === 0) avg = '0';
      return Number((parseFloat(avg) * 100).toFixed(1));
    });
    const ft_percent = player_profile.stats.map((stat) => {
      var avg = stat.free_throw.free_throw_percent;
      if (!avg || avg.length === 0) avg = '0';
      return Number((parseFloat(avg) * 100).toFixed(1));
    });
    const three_percent = player_profile.stats.map((stat) => {
      var avg = stat.three_point.three_point_percent;
      if (!avg || avg.length === 0) avg = '0';
      return Number((parseFloat(avg) * 100).toFixed(1));
    });
    return {
      labels: season,
      datasets: [
        {
          label: 'Field Goal %',
          backgroundColor: '#ffff00',
          borderColor: '#000000',
          borderWidth: 1,
          data: fg_percent
        },
        {
          label: 'Free Throw %',
          backgroundColor: '#00ff00',
          borderColor: '#000000',
          borderWidth: 1,
          data: ft_percent
        },
        {
          label: 'Three Point %',
          backgroundColor: '#ff3300',
          borderColor: '#000000',
          borderWidth: 1,
          data: three_percent
        }
      ]
    };
  }

  render() {
    var data = this.props.player_stats;
    const dataset = this.parse_object(data);
    const options = this.set_chart_options();
    return (
      <div className="barGraph">
        {<HorizontalBar  data={dataset} options={options}/>}
      </div>
    )
  }
}

export default BarGraph;