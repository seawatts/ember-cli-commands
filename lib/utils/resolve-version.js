const packageJson = require('package-json');
const ora = require('ora')

module.exports = function resolveVersion(version) {
  const spinner = ora(`Resolving ${version}`).start();
  return packageJson('ember-cli', {
      version,
    })
    .then((package) => {
      spinner.succeed();
      return package.version;
    });
}
