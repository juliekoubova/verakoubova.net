const yaml = require('js-yaml');
module.exports = function(eleventyConfig) {
  eleventyConfig.addDataExtension('yaml', text => yaml.safeLoad(text))
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addFilter('stripSortPrefix', function (value) {
    return String(value).replace(/^\d+-/, '');
  });
  eleventyConfig.addFilter('lang', function (value) {
    if (typeof value === 'object' && value) {
      if (this.ctx && this.ctx.lang && this.ctx.lang in value)  {
        return value[this.ctx.lang];
      }
      const keys = Object.keys(value).filter(k => k.length === 2);
      if (keys && keys.length !== 0) {
        return value[keys[0]];
      }
    }
    return value;
  });
}