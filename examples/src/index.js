import React from 'react';
import { render} from 'react-dom';
import ReactTooltip from 'react-tooltip';

import HeatMap from '../../src';

const App = () => (
  <div>
    <HeatMap
    data={{
      data:[
        [null,null,[0.3,20],[0.3,22]],
        [[0.2,17],[0.8,15],[0.4,20],[0.6,10]],
        [[0.1,11],[0.7,29],[0.3,27],[0.1,43]],
      ],
      customMin: [null, 0],
      valuesLength: 2,
    }}
    namespace={'heatmap-'}
    xAxis={{
      labels: ['een', 'twee', 'nummer drie', 'vier']
    }}
    yAxis={{
      labels: ['a', 'beeee', 'c']
    }}
    cell={{
      content: (val) => String(val[0]),
      onClick: (e,val) => window.alert(val),
      customStyle: {
        width: '40px',
        height: '40px',
      },
    }}
    colors={{
      valuesIndex: 0,
      palette: [
        {value: 0, color: 'rgba(158,90,160,0.9)'},
        {value: 0.5, color: '#208FC6'},
        {value: 1, color: '#FFFFDA'},
      ],
      gradient: true,
    }}
    shape={{  
      scaling: 1,
      rounded: true,
      tooltipDataAttrs: val => ({'data-tip': `value = ${val[0]}`}),
      customStyle: (val, min, max) => ({
        borderRadius: '2px',
      })
    }}
    legend={{
      position: 'top'
    }}
    />
    <ReactTooltip />
  </div>
);
render(<App />, document.getElementById("root"));