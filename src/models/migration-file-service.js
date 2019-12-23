const path = require("path");
const fs = require("fs");

class MigrationFileService {
  static writeMigration(contentTypeId, migration) {
    if (!fs.existsSync("migrations")) {
      fs.mkdirSync("migrations");
    }

    fs.writeFileSync(this._createFileName(contentTypeId), migration, {
      flag: "wx+"
    });
  }

  static _createFileName(contentTypeId) {
    return path.join(
      "migrations",
      `${new Date().getTime()}-${contentTypeId}.js`
    );
  }
}

module.exports = MigrationFileService;
