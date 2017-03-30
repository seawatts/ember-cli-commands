const promptVersion = require('../utils/prompt-version');
const childProcess = require('../utils/child-process');
const resolveVersion = require('../utils/resolve-version');

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
  }, {
    name: 'use-yarn',
    type: Boolean,
    default: false,
    aliases: ['y']
  }, {
    name: 'skip-local',
    type: Boolean,
    default: false,
  }, {
    name: 'skip-global',
    type: Boolean,
    default: false,
  }],

  run(options) {
    let {
      verbose,
      target,
      interactive,
      dryRun,
      useYarn,
      skipLocal,
      skipGlobal
    } = options;

    const {
      ui,
      project: {
        emberCLIVersion,
      },
    } = this;

    let targetPromise = Promise.resolve(target ? target : 'latest');
    const localCliVersion = emberCLIVersion();

    if (interactive) {
      targetPromise = promptVersion.call(this);
    }

    targetPromise = targetPromise.then(resolveVersion);

    useYarn = useYarn || this.useYarn;
    const packageManager = useYarn ? 'yarn' : 'npm';

    return targetPromise.then((emberCliTarget) => {
      if (dryRun) {
        this.ui.writeLine('The following commands would be run...\n');
      }

      const globalRemoveCommands = () => Promise.all([
        callChildProcess(`${packageManager} ${useYarn ? 'global remove' : 'uninstall -g'} ember-cli`),
        callChildProcess(`${packageManager} cache clean`),
        callChildProcess('bower cache clean'),
      ]);

      const globalInstallCommands = () => Promise.all([
        callChildProcess(`${packageManager} ${useYarn ? 'global add' : 'install -g'} ember-cli@${emberCliTarget}`),
      ]);

      const localRemoveCommands = () => Promise.all([
        callChildProcess('rm -rf node_modules bower_components dist tmp'),
      ]);

      const localInstallCommands = () => Promise.all([
          callChildProcess(`${packageManager} ${useYarn ? 'add -D' : 'install --save-dev'} ember-cli@${emberCliTarget}`),
          callChildProcess('bower install'),
        ])
        .then(callChildProcess(`${packageManager} install`));

      const localInitCommands = () => callChildProcess('ember init --skip-deps')
        .then(() => callChildProcess(`ember upgrade:deps --target ${emberCliTarget} --local-version ${localCliVersion}`));

      const self = this;

      function callChildProcess(command) {
        return childProcess.call(self, command, options);
      }

      return Promise.resolve()
        .then(skipGlobal ? Promise.resolve() : globalRemoveCommands)
        .then(skipGlobal ? Promise.resolve() : globalInstallCommands)
        .then(skipLocal ? Promise.resolve() : localRemoveCommands)
        .then(skipLocal ? Promise.resolve() : localInstallCommands)
        .then(skipLocal ? Promise.resolve() : localInitCommands);
    });
  }
};
