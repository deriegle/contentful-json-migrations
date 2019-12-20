const fs = require("fs");
const jsonDiff = require("json-diff");
const path = require("path");

const DIFF_TYPES = {
  NO_CHANGE: " ",
  ADDITION: "+",
  DELETION: "-",
  UPDATE: "~"
};

const DEFAULT_CONTENT_TYPE_FIELDS = ["id", "name", "description"];

function createFileName(contentTypeId) {
  return path.join(
    __dirname,
    "migrations",
    `${new Date().getTime()}-${contentTypeId}.js`
  );
}

function handleAdditionDiff(diff) {
  const newContentType = diff;

  const migrationText = `
    module.exports = (migration) => {
      const contentType = migration.createContentType('${newContentType.id}');

      ${newContentType.name && `contentType.name('${newContentType.name}')`}
      ${newContentType.description &&
        `contentType.description('${newContentType.description}')`}
    }
    `;

  fs.writeFileSync(createFileName(newContentType.id), migrationText, {
    flag: "wx+"
  });
}

function handleUpdateDiff(diff, index, currentJSON) {
  const original = currentJSON.contentTypes[index];

  const migrationText = `
module.exports = (migration) => {
  const contentType = migration.editContentType('${original.id}');

  ${Object.keys(diff).map(k => {
    if (
      typeof diff[k] === "object" &&
      DEFAULT_CONTENT_TYPE_FIELDS.includes(k)
    ) {
      return `contentType.${k}('${diff[k].__new}')`;
    }
  })}
}
    `;

  fs.writeFileSync(createFileName(original.id), migrationText, {
    flag: "wx+"
  });
}

function buildMigrationsFromChanges(currentJSON, changes) {
  if (changes && changes.contentTypes && changes.contentTypes.length > 0) {
    changes.contentTypes.forEach(([changeType, diff], index) => {
      if (!diff || !changeType) {
        return;
      }

      switch (changeType) {
        case DIFF_TYPES.NO_CHANGE:
          return console.log("No change");
        case DIFF_TYPES.ADDITION:
          return handleAdditionDiff(diff);
        case DIFF_TYPES.DELETION:
          return console.log("DELETION", diff);
        case DIFF_TYPES.UPDATE:
          return handleUpdateDiff(diff, index, currentJSON);
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
