const packageJson = require('package-json');
const ora = require('ora')

module.exports = function resolveVersion(version) {
  const spinner = ora(`Resolving ${version}`).start();
  return packageJson('ember-cli', {
      version,
    })
    .then(({
      version: resolvedVersion
    }) => {
      spinner.succeed(`Resolved ${version} as ${resolvedVersion}`);
      // this.ui.writeLine(`Resolved ${version} as ${resolvedVersion}`);

      return resolvedVersion;
    });
}
