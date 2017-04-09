const fetchJSON = require('./fetch-json');
const normalizeVersion = require('./normalize-version');

const baseURL = 'https://raw.githubusercontent.com/ember-cli/ember-new-output';

module.exports = function fetchEmberNewOutput(version, file = 'package.json') {
  const path = `${baseURL}/${normalizeVersion(version)}/${file}`;
  return fetchJSON(path)
    .then((output) => {
      return output;
    });
}
