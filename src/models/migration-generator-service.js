const fs = require("fs");
const path = require("path");

const CONTENT_TYPE_FIELDS = ["id", "name", "description"];

class MigrationGeneratorService {
  constructor(contentfulJSON) {
    this.contentfulJSON = contentfulJSON;
  }

  handleAdditionDiff(diff) {
    const newContentType = diff;

    const migrationText = `
module.exports = (migration) => {
  const contentType = migration.createContentType('${newContentType.id}');

  ${newContentType.name && `contentType.name('${newContentType.name}')`}
  ${newContentType.description &&
    `contentType.description('${newContentType.description}')`}
}
    `;

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

    const migrationText = `
module.exports = (migration) => {
  const contentType = migration.editContentType('${original.id}');

  ${Object.keys(diff).map(k => {
    if (typeof diff[k] === "object" && CONTENT_TYPE_FIELDS.includes(k)) {
      return `contentType.${k}('${diff[k].__new}')`;
    }
  })}
}
    `;

    this._writeFile(original.id, migrationText);
  }

  _createFileName(contentTypeId) {
    return path.join(
      __dirname,
      "migrations",
      `${new Date().getTime()}-${contentTypeId}.js`
    );
  }

  _writeFile(contentTypeId, migration) {
    fs.writeFileSync(this._createFileName(contentTypeId), migration, {
      flag: "wx+"
    });
  }
}

module.exports = MigrationGeneratorService;
