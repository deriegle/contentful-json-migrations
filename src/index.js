const MigrationGeneratorService = require("./models/migration-generator-service");
const ContentfulDiffService = require("../src/models/contentful-diff-service");

module.exports = (contentfulExport, localContent) => {
  const changes = ContentfulDiffService.generateDiff(
    contentfulExport,
    localContent
  );

  if (!changes) {
    return;
  }

  new MigrationGeneratorService(localContent).build(changes);
};
