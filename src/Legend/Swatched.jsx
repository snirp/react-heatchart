import React from 'react';
import styled from '@emotion/styled'

const Container = styled.div(props => ({
  display: 'flex',
  flexDirection: props.horizontal ? 'row' : 'column-reverse',
}))

const Item = styled.div({
  display: 'flex',
  margin: '5px',
})

const Swatch = styled.div(props=>({
  height: '12px',
  width: '12px',
  margin: '5px',
  backgroundColor: props.color.hsl().string(),
  border: '1px solid black',
}))

const Label = styled.div({
  display: 'flex',
  alignItems: 'center',
})

export default ({horizontal, palette}) => (
  <Container horizontal={horizontal}>
    {palette.getLegend().map(({color,value}, i)=>(
      <Item key={i}>
        <Swatch color={color}/>
        <Label>
          <div>{value}</div>
        </Label>
      </Item>
    ))}
  </Container>
)
