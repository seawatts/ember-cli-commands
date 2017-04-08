const packageJson = require('package-json');
const ora = require('ora')

const {
  rcompare
} = require('semver');

module.exports = function getEmberCliTags() {
  const spinner = ora('Getting ember-cli versions').start();

  return packageJson('ember-cli', {
      allVersions: true
    })
    .then(({
      versions
    }) => {
      spinner.succeed();
      return Object.keys(versions)
    })
    .then((versions) => versions.sort(rcompare))
}
