const fetchJSON = require('./fetch-json');
const normalizeVersion = require('./normalize-version');
const ora = require('ora')

module.exports = function fetchEmberNewOutput(version, isAddon = false, verbose = false, file = 'package.json') {
  const spinner = ora(`Getting new output for ${version}`).start();
  const baseURL = `https://raw.githubusercontent.com/ember-cli/ember-${isAddon ? 'addon': 'new'}-output`;
  const path = `${baseURL}/${normalizeVersion(version)}/${file}`;
  return fetchJSON(path)
    .then((output) => {
      if (verbose) {
        this.ui.writeLine(`Output for: ${path}`);
        this.ui.writeLine('---------------------------------');
        this.ui.writeLine(JSON.stringify(output, null, 2));
      }

      spinner.succeed();
      return output;
    });
}
