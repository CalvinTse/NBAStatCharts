import React from 'react'
import * as d3 from 'd3'
import {withFauxDOM} from 'react-faux-dom'

class Chart extends React.Component {
  componentDidMount () {
    //var data = [1, [34, 32], [34, 32],[34, 32],[34, 32], [3, 5]];
    var data = [1,2,3,4,5,6,7,8,9,10];
    // This will create a faux div and store its virtual DOM in state.chart
    var faux = this.props.connectFauxDOM('div', 'chart')

    /*
       D3 code below by Alan Smith, http://bl.ocks.org/alansmithy/e984477a741bc56db5a5
       The only changes made for this example are...
       1) feeding D3 the faux node created above
       2) calling this.animateFauxDOM(duration) after each animation kickoff
       3) move data generation and button code to parent component
       4) data and title provided as props by parent component
       5) reattach to faux dom for updates
       6) move rejoining of data and chart updates to updateD3()
       7) code update for D3 version 4
    */

    var xBuffer = 50
    var yBuffer = 150
    var lineLength = 400

    var svgDoc = d3.select(faux).append('svg')

    svgDoc
      .append('text')
      .attr('x', xBuffer + lineLength / 2)
      .attr('y', 50)
      .text(this.props.title)

    // create axis line
    svgDoc
      .append('line')
      .attr('x1', xBuffer)
      .attr('y1', yBuffer)
      .attr('x1', xBuffer + lineLength)
      .attr('y2', yBuffer)

    // create basic circles
    svgDoc
      .append('g')
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', function (d, i) {
        var spacing = lineLength / data.length
        return xBuffer + i * spacing
      })
      .attr('cy', yBuffer)
      .attr('r', function (d, i) {
        return d
      })
  }

  render () {
    return (
      <div>
        <h2>Here is some fancy data:</h2>
        <div className='renderedD3'>
          {this.props.chart}
        </div>
      </div>
    )
  }
}

Chart.defaultProps = {
  chart: 'loading...'
}

export default withFauxDOM(Chart)