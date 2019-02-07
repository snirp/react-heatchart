import React from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
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

const Gradient = styled.div( props => ({
  height: '80%',
  width: '10px',
  background: `linear-gradient(${props.palette.colors.map((color, i)=>(
    color+' '+props.palette.percentages[i]*100+'%')).join(', ')})`,
}));

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


const HeatMap = ( 
    {data:{data, valuesLength, customMin, customMax}, 
    namespace, 
    xAxis, 
    yAxis, 
    colors, 
    cell, 
    shape, 
    legend, 
    mouseLeave, 
    mouseOver}
  ) => {
  
  // Treat zLength as a fallback if first data cell is null
  const zLength = Array.isArray(data[0][0]) ?  data[0][0].length : valuesLength;
  let min;
  let max;

  // For 3d array
  if (zLength){
    // Use custom min and max arrays or default to null-filled array
    min = Array.isArray(customMin) ? customMin : new Array(zLength).fill(null);
    max = Array.isArray(customMax) ? customMax : new Array(zLength).fill(null);

    for(let z=0; z<zLength; z++){
      // TODO performance: check for none-null values before creating a flat array
      let flatZ = [];
      for(let y=0; y<data.length; y++){
        for(let x=0; x<data[y].length; x++){
          if (data[y][x] !== null) flatZ.push(data[y][x][z]);
        }
      }
      min[z] = min[z] === null ? (Math.min(...flatZ)) : min[z];
      max[z] = max[z] === null ? (Math.max(...flatZ)) : max[z];
    }

  // For 2d array
  } else {
    // TODO performance: flat array not needed if both custom min and max are provided
    const flat = data.reduce((acc, cv) => [...acc, ...cv], []).filter(value => value !== null);
    min = isNaN(customMin) ? Math.min(...flat) : customMin;
    max = isNaN(customMax) ? Math.max(...flat) : customMax;
  }

  const paletteMin = zLength ? min[colors.valuesIndex] : min;
  const paletteMax = zLength ? max[colors.valuesIndex] : max;
  const palette = new Palette(colors.palette, paletteMin, paletteMax, colors.gradient)

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
    <Container legend={legend && legend.position}>
      <div data-tip="hhhh">hoi</div>
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
              const color = val !== null ? palette.getColor(zLength ? val[colors.valuesIndex]: val) : null;
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

      {legend && (
        <Legend>
          <Gradient palette={palette.getLegend()} />
          
        </Legend>
       
      )}

    </Container>
  );
};

HeatMap.defaultProps = {
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
    position: 'bottom',
  }
};

HeatMap.propTypes = {
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
    position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),

  })
};

export default HeatMap;