import React from 'react'
import * as d3 from 'd3'
import moment from 'moment'

class Chart extends React.Component {
  componentDidMount () {
    var data = this.props.player_stats;
    var start_year = data[0].season;
    var end_year = data[data.length - 1].season;
    console.log('Start Year: ' + start_year + ' end Year ' + end_year);
    var svgDoc = d3
      .select('.renderedD3')
      .append('svg')
      .attr('id', 'year_ppg');

    var WIDTH  = 1000;
    var HEIGHT = 500;
    var MARGINS = {
        top: 20,
        right: 525,
        bottom: 20,
        left: 50
    }
    var xScale = d3.scaleTime().range([MARGINS.left, WIDTH - MARGINS.right]).domain([new Date(start_year), new Date(end_year)]);
    var yScale = d3.scaleLinear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([0,40]);
    var xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));
    var yAxis = d3.axisLeft(yScale);
    var formatYear = d3.timeFormat("%Y");

    svgDoc
      .append('g')
      .attr("class","axis")
      .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
      .call(xAxis);

    svgDoc
      .append('g')
      .attr("class","axis")
      .attr("transform", "translate(" + (MARGINS.left) + ",0)")
      .call(yAxis);

    var lineGen = d3.line()
      .x(function(d) {
        return xScale(new Date(d.season));
      })
      .y(function(d) {
        return yScale(d.pts)
      })
      .curve(d3.curveLinear);
    var tip = d3.select(".renderedD3").append("div")	
      .attr("class", "tooltip")				
      .style("opacity", 0);
    svgDoc
      .append('path')
      .attr('class', 'data_plot')
      .attr('d', lineGen(data))
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('fill', 'none');

    svgDoc
      .selectAll("dot")
      .data(data)
      .enter().append("circle")
      .attr("r", 3.5)
      .attr("cx", function(d) { 
        return xScale(new Date(d.season)); 
      })
      .attr("cy", function(d) { 
        return yScale(d.pts); 
      })
      .on("mouseover", function(d) {		
        tip.transition()		
            .duration(200)		
            .style("opacity", .9);
        const display_year = formatYear(moment(d.season, 'YYYY').add(1, 'days').toDate());  		
        tip.html( `<u>Season</u>: ${display_year}<br/><u>PPG</u>: ${d.pts}`)	
            .style("left", d3.event.pageX + "px")		
            .style("top", d3.event.pageY + "px");	
        })					
    .on("mouseout", function(d) {		
      tip.transition()		
          .duration(500)		
          .style("opacity", 0);	
        });
  }

  render () {
    return (
      <div>
        <h2>Here is the points per game:</h2>
        <div className='renderedD3'>
        </div>
      </div>
    )
  }
}

export default Chart