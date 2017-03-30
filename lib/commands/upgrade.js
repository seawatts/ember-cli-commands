const {
  spawnSync
} = require('child_process');
const fetch = require("node-fetch");
const ora = require('ora');
const packageJson = require('package-json');
const {
  rcompare
} = require('semver');

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

  run(commandArgs) {
    let {
      verbose,
      target,
      interactive,
      dryRun,
    } = commandArgs;

    const ui = this.ui;

    let targetPromise = Promise.resolve(target ? target : 'latest');

    if (interactive) {
      targetPromise = targetPromise
        .then(getTags)
        .then((tags) => {
          return ui.prompt({
            type: 'list',
            name: 'answer',
            message: 'Select ember-cli version to upgrade to',
            choices: ['alpha', 'beta', 'latest', ...tags],
          });
        }).then(({
          answer
        }) => answer);
    }

    function childProcessPromisified(command) {
      return new Promise((resolve, reject) => {
        if (dryRun) {
          ui.writeLine(command);
          return resolve();
        }

        const spinner = ora(command).start();
        let [splitCommand, ...args] = command.split(' ');

        const {
          err,
          stdout,
          stderr
        } = spawnSync(splitCommand, args, {
          stdio: 'inherit'
        });

        if (err) {
          if (verbose) {
            ui.writeError(stderr);
          }

          spinner.fail();
          return reject(new Error(`Could not complete '${command}' -- ${err}`));
        }

        if (verbose) {
          ui.writeLine(stdout);
        }

        spinner.succeed();
        resolve();
      });
    }

    const packageManager = this.useYarn ? 'yarn' : 'npm';

    return targetPromise.then((emberCliTarget) => {
      if (dryRun) {
        ui.writeLine('The following commands would be run...\n');
      }

      return Promise.all([
        childProcessPromisified(`${packageManager} ${this.useYarn ? 'global remove' : 'uninstall -g'} ember-cli`),
        childProcessPromisified(`${packageManager} cache clean`),
        childProcessPromisified('bower cache clean'),
        childProcessPromisified('rm -rf node_modules bower_components dist tmp'),
      ]).then(() => {
        return Promise.all([
          childProcessPromisified(`${packageManager} ${this.useYarn ? 'global add' : 'install -g'} ember-cli@${emberCliTarget}`),
          childProcessPromisified(`${packageManager} ${this.useYarn ? 'add -D' : 'install --save-dev'} ember-cli@${emberCliTarget}`),
          childProcessPromisified('bower install'),
        ]).then(() => {
          return Promise.all([
            childProcessPromisified(`${packageManager} install`),
          ]).then(() => childProcessPromisified('ember init'));
        });
      })
    });
  }
};
