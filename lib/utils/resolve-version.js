const packageJson = require('package-json');

module.exports = function resolveVersion(version) {
  return packageJson('ember-cli', {
      version,
    })
    .then((package) => {
      return package.version;
    });
}
