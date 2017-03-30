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
  description: 'Upgrade the dependencies',
  works: 'insideProject',
  availableOptions: [{
    name: 'verbose',
    type: Boolean,
    default: false,
    aliases: ['v']
  }, {
    name: 'dry-run',
    type: Boolean,
    default: false,
    aliases: ['d']
  }, {
    name: 'target',
    type: String,
    default: null,
    aliases: ['t']
  }, {
    name: 'interactive',
    type: Boolean,
    default: false,
    aliases: ['i']
  }, {
    name: 'local-version',
    type: String,
    default: null,
    aliases: ['l']
  }, {
    name: 'use-yarn',
    type: Boolean,
    default: false,
    aliases: ['y']
  }, {
    name: 'skip-install',
    type: Boolean,
    default: false,
  }, ],
  run(options) {
    let {
      target,
      localVersion,
      interactive,
      verbose,
      dryRun,
      useYarn,
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
          useYarn = useYarn || this.useYarn;
          const packageManager = useYarn ? 'yarn' : 'npm';

          return childProcess.call(this, `${packageManager} install`, options);
        })
        .catch((err) => {
          spinner.fail();
          ui.writeError(err)
        });
    });
  }
};
