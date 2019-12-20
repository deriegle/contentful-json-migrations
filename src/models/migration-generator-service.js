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

    console.log(diff);

    const migrationText = `module.exports = migration => {
  const contentType = migration.createContentType("${newContentType.id}");

  ${newContentType.name && `contentType.name("${newContentType.name}");`}
  ${newContentType.description &&
    `contentType.description("${newContentType.description}");`}

  ${newContentType.fields &&
    newContentType.fields.map(field => {
      return `contentType
    .createField("${field.id}")
    .name("${field.name}")
    .type("${field.type}")
    .required(${field.required});\n`;
    })}};`;

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
      diff.fields.map(([changeType, fieldDiff], index) =>
        this._buildFieldMigration(changeType, fieldDiff, diff, index)
      );

    const migrationText = `
module.exports = (migration) => {
  const contentType = migration.editContentType("${original.id}");

  ${Object.keys(diff).map(k => {
    if (typeof diff[k] === "object" && CONTENT_TYPE_FIELDS.includes(k)) {
      return `contentType.${k}("${diff[k].__new}")`;
    }
  })}

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

  _buildFieldMigration(changeType, fieldDiff, fullDiff, index) {
    if (!changeType || !fieldDiff) {
      return;
    }
    if (changeType == DIFF_TYPES.NO_CHANGE) {
      return;
    }

    console.log(changeType, fieldDiff);
  }
}

module.exports = MigrationGeneratorService;
