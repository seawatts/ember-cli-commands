/* eslint-env node */

const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;
const chai = require('ember-cli-blueprint-test-helpers/chai')
const file = chai.file;
const upgradeDeps = require('../../lib/commands/upgrade-deps');
const fetchEmberNewOutput = require('../../lib/utils/fetch-ember-new-output');

const expect = require('ember-cli-blueprint-test-helpers/chai').expect;

function createContext(currentCliVersion, devDependencies, dependencies) {
  return {
    ui: {
      prompt() {
        return Promise.resolve()
      },
      writeError() {},
      writeLine() {},
    },
    project: {
      root: process.cwd(),
      pkg: {
        devDependencies,
        dependencies,
      },
      emberCLIVersion() {
        return currentCliVersion;
      },
    },
  };
}

function comparePackageJson(devDependencies, dependencies) {
  const actualContents = file(`${process.cwd()}/package.json`);
  const expectedContents = JSON.stringify({
    devDependencies,
    dependencies,
  }, null, 2);

  expect(actualContents).to.contain(expectedContents);
}

function runUpgradeDeps(options, cliContext) {
  const run = upgradeDeps.run.bind(cliContext);
  return run(options);
}

describe('Acceptance: ember upgrade:deps', function () {
  setupTestHooks(this);

  it('changes the local ember-cli version to the target', function () {
    const upgradeTargetVersion = '2.13.0-beta.1';
    const localVersion = '2.10.0';
    const localDependencies = {
      "ember-cli": localVersion,
    };

    return runUpgradeDepsAndAssert(localVersion, localDependencies, upgradeTargetVersion);
  });

  it('keeps added packages', function () {
    const upgradeTargetVersion = '2.13.0-beta.1';
    const localVersion = '2.10.0';
    const localDependencies = {
      "ember-cli": localVersion,
      "ember-simple-auth": "1.0.0",
    };

    return runUpgradeDepsAndAssert(localVersion, localDependencies, upgradeTargetVersion);
  });

  it('removes packages that are no longer in ember-new-output', function () {
    const upgradeTargetVersion = '2.13.0-beta.1';
    const localVersion = '2.10.0';
    const localDependencies = {
      "ember-cli": localVersion,
      "ember-cli-jshint": "^2.0.1",
    };

    return runUpgradeDepsAndAssert(localVersion, localDependencies, upgradeTargetVersion);
  });
});

function runUpgradeDepsAndAssert(localVersion, localDependencies, upgradeTargetVersion) {
  return emberNew()
    .then(() => {
      const cliContext = createContext(localVersion, localDependencies);

      return runUpgradeDeps({
        target: upgradeTargetVersion,
        localVersion: localVersion,
        skipInstall: true,
        dryRun: true,
      }, cliContext);
    })
    .then(() => fetchEmberNewOutput(upgradeTargetVersion))
    .then(({
      devDependencies,
    }) => comparePackageJson(mergeDefined(localDependencies, devDependencies)));
}

function mergeDefined(objectA, objectB) {
  for (let [keyA, valueA] of Object.entries(objectA)) {
    if (valueA && objectB[keyA]) {
      objectA[keyA] = objectB[keyA];
    }
  }

  return objectA;
}
