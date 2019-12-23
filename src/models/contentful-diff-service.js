const jsonDiff = require("json-diff");

class ContentfulDiffService {
  static generateDiff(contentfulExport, localContent) {
    return jsonDiff.diff(contentfulExport, localContent);
  }
}

module.exports = ContentfulDiffService;
