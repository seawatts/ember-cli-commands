'use strict';

const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;
const chai = require('ember-cli-blueprint-test-helpers/chai')
const file = chai.file;
const upgradeDeps = require('../../lib/commands/upgrade-deps.js');

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

  it('upgrade:deps', function () {
    const upgradeTargetVersion = '2.13.0-beta.1';
    const localVersion = '2.10.0';
    const localDependencies = {
      "ember-cli": localVersion,
      "ember-cli-eslint": "^3.0.0",
      "ember-cli-shims": "^1.0.2",
      "ember-simple-auth": "1.0.0",
      "ember-source": "~2.13.0-beta.1"
    };

    return emberNew()
      .then(() => {
        const cliContext = createContext(localVersion, localDependencies);

        return runUpgradeDeps({
          target: upgradeTargetVersion,
        }, cliContext);
      })
      .then(() => {
        // TODO: Get the actual contents from the network
        comparePackageJson(Object.assign(localDependencies, {
          "ember-cli": upgradeTargetVersion
        }));
      });
  });
});
