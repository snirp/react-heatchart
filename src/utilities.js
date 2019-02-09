var Color = require('color');

/**
 * Construct palette
 * 
 * @param {string|Object[]} palette - Initial palette of color values or color-stop objects
 * @param {number} palette[].value - Stop value
 * @param {string} palette[].color - Stop color, hex / rgb / rgba / hsl / hsla
 * @param {number} min - Mininum value from dataset
 * @param {number} max - Maximum value from dataset
 * @param {bool} gradient - Return gradient or rounded colors
 * @param {number|undefined} index - Index number for values array
 */
export function Palette(palette, min, max, gradient, index) {
  this.gradient = gradient;
  this.index = index;

  // Without stop values, assume equal distribution of stops
  if (typeof palette[0] === 'string') { 
    this.colors = palette.map(s => Color(s));
    this.percentages = palette.map((_, i) => i/(palette.length-1))
    this.values = this.percentages.map(perc => (max-min)*perc + min)

  // Use stop values to generate palette
  } else {
    palette.sort((a,b)=> a.value > b.value ? 1 : a.value < b.value ? -1 : 0);
    this.colors = palette.map(stop => Color(stop.color));
    this.values = palette.map(stop => stop.value);
    // Stretch the palette to cover min to max
    if (min < this.values[0]) {
      this.values.unshift(min);
      this.colors.unshift(this.colors[0])
    }
    if (max > this.values[this.values.length-1]) {
      this.values.push(max);
      this.colors.push(this.colors[this.colors.length-1])
    }
    this.percentages = this.values.map(value => (value-this.values[0])/(this.values[this.values.length-1]-this.values[0]));
  }
}

Palette.prototype.getColor = function(val){
  if (val === null) return null;

  const value = Array.isArray(val) ? val[this.index] : val;
  
  // Lineair search through sorted array
  let i = 0;
  let j = 1;
  for(; j < this.values.length; j++){
    if (value <= this.values[j]) break;
    i = j;
  }
  let ratio = (value-this.values[i])/(this.values[j]-this.values[i]);
  if (this.gradient){
    // Create clone because this manipulates color
    return Color(this.colors[i].object()).mix(this.colors[j], ratio)
  } else {
    return ratio < 0.5 ? this.colors[i] : this.colors[j]
  }
}

Palette.prototype.getLegend = function(){
  return this.colors.map((color,i) => ({
    color,
    value: this.values[i],
    percentage: this.percentages[i]
  }))
}
