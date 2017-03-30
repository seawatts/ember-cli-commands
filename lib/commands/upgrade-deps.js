/*jshint node:true*/

const ThreeWayMerger = require("three-way-merger");
const promptVersion = require('../utils/prompt-version');
const fetchDeps = require('../utils/fetch-deps');
const performThreeWayMerger = require('../utils/perform-three-way-merger');
const writeJSON = require('../utils/write-json');
const promptMerge = require('../utils/prompt-merge');
const resolveVersion = require('../utils/resolve-version');

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
  }, ],
  run({
    target,
    interactive,
    verbose,
    dryRun,
  }) {
    const {
      ui,
      project: {
        pkg: localPkg,
      },
    } = this;

    let targetPromise = Promise.resolve(target ? target : 'latest');

    if (interactive) {
      targetPromise = promptVersion.call(this);
    }

    targetPromise = targetPromise.then(resolveVersion);

    return targetPromise.then((emberCliTarget) => {
      return fetchDeps.call(this, localPkg, emberCliTarget)
        .then(ThreeWayMerger.merge)
        .then((merge) => {
          if (verbose) {
            ui.writeLine(JSON.stringify(merge, null, 2));
          }

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
        .catch((err) => ui.writeError(err));
    });
  }
};
