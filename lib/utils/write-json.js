const path = require("path");
const fs = require("fs");

module.exports = function writeJSON(file = 'package.json', contents) {
  fs.writeFileSync(path.join(this.project.root, file), JSON.stringify(contents, null, 2));
}
