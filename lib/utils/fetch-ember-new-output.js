const fetchJSON = require('./fetch-json');
const normalizeVersion = require('./normalize-version');

module.exports = function fetchEmberNewOutput(version, isAddon = false, verbose = false, file = 'package.json') {
  const baseURL = `https://raw.githubusercontent.com/ember-cli/ember-${isAddon ? 'addon': 'new'}-output`;
  const path = `${baseURL}/${normalizeVersion(version)}/${file}`;
  return fetchJSON(path)
    .then((output) => {
      if (verbose) {
        this.ui.writeLine(output);
      }

      return output;
    });
}
