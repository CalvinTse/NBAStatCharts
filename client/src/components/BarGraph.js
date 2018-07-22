import React, {Component} from 'react';
import {HorizontalBar} from 'react-chartjs-2';

const STAT_TYPE_BAR_GRAPH = {
  FIELD_GOALS: 1,
  THREE:2,
  FREE_THROWS:3
};

class BarGraph extends Component{
  constructor() {
    super();
  }

  set_chart_options() {
    const stat_type = this.props.stat_type;
    var title;
    switch(stat_type) {
      case STAT_TYPE_BAR_GRAPH.FIELD_GOALS:
        title = 'Field Goal Percentage';
        break;
      case STAT_TYPE_BAR_GRAPH.THREE:
        title = 'Three Point Percentage';
        break;     
      case STAT_TYPE_BAR_GRAPH.FREE_THROWS:
        title = 'Free Throw Percentage';
        break;
    }
    return {
      title: {
        display: true,
        text: title
      },
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Percentage (%)'
          }
        }],
        yAxes: [{
          barPercentage: 0.7,
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
    const stat_type = this.props.stat_type;
    var stat_data;

    switch(stat_type) {
      case STAT_TYPE_BAR_GRAPH.FIELD_GOALS:
        stat_data = player_profile.stats.map((stat) => {
          var player_avg = stat.field_goals.field_goals_percent;
          var league_avg = stat.field_goals.league_average;
          if (!player_avg || player_avg.length === 0) player_avg = '0';
          if (!league_avg || league_avg.length === 0) league_avg = '0';
          return {
            player_stats: Number((parseFloat(player_avg) * 100).toFixed(1)),
            league_average:  Number((parseFloat(league_avg) * 100).toFixed(1))
          }
        });
        break;
      case STAT_TYPE_BAR_GRAPH.THREE:
        stat_data = player_profile.stats.map((stat) => {
          var player_avg = stat.free_throw.free_throw_percent;
          var league_avg = stat.free_throw.league_average;
          if (!player_avg || player_avg.length === 0) player_avg = '0';
          if (!league_avg || league_avg.length === 0) league_avg = '0';
          return {
            player_stats: Number((parseFloat(player_avg) * 100).toFixed(1)),
            league_average:  Number((parseFloat(league_avg) * 100).toFixed(1))
          }
        });
        break;     
      case STAT_TYPE_BAR_GRAPH.FREE_THROWS:
        stat_data = player_profile.stats.map((stat) => {
          var player_avg = stat.three_point.three_point_percent;
          var league_avg = stat.three_point.league_average;
          if (!player_avg || player_avg.length === 0) player_avg = '0';
          if (!league_avg || league_avg.length === 0) league_avg = '0';
          return {
            player_stats: Number((parseFloat(player_avg) * 100).toFixed(1)),
            league_average:  Number((parseFloat(league_avg) * 100).toFixed(1))
          }
        });
        break;
    }

    return {
      labels: season,
      datasets: [
        {
          label: 'Player Average %',
          backgroundColor: '#ffff00',
          borderColor: '#000000',
          borderWidth: 1,
          data: stat_data.map((stat) => stat.player_stats)
        },
        {
          label: 'League Average %',
          backgroundColor: '#00ff00',
          borderColor: '#000000',
          borderWidth: 1,
          data: stat_data.map((stat) => stat.league_average)
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