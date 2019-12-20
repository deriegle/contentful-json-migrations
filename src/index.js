const jsonDiff = require("json-diff");

const migrations = [];

const DIFF_TYPES = {
  NO_CHANGE: " ",
  ADDITION: "+",
  DELETION: "-",
  UPDATE: "~"
};

const DEFAULT_CONTENT_TYPE_FIELDS = ["id", "name", "description"];

function handleUpdateDiff(diff, index, currentJSON) {
  const original = currentJSON.contentTypes[index];

  const contentMigration = migration => {
    const contentType = migration.editContentType(original.id);

    Object.keys(diff).forEach(k => {
      if (
        typeof diff[k] === "object" &&
        DEFAULT_CONTENT_TYPE_FIELDS.includes(k)
      ) {
        contentType[k](diff[k].__new);
      }
    });
  };

  migrations.push(contentMigration);

  return contentMigration;
}

function buildMigrationsFromChanges(currentJSON, changes) {
  console.log(changes);

  if (changes && changes.contentTypes && changes.contentTypes.length > 0) {
    changes.contentTypes.forEach(([changeType, diff], index) => {
      if (!diff || !changeType) {
        return;
      }

      switch (changeType) {
        case DIFF_TYPES.NO_CHANGE:
          return console.log("No change");
        case DIFF_TYPES.ADDITION:
          return console.log("ADDITION", diff);
        case DIFF_TYPES.DELETION:
          return console.log("DELETION", diff);
        case DIFF_TYPES.UPDATE:
          return console.log(handleUpdateDiff(diff, index, currentJSON));
        default:
          throw new Error(`I don\'t know about this: ${changeType}`);
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

  return changes;
};
