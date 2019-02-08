import React from 'react';

import Graded from './Graded';
import Swatched from './Swatched'

export default (props) => {
  if (props.palette.gradient) {
    return <Graded {...props} />
  } else {
    return <Swatched {...props} />
  }
};
