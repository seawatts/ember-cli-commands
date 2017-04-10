/*jshint node:true*/

const ThreeWayMerger = require("three-way-merger");
const promptVersion = require('../utils/prompt-version');
const fetchAllDependencies = require('../utils/fetch-all-dependencies');
const performThreeWayMerger = require('../utils/perform-three-way-merger');
const writeJSON = require('../utils/write-json');
const promptMerge = require('../utils/prompt-merge');
const resolveVersion = require('../utils/resolve-version');
const ora = require('ora')
const childProcess = require('../utils/child-process');

module.exports = {
  name: 'upgrade:deps',
  description: 'Upgrade the dependencies inside your ember project',
  works: 'insideProject',
  availableOptions: [{
    name: 'target',
    type: String,
    default: 'latest',
    aliases: ['t'],
    description: 'The version to update ember-cli to.',
  }, {
    name: 'local-version',
    type: String,
    default: null,
    aliases: ['l'],
    description: 'The local installed version of ember-cli.',
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
    name: 'skip-install',
    type: Boolean,
    default: false,
    aliases: ['si'],
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
      localVersion,
      interactive,
      verbose,
      dryRun,
      yarn,
      skipInstall,
    } = options;

    const {
      ui,
      project: {
        pkg: localPkg,
        emberCLIVersion,
      },
    } = this;

    const localCliVersion = localVersion ? localVersion : emberCLIVersion()

    let targetPromise = Promise.resolve(target ? target : 'latest');

    if (interactive) {
      targetPromise = promptVersion.call(this);
    }

    targetPromise = targetPromise.then(resolveVersion);

    function callChildProcess(command) {
      return childProcess.call(self, command, options);
    }

    return targetPromise.then((emberCliTarget) => {
      const spinner = ora('Merging dependencies').start();

      return fetchAllDependencies.call(this, localPkg, localCliVersion, emberCliTarget)
        .then(ThreeWayMerger.merge)
        .then((merge) => {
          if (verbose) {
            ui.writeLine(JSON.stringify(merge, null, 2));
          }

          spinner.succeed();

          let promise = Promise.resolve();

          if (interactive) {
            promise = promise.then(() => promptMerge.call(this, merge, localPkg));
          }

          return promise.then(() => {
            performThreeWayMerger.call(this, merge, localPkg);

            if (dryRun) {
              ui.writeLine(JSON.stringify(localPkg, null, 2));
            } else {
              writeJSON.call(this, 'package.json', localPkg);
            }
          });
        })
        .then(() => {
          if (skipInstall) {
            return Promise.resolve();
          }

          return this.runTask('NpmInstall', {
            verbose: verbose,
            useYarn: yarn,
          });
        })
        .catch((err) => {
          spinner.fail();
          ui.writeError(err)
        });
    });
  }
};
