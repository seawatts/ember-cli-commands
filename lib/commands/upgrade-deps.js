/*jshint node:true*/

const PackageMerger = require("package-merger");
const path = require("path");
const fetch = require("node-fetch");
const fs = require("fs");
const packageJson = require('package-json');
const {
  rcompare
} = require('semver');

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
  run(options) {
    const {
      target,
      interactive,
    } = options;

    const ui = this.ui;
    const ourPkg = this.project.pkg; // host addon's package.json
    // TODO: Get actual installed ember-cli version locally
    const pristineEmberVersion = `v${this.project.cli.analytics.version}`;
    let targetPromise = Promise.resolve(target ? target : 'master');

    if (interactive) {
      targetPromise = targetPromise
        .then(getTags)
        .then((tags) => {
          return this.ui.prompt({
            type: 'list',
            name: 'answer',
            message: 'Select ember-cli version to upgrade to',
            choices: tags.map((tag) => `v${tag}`),
          });
        }).then(({
          answer
        }) => answer);
    }

    function fetchDeps(ours, versionInfo) {
      return new Promise((resolve) => {
        const ourVersion = versionInfo.pristine;
        const theirVersion = versionInfo.future;
        const sourcePath = `https://raw.githubusercontent.com/ember-cli/ember-new-output/${ourVersion}/package.json`;
        const theirsPath = `https://raw.githubusercontent.com/ember-cli/ember-new-output/${theirVersion}/package.json`;
        fetchPackageContents(sourcePath)
          .then((source) => {
            fetchPackageContents(theirsPath)
              .then((theirs) => {
                //  source = pristine version of ember cli package.json for our project
                //  ours   = our package.json (local to parent app) in its current state
                //  theirs = the version of ember cli we want to upgrade to
                return resolve({
                  source,
                  ours,
                  theirs,
                });
              })
          })
      });
    }

    function fetchPackageContents(path) {
      return fetch(path)
        .then(res => res.json())
    }

    function performMerge(mergeDependencies, ourDependencies = {}) {
      let result = Object.assign({}, ourDependencies);
      mergeDependencies.add.map((dep) => result[dep.name] = dep.version);
      mergeDependencies.remove.map((dep) => delete result[dep.name]);
      mergeDependencies.change.map((dep) => result[dep.name] = dep.version);
      return sortObject(result);
    }

    function sortObject(o = {}) {
      return Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});
    }

    function getTags() {
      return packageJson('ember-cli', {
          allVersions: true
        })
        .then(({
          versions
        }) => Object.keys(versions))
        .then((versions) => versions.sort(rcompare))
    }

    function promptMerge(dependencies, ourPkg) {
      let promise = Promise.resolve();
      for (let [key, dependency] of Object.entries(dependencies)) {
        promise = promise
          .then(() => promptCheckbox(key, dependencies[key], ourPkg)
            .then((deps) => dependencies[key] = deps));
      }

      return promise;
    }


    function promptCheckbox(mergeType, dependencies, ourPkg) {
      if (dependencies.length === 0) {
        return Promise.resolve([]);
      }

      return ui.prompt({
          type: 'checkbox',
          name: 'checked',
          message: `Select packages you would like to ${mergeType}`,
          choices: dependencies.map((dependency) => {
            let name = `${dependency.name} = ${dependency.version}`

            switch (mergeType) {
              case 'change':
                name = `${dependency.name} ${ourPkg[dependency.name]} => ${dependency.version}`
                break;
              case 'remove':
                name = dependency.name;
                break;
            }

            return {
              value: dependency,
              name,
            };
          })
        })
        .then(({
          checked
        }) => checked);
    }

    return targetPromise.then((emberCliTarget) => {
      const versionInfo = {
        pristine: pristineEmberVersion,
        future: emberCliTarget
      };

      return fetchDeps(ourPkg, versionInfo)
        .then(({
          source,
          ours,
          theirs
        }) => {
          let merge = PackageMerger.merge({
            source,
            ours,
            theirs
          });

          let promise = Promise.resolve();

          for (let [key, dependencies] of Object.entries(merge)) {
            if (options.interactive) {
              promise = promise.then(() => promptMerge(dependencies, ourPkg[key]));
            }

            promise = promise
              .then(() => performMerge(dependencies, ourPkg[key]))
              .then((deps) => ourPkg[key] = deps);
          }

          return promise.then(() => {
            if (options.dryRun) {
              this.ui.writeLine(JSON.stringify(ourPkg, null, 2));
            } else {
              fs.writeFileSync(path.join(this.project.root, 'package.json'), JSON.stringify(ourPkg, null, 2));
            }
          });
        })
        .catch(this.ui.writeError.bind(this.ui));
    });
  }
};
