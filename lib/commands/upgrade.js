const promptVersion = require('../utils/prompt-version');
const childProcess = require('../utils/child-process');
const resolveVersion = require('../utils/resolve-version');

module.exports = {
  name: 'upgrade',
  description: 'Upgrades ember-cli to a specific target',
  works: 'everywhere',
  availableOptions: [{
    name: 'target',
    type: String,
    default: 'latest',
    aliases: ['t'],
    description: 'The version to update ember-cli to.',
  }, {
    name: 'interactive',
    type: Boolean,
    default: false,
    aliases: ['i'],
    description: 'Allow the user to interactivily upgrade the dependencies. Useful if you don\'t want to accept the defaults for merging.',
  }, {
    name: 'yarn',
    type: Boolean,
    default: false,
    aliases: ['y'],
    description: 'Use yarn to run the install command instead of npm.',
  }, {
    name: 'skip-local',
    type: Boolean,
    default: false,
    aliases: ['sl'],
    description: 'Prevent upgrading ember-cli inside an ember project',
  }, {
    name: 'skip-global',
    type: Boolean,
    default: false,
    aliases: ['sg'],
    description: 'Prevent upgrading ember-cli outside an ember project.',
  }, {
    name: 'dry-run',
    type: Boolean,
    default: false,
    aliases: ['d'],
    description: 'Only output the commands that will be run.',
  }, {
    name: 'verbose',
    type: Boolean,
    default: false,
    aliases: ['v'],
    description: 'Show extra output. Useful for debugging.',
  }, ],

  run(options) {
    let {
      target,
      interactive,
      dryRun,
      yarn,
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

    yarn = yarn || this.yarn;
    const packageManager = yarn ? 'yarn' : 'npm';

    return targetPromise.then((emberCliTarget) => {
      if (dryRun) {
        this.ui.writeLine('The following commands would be run...\n');
      }

      const globalRemoveCommands = () => Promise.all([
        // TODO: Figure out how to run this
        callChildProcess(`${packageManager} ${yarn ? 'global remove' : 'uninstall -g'} ember-cli`),
        callChildProcess(`${packageManager} cache clean`),
        callChildProcess('bower cache clean'),
      ]);

      const globalInstallCommands = () => Promise.all([
        // TODO: figure out how to run this
        callChildProcess(`${packageManager} ${yarn ? 'global add' : 'install -g'} ember-cli@${emberCliTarget}`),
      ]);

      const localRemoveCommands = () => Promise.all([
        callChildProcess('rm -rf node_modules bower_components dist tmp'),
      ]);

      const localInstallCommands = () => Promise.all([
        // TODO: Run npmInstall
          callChildProcess(`${packageManager} ${yarn ? 'add -D' : 'install --save-dev'} ember-cli@${emberCliTarget}`),
          // TODO: Run bowerInstall
          callChildProcess('bower install'),
        ])
        // TODO: Run npm
        .then(callChildProcess(`${packageManager} install`));

      const localInitCommands = () => callChildProcess('ember init')
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
        .then(skipLocal ? Promise.resolve() : localInitCommands)
        .catch((err) => ui.writeError(err));
    });
  }
};
