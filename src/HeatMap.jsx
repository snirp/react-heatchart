import React from 'react';
import styled from '@emotion/styled';

import {Palette} from './utilities'

const scalingStyle = (scaling, val, min, max) => {
  if (scaling === false || scaling === undefined) {
    return {
      height: '100%',
      width: '100%'
    };
  } else if (scaling === true) {
    return {
      height: 100 * Math.sqrt((val - min) / (max - min)) + '%',
      width: 100 * Math.sqrt((val - min) / (max - min)) + '%',
    };
  } else {
    return {
      height: 100 * Math.sqrt((val[scaling] - min[scaling]) / (max[scaling] - min[scaling])) + '%',
      width: 100 * Math.sqrt((val[scaling] - min[scaling]) / (max[scaling] - min[scaling])) + '%',
    };
  }
};

const backgroundStyle = color => ({backgroundColor: color.rgb().string()})

const Container = styled.div(
  {
    display: 'flex',
    alignItems: 'center',
  }
);

const Grid = styled.div({
  display: 'flex'
});

const Legend = styled.div({
  display: 'flex',
})

// const Gradient = styled.div( props => ({
//   height: '80%',
//   width: '10px',
//   background: `linear-gradient(${props.palette.colors.map((color, i)=>(
//     color+' '+props.palette.percentages[i]*100+'%')).join(', ')})`,
// }));

const Shape = styled.div(
  {
    boxSizing: 'border-box',
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%,-50%)',
    zIndex: -1,
  },
  props => props.backgroundStyle,
  props => props.scalingStyle,
  props => props.customStyle
);

const Cell = styled.div(
  props => ({
    position: 'relative',
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    color: props.darkBg ? props.lightText || 'white' : props.darkText,
    justifyContent: 'center',
    '&:hover div': {
      border: '2px solid rgba(0,0,0,0.5)'
    },
  }),
  props => props.customStyle
);

const LabelX = styled.div(props => (
  {
    order: props.opposite ? 0 : 9999,
  }
));


const HeatMap = ({
    data,
    zLength,
    min,
    max,
    namespace,
    xAxis,
    yAxis,
    cell,
    shape,
    palette,
    mouseOver,
    mouseLeave,
  }) => {

  const getTooltipDataAttrs = (val) => {
    if (val === null) return null;
    const { tooltipDataAttrs } = shape;

    if (typeof tooltipDataAttrs === 'function') {
      return tooltipDataAttrs(val);
    }
    return tooltipDataAttrs;
  }

  const heatmapColStyle = {
    display: 'flex',
    flexDirection: 'column',
  };

  const heatmapYStyle = {
    display: 'flex',
    flexDirection: 'column',  // combine with ColStyle when using classes
    alignItems: 'flex-end',
  };

  const handleCellClick = (e, val) => {
    cell.onClick(e, val);
  };

  return(
    <Grid>
      <div className={`${namespace}y-labels ${namespace}col`} style={heatmapYStyle}>
        <div className={`${namespace}xy`} />
        {yAxis.labels.map((label,i)=>(<div key={i}>{label}</div>))}
      </div>
      {xAxis.labels.map((label,ix)=>(
        <div key={ix} className={`${namespace}col`} style={heatmapColStyle}>
          {xAxis.dangerousLabels ? (
            <LabelX opposite={xAxis.opposite} dangerouslySetInnerHTML={{__html: label}} className={`${namespace}x-label`} customStyle={xAxis.customStyle} />
          ) : (
            <LabelX opposite={xAxis.opposite} className={`${namespace}x-label`} customStyle={xAxis.customStyle} >{label}</LabelX>
          )}
          {yAxis.labels.map((_,iy) => {
            const val = data[iy][ix];
            const color = palette.getColor(val);
            return(
              <Cell
                key={iy} 
                className={`${namespace}cell ${namespace}cell-${ix}-${iy}`}
                darkBg={color && color.isDark()}
                lightText={cell.lightText}
                darkText={cell.darkText}
                customStyle={cell.customStyle && cell.customStyle}
                onClick={val !== null ? (e)=>handleCellClick(e, val) : undefined }
                onMouseOver={e => mouseOver(e,val)}
                onMouseLeave={e => mouseLeave(e)}
                {...getTooltipDataAttrs(val)}
              >
                {val !== null && cell && cell.content && cell.content(val)}
                {val !== null && shape && (
                  <Shape
                    backgroundStyle={backgroundStyle(color)} 
                    scalingStyle={scalingStyle(shape.scaling, val, min, max)}
                    customStyle={shape.customStyle instanceof Function && shape.customStyle(val, min, max)} 
                  />
                )}
              </Cell>
            );
          })}
        </div>
      ))}
    </Grid>
  );
};




export default HeatMap;