const promptVersion = require('../utils/prompt-version');
const childProcess = require('../utils/child-process');

module.exports = {
  name: 'upgrade',
  description: 'Upgrades ember-cli to a specific target',
  availableOptions: [{
    name: 'verbose',
    type: Boolean,
    default: false,
    aliases: ['v']
  }, {
    name: 'target',
    type: String,
    default: null,
    aliases: ['t']
  }, {
    name: 'dry-run',
    type: Boolean,
    default: false,
    aliases: ['d']
  }, {
    name: 'interactive',
    type: Boolean,
    default: false,
    aliases: ['i']
  }, ],

  run({
    verbose,
    target,
    interactive,
    dryRun,
  }) {
    let targetPromise = Promise.resolve(target ? target : 'latest');

    if (interactive) {
      targetPromise = promptVersion.call(this);
    }

    const packageManager = this.useYarn ? 'yarn' : 'npm';

    return targetPromise.then((emberCliTarget) => {
      if (dryRun) {
        this.ui.writeLine('The following commands would be run...\n');
      }

      return Promise.all([
        childProcess.call(this, `${packageManager} ${this.useYarn ? 'global remove' : 'uninstall -g'} ember-cli`),
        childProcess.call(this, `${packageManager} cache clean`),
        childProcess.call(this, 'bower cache clean'),
        childProcess.call(this, 'rm -rf node_modules bower_components dist tmp'),
      ]).then(() => {
        return Promise.all([
          childProcess.call(this, `${packageManager} ${this.useYarn ? 'global add' : 'install -g'} ember-cli@${emberCliTarget}`),
          childProcess.call(this, `${packageManager} ${this.useYarn ? 'add -D' : 'install --save-dev'} ember-cli@${emberCliTarget}`),
          childProcess.call(this, 'bower install'),
        ]).then(() => {
          return Promise.all([
            childProcess.call(this, `${packageManager} install`),
          ]).then(() => childProcess.call(this, 'ember init'));
        });
      })
    });
  }
};
