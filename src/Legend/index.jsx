import React from 'react';
import styled from '@emotion/styled';

import Graded from './Graded';
import Swatched from './Swatched'

const Container = styled.div(props=>({
  alignSelf: props.alignment,
}))

export default ({alignment, horizontal, size, value, palette}) => (
  <Container alignment={{center: 'center', start: 'flex-start', end: 'flex-end'}[alignment] || 'center'}>
    {palette.gradient 
      ? <Graded {...{horizontal, size, value, palette}} /> 
      : <Swatched {...{horizontal, palette}} />
    }
  </Container>
)