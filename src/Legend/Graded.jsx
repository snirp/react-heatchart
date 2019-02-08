import React from 'react';
import styled from '@emotion/styled';
import { relative } from 'path';

const totalWidth = 60;
const indicatorWidth = 8;
const gradientWidth = 10;
const indicatorColor = '#444'

const valueRatio = (value, values) => ((value-values[0])/(values[values.length-1]-values[0]));

const Container = styled.div(props=>({
  position: 'relative',
  width: props.horizontal ? props.size : totalWidth,
  height: props.horizontal ? totalWidth : props.size,
}));

const Indicator = styled.div(props=>({
  position: 'absolute',
  width: 0,
  height: 0,
  borderTop: `${indicatorWidth}px solid ${props.horizontal ?  indicatorColor : 'transparent'}`,
  borderRight: `${indicatorWidth}px solid transparent`,
  borderBottom: `${indicatorWidth}px solid transparent`,
  borderLeft: `${indicatorWidth}px solid ${props.horizontal ?  'transparent' : indicatorColor}`,
  top: props.horizontal ? 0 : `calc(${(1-valueRatio(props.value, props.values))*100}% + ${indicatorWidth}px`,
  left: props.horizontal ? `calc(${valueRatio(props.value, props.values)*100}% - ${indicatorWidth}px)` : 0,
}));

const Gradient = styled.div(props=>({
  background: `linear-gradient(${props.horizontal ? 'to right': 'to top'}, ${props.palette.getLegend().map(stop=>(
        stop.color+' '+stop.percentage*100+'%')).join(', ')})`,
  position: 'absolute',
  width: props.horizontal ? props.size : gradientWidth,
  height: props.horizontal ? gradientWidth : props.size,
  top: props.horizontal ? indicatorWidth : 0,
  left: props.horizontal ? 0 : indicatorWidth,
}));

const Label = styled.div(props=>({
  position: 'absolute',
  width: 40,
  left: props.horizontal ? valueRatio(props.value, props.values)*100+'%' : 0,
}))

export default ({alignment, horizontal, size, value, palette}) => {
  console.log(horizontal)

  return (
    <Container horizontal={horizontal} size={size}>
      <Gradient horizontal={horizontal} size={size} palette={palette}/>
      { value && (
        <Indicator 
          horizontal={horizontal} 
          value={value} 
          values={palette.values}
        />
      )}

    </Container>
  )
}