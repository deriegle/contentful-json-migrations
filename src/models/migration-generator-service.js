const fs = require("fs");
const path = require("path");

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

    this._writeFile(newContentType.id, migrationText);
  }

  handleDeletionDiff(diff) {
    const migrationText = `
module.exports = (migration) => {
  migration.deleteContentType('${diff.id}');
}
    `;

    this._writeFile(diff.id, migrationText);
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

    this._writeFile(original.id, migrationText);
  }

  _writeFile(contentTypeId, migration) {
    if (!fs.existsSync("migrations")) {
      fs.mkdirSync("migrations");
    }

    fs.writeFileSync(this._createFileName(contentTypeId), migration, {
      flag: "wx+"
    });
  }

  _createFileName(contentTypeId) {
    return path.join(
      "migrations",
      `${new Date().getTime()}-${contentTypeId}.js`
    );
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
