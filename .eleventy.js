const yaml = require('js-yaml');
module.exports = function(eleventyConfig) {
  eleventyConfig.addDataExtension('yaml', text => yaml.safeLoad(text))
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addFilter('lang', function (value) {
    if (typeof value === 'object' && value) {
      if (this.ctx && this.ctx.lang && this.ctx.lang in value)  {
        return value[this.ctx.lang];
      }
      const keys = Object.keys(value);
      if (keys && keys.length !== 0) {
        return value[keys[0]];
      }
    }
    return value;
  });
}