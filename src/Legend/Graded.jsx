import React from 'react';
import styled from '@emotion/styled';

const totalWidth = 60;
const indicatorWidth = 8;
const gradientWidth = 10;
const indicatorColor = '#444'

const valueRatio = (value, values) => ((value-values[0])/(values[values.length-1]-values[0]));

const makeCssGradient = legend => legend.map(stop=>(stop.color+' '+stop.percentage*100+'%')).join(', ')

const Container = styled.div(props=>({
  position: 'relative',
  width: props.horizontal ? props.size : totalWidth,
  height: props.horizontal ? totalWidth : props.size,
}));

const Indicator = styled.div(
  {
    position: 'absolute',
    width: 0,
    height: 0,
    border: `${indicatorWidth}px solid transparent`,
  },
  props => {return props.horizontal ? {
    borderTop: `${indicatorWidth}px solid ${indicatorColor}`,
    top: 0,
    left: `${valueRatio(props.value, props.values)*100}%`,
    marginLeft: -indicatorWidth
  } : {
    borderLeft: `${indicatorWidth}px solid ${indicatorColor}`,
    bottom: `${valueRatio(props.value, props.values)*100}%`,
    left: 0,
    marginBottom: - indicatorWidth
  }}
);

const Gradient = styled.div(
  {
    position: 'absolute',
  },
  props=> {return props.horizontal ? {
    background: `linear-gradient(to right, ${makeCssGradient(props.palette.getLegend())})`,
    width: props.size,
    height: gradientWidth,
    top: indicatorWidth,
    left: 0,
  } : {
    background: `linear-gradient(to top, ${makeCssGradient(props.palette.getLegend())})`,
    width: gradientWidth,
    height: props.size,
    top: 0,
    left: indicatorWidth,
  }}
);

const Label = styled.div(
  {
    position: 'absolute',
    width: 40,
    height: 12,
  },
  props => {return props.horizontal ? {
    marginTop: 0,
    marginLeft: -20,
    textAlign: 'center',
    top: indicatorWidth+gradientWidth+5,
    left: valueRatio(props.value, props.values)*100+'%',
  } : {
    marginTop: -6,
    marginLeft: 0,
    textAlign: 'left',
    bottom: valueRatio(props.value, props.values)*100+'%',
    left: indicatorWidth+gradientWidth+5,
  }}
)

const Notch = styled.div(
  {
    position: 'absolute',
    background: 'white',
    zIndex: 2,
  },
  props => {return props.horizontal ? {
    height: gradientWidth,
    width: 1,
    left: valueRatio(props.value, props.values)*100+'%',
    top: indicatorWidth,
  } : {
    height: 1,
    width: gradientWidth,
    bottom: valueRatio(props.value, props.values)*100+'%',
    left: indicatorWidth,
  }}
)


export default ({horizontal, size, value, palette}) => {
  console.log(horizontal)

  return (
    <Container horizontal={horizontal} size={size}>
      <Gradient horizontal={horizontal} size={size} palette={palette}/>
      { value !== null && (
        <Indicator 
          horizontal={horizontal} 
          value={value} 
          values={palette.values}
        />
      )}
      {palette.values.map((value,i)=>(
        <Label key={i} horizontal={horizontal} value={value} values={palette.values}>{value}</Label>
      ))}
      {palette.values.map((value,i)=>(
        <Notch key={i} horizontal={horizontal} value={value} values={palette.values}/>
      ))}
    </Container>
  )
}