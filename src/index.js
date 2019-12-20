const jsonDiff = require("json-diff");
const MigrationGeneratorService = require("./models/migration-generator-service");

const DIFF_TYPES = {
  NO_CHANGE: " ",
  ADDITION: "+",
  DELETION: "-",
  UPDATE: "~"
};

function buildMigrationsFromChanges(currentJSON, changes) {
  const migrationGeneratorService = new MigrationGeneratorService(currentJSON);

  if (changes && changes.contentTypes && changes.contentTypes.length > 0) {
    changes.contentTypes.forEach(([changeType, diff], index) => {
      if (!diff || !changeType) {
        return;
      }

      switch (changeType) {
        case DIFF_TYPES.NO_CHANGE:
          return;
        case DIFF_TYPES.ADDITION:
          return migrationGeneratorService.handleAdditionDiff(diff);
        case DIFF_TYPES.DELETION:
          return migrationGeneratorService.handleDeletionDiff(diff);
        case DIFF_TYPES.UPDATE:
          return migrationGeneratorService.handleUpdateDiff(diff, index);
        default:
          throw new Error(`What the heck is this?: ${changeType}`);
      }
    });
  }
}

module.exports = (contentfulExport, localContent) => {
  const changes = jsonDiff.diff(contentfulExport, localContent);

  if (!changes) {
    return;
  }

  buildMigrationsFromChanges(contentfulExport, changes);
};
