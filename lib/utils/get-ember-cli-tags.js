const packageJson = require('package-json');

const {
  rcompare
} = require('semver');

module.exports = function getEmberCliTags() {
  return packageJson('ember-cli', {
      allVersions: true
    })
    .then(({
      versions
    }) => Object.keys(versions))
    .then((versions) => versions.sort(rcompare))
}
