const fetchEmberNewOutput = require('./fetch-ember-new-output');

module.exports = function fetchAllDependencies(ours, theirVersion) {
  return new Promise((resolve) => {
    const ourVersion = `v${this.project.emberCLIVersion()}`;

    Promise.all([
        fetchEmberNewOutput(ourVersion),
        fetchEmberNewOutput(theirVersion)
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
