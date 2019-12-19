const jsonDiff = require("json-diff");

module.exports = (contentfulExport, localContent) =>
  jsonDiff.diff(contentfulExport, localContent);
