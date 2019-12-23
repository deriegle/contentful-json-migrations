const MigrationFileService = require("./migration-file-service");

const CONTENT_TYPE_FIELDS = ["id", "name", "description"];
const DIFF_TYPES = {
  NO_CHANGE: " ",
  ADDITION: "+",
  DELETION: "-",
  UPDATE: "~"
};

class MigrationGeneratorService {
  constructor(contentfulJSON) {
    this.contentfulJSON = contentfulJSON;
  }

  build(changes) {
    if (!changes || !changes.contentTypes || !changes.contentTypes.length) {
      return;
    }

    return changes.contentTypes.map(([changeType, diff], index) => {
      if (!diff || !changeType) {
        return;
      }

      switch (changeType) {
        case DIFF_TYPES.NO_CHANGE:
          return;
        case DIFF_TYPES.ADDITION:
          return this.handleAdditionDiff(diff);
        case DIFF_TYPES.DELETION:
          return this.handleDeletionDiff(diff);
        case DIFF_TYPES.UPDATE:
          return this.handleUpdateDiff(diff, index);
        default:
          throw new Error(`What the heck is this?: ${changeType}`);
      }
    });
  }

  handleAdditionDiff(diff) {
    const newContentType = diff;

    const migrationText = `module.exports = migration => {
  const contentType = migration.createContentType("${newContentType.id}");

  ${newContentType.name && `contentType.name("${newContentType.name}");`}
  ${newContentType.description &&
    `contentType.description("${newContentType.description}");`}

  ${newContentType.fields &&
    newContentType.fields
      .map(field => {
        return `contentType
    .createField("${field.id}")
    .name("${field.name}")
    .type("${field.type}")
    .required(${field.required});\n`;
      })
      .join("\n")}};`;

    MigrationFileService.writeMigration(newContentType.id, migrationText);
  }

  handleDeletionDiff(diff) {
    const migrationText = `
module.exports = (migration) => {
  migration.deleteContentType('${diff.id}');
}
    `;

    MigrationFileService.writeMigration(diff.id, migrationText);
  }

  handleUpdateDiff(diff, index) {
    const original = this.contentfulJSON.contentTypes[index];

    const fieldMigrations =
      diff.fields &&
      diff.fields.map(([changeType, fieldDiff], fieldIndex) =>
        this._buildFieldMigration(changeType, fieldDiff, fieldIndex, index)
      );

    const contentTypeEdits = Object.keys(diff)
      .map(k => {
        if (typeof diff[k] === "object" && CONTENT_TYPE_FIELDS.includes(k)) {
          return `contentType.${k}("${diff[k].__new}")`;
        }
      })
      .join("\n");

    const migrationText = `
module.exports = (migration) => {
  const contentType = migration.editContentType("${original.id}");

  ${contentTypeEdits}
  ${fieldMigrations}
}
    `;

    MigrationFileService.writeMigration(original.id, migrationText);
  }

  _buildFieldMigration(changeType, fieldDiff, fieldIndex, diffIndex) {
    if (!changeType || !fieldDiff) {
      return;
    }
    if (changeType == DIFF_TYPES.NO_CHANGE) {
      return;
    }

    const currentField = this.contentfulJSON.contentTypes[diffIndex].fields[
      fieldIndex
    ];

    const fieldEdits = Object.keys(fieldDiff)
      .map(key => {
        if (typeof fieldDiff[key] !== "object") {
          return;
        }

        const newValue = fieldDiff[key].__new;

        return typeof newValue === "string"
          ? `.${key}("${newValue}")`
          : `.${key}(${newValue})`;
      })
      .filter(s => s)
      .join("\n");

    return `
    contentType.editField("${currentField.id}")
    ${fieldEdits}
  `;
  }
}

module.exports = MigrationGeneratorService;
