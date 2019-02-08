import React from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';

import {Palette} from './utilities'
import Legend from './Legend/index';
import HeatMap from './HeatMap';


const directionLookup = {
  top: 'column-reverse',
  bottom: 'column',
  left: 'row-reverse',
  right: 'row',
}

const Box = styled.div(props => ({
  display: 'flex',
  flexDirection: directionLookup[props.position]
}))

export default class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = {activeVal: null};

    const {data, valuesLength, customMin, customMax} = props.data;


    // Length of z-array. Treat valuesLength as a fallback if first data cell is null
    this.zLength = Array.isArray(data[0][0]) ? data[0][0].length : valuesLength;


    // `min` and `max` arrays for 3d array
    if (this.zLength){
      // Use custom min and max arrays or default to null-filled array
      this.min = Array.isArray(customMin) ? customMin : new Array(this.zLength).fill(null);
      this.max = Array.isArray(customMax) ? customMax : new Array(this.zLength).fill(null);

      for(let z=0; z<this.zLength; z++){
        let flatZ = [];
        // include custom min and max values
        if (this.min[z] !== null) flatZ.push(this.min[z]);
        if (this.max[z] !== null) flatZ.push(this.max[z]);
        for(let y=0; y<data.length; y++){
          for(let x=0; x<data[y].length; x++){
            if (data[y][x] !== null) flatZ.push(data[y][x][z]);
          }
        }
        this.min[z] = Math.min(...flatZ);
        this.max[z] = Math.max(...flatZ);
      }

    // `min` and `max` values for 2d array
    } else {
      const flat = data.reduce((acc, cv) => [...acc, ...cv], []).filter(value => value !== null);
      if (!(isNaN(customMin))) flat.push(customMin);
      if (!(isNaN(customMax))) flat.push(customMax);
      this.min = Math.min(...flat);
      this.max = Math.max(...flat);
    }

    // Palette object for shape and legend colors
    const {colors} = this.props
    const paletteMin = this.zLength ? this.min[colors.valuesIndex] : this.min;
    const paletteMax = this.zLength ? this.max[colors.valuesIndex] : this.max;
    this.palette = new Palette(colors.palette, paletteMin, paletteMax, colors.gradient, colors.valuesIndex)
  }

  handleMouseOver = (e,val) => (
    this.setState(state => ({
      activeVal: val
    }))
  );

  handleMouseLeave = e => (
    this.setState(state => ({
      activeVal: null
    }))
  );

  render() {
    return (
      <Box position={this.props.legend.position}>
        <HeatMap
          data={this.props.data.data}
          zLength={this.zLength}
          min={this.min}
          max={this.max}
          namespace={this.props.namespace}
          xAxis={this.props.xAxis}
          yAxis={this.props.yAxis}
          cell={this.props.cell}
          shape={this.props.shape}
          palette={this.palette}
          mouseOver={this.handleMouseOver} 
          mouseLeave={this.handleMouseLeave}
        />
        {this.props.legend.display && (
          <Legend
            horizontal={['top', 'bottom'].includes(this.props.legend.position)}
            alignment={this.props.legend.alignment}
            size={this.props.legend.size}
            value={this.state.activeVal !== null && this.state.activeVal[this.props.colors.valuesIndex]}
            palette={this.palette}
          />
        )}
      </Box>
    );
  }
};

Container.defaultProps = {
  xAxis: {
    display: true,
    opposite: false,
    dangerousLabels: false,
  },
  yAxis: {
    display: true,
    opposite: false,
    dangerousLabels: false,
  },
  legend: {
    size: '500px',
    display: true,
    position: 'top',
    alignment: 'center',
  }
};

Container.propTypes = {
  data: PropTypes.shape({
    data: PropTypes.arrayOf( // A 2D array of numbers, `null` or arrays of numbers (=3D array)
      PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.number, 
          PropTypes.oneOf([null]),
          PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]))
        ])
      )
    ).isRequired,
    valuesLength: PropTypes.number, // In case the first cell has a `null` value, this will give the length of the values array
    customMin: PropTypes.oneOfType([
      PropTypes.number, 
      PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]))
    ]), // Absent these, the `min` and `max` values are derived from the dataset
    customMax: PropTypes.oneOfType([
      PropTypes.number, 
      PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]))
    ]), // Absent these, the `min` and `max` values are derived from the dataset
  }),
  namespace: PropTypes.string, // String to prepend to class-names 
  xAxis: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string), // Array of labels
    display: PropTypes.bool, // Display the labels
    labelHeight: PropTypes.string, // Length value for flexBasis
    columnWidth: PropTypes.string, // Length value for flexBasis
    labelRotation: PropTypes.number, // Clockwise rotation in degrees
    opposite: PropTypes.bool, // Display on opposite side
    customStyle: PropTypes.object, // Custom styles to merge (takes precedence over other styles)
    dangerousLabels: PropTypes.bool, // Allow HTML content in labels
  }),
  yAxis: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string), // Array of labels
    display: PropTypes.bool, // Display the labels
    labelWidth: PropTypes.string, // Length value for flexBasis
    rowHeight: PropTypes.string, // Length value for flexBasis
    labelRotation: PropTypes.number, // Clockwise rotation in degrees
    opposite: PropTypes.bool, // Display on opposite side
    customStyle: PropTypes.object, // Custom styles to merge (takes precedence over other styles)
    dangerousLabels: PropTypes.bool, // Allow HTML content in labels
  }),
  cell: PropTypes.shape({
    content: PropTypes.func, // Take value (or array of values) and render cell content
    customStyle: PropTypes.object, // Custom styles to merge with cell style
    onMouseOver: PropTypes.func, // MouseOver handler for cell, takes `event` and `val` (number or array when 3D)
    onMouseLeave: PropTypes.func, // MouseLeave handler for cell, takes `event` and `val` (number or array when 3D)
    onClick: PropTypes.func, // Click handler for cell, takes `event` and `val` (number or array when 3D)
    lightText: PropTypes.string, // Color when shape background is dark, defaults to 'white'
    darkText: PropTypes.string, // Color when shape background is light, no default ('')
  }),
  shape: PropTypes.shape({
    scaling: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]), // Use value to scale shape: true for 2D array or index number for 3D array
    customStyle: PropTypes.func, // Take `val`, `min`, `max` (=number or array when 3D) and generate shape styles to merge.
    tooltipDataAttrs: PropTypes.oneOfType([PropTypes.object, PropTypes.func]), // data attributes to add to shape for setting 3rd party tooltips, e.g. { 'data-toggle': 'tooltip' } for bootstrap tooltips
  }),
  colors: PropTypes.shape({ // Palette with color stops instead of single color
    valuesIndex: PropTypes.number, // Index number of dataset to use. Can be omitted for 2D array
    gradient: PropTypes.bool, // Display intermediate color values or round to closest stop
    palette: PropTypes.arrayOf( PropTypes.shape({
      stop: PropTypes.number, // Color stop value
      color: PropTypes.string, // Color associated with stop
    }))
  }),
  legend: PropTypes.shape({
    size: PropTypes.string, // CSS length of height (when positoned left or right) or width of legend
    display: PropTypes.bool,
    position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
    alignment: PropTypes.oneOf(['start', 'end', 'center']),
  })
};