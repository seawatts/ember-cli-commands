const getTags = require('./get-ember-cli-tags')

module.exports = function promptVersion() {
  return getTags()
    .then((tags) => {
      return this.ui.prompt({
        type: 'list',
        name: 'answer',
        message: 'Select ember-cli version to upgrade to',
        choices: ['alpha', 'beta', 'latest', ...tags],
      });
    }).then(({
      answer
    }) => answer);
}
