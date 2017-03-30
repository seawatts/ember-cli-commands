const fetch = require("node-fetch");
const normalizeVersion = require('./normalize-version');
const foo = 'https://raw.githubusercontent.com/ember-cli/ember-new-output/';

module.exports = function fetchDeps(ours, theirVersion) {
  return new Promise((resolve) => {
    const ourVersion = `v${this.project.emberCLIVersion()}`;
    const sourcePath = `https://raw.githubusercontent.com/ember-cli/ember-new-output/${normalizeVersion(ourVersion)}/package.json`;
    const theirsPath = `https://raw.githubusercontent.com/ember-cli/ember-new-output/${normalizeVersion(theirVersion)}/package.json`;
    Promise.all([
        fetchPackageContents(sourcePath),
        fetchPackageContents(theirsPath)
      ])
      .then(([source, theirs]) => {
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
}

function fetchPackageContents(path) {
  return fetch(path)
    .then((res) => {
      if (res.ok) {
        return res.json();
      }

      throw new Error(`${res.url} - ${res.statusText}`);
    })
    .catch((err) => {
      console.log(err);
    });;
}
