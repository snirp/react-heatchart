import React from 'react';
import Legend from './Legend';
import HeatMap from './HeatMap';

export default class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = {activeVal: null};
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
      <div>
        <HeatMap {...this.props} mouseOver={this.handleMouseOver} mouseLeave={this.handleMouseLeave}/>
        <Legend value={this.state.activeVal} />
      </div>
    );
  }
};