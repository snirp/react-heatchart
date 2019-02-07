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
 */
export function Palette(palette, min, max, gradient) {
  this.gradient = gradient;

  // Catch single-color palette for performance
  if (typeof palette === 'string'){
    this.mono = Color(palette);

  // Same for single-item array
  } else if (palette.length === 1){
    this.mono = Color(palette[0])

  // Without stop values, assume equal distribution of stops
  } else if (typeof palette[0] === 'string') { 
    this.colors = palette;
    this.percentages = palette.map((_, i) => i/palette.length)
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

Palette.prototype.getColor = function(value){
  if (this.mono) return mono;
  // Lineair search through sorted array
  let i = 0;
  let j = 1;
  for(; j < this.values.length; j++){
    if (value < this.values[j]) break;
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
  console.log(this.colors.map(color=>color.rgb().string())[0])
  return {
    colors: this.colors.map(color=>color.rgb().string()),
    values: this.values,
    percentages: this.percentages,
    gradient: this.gradient
  }
}
