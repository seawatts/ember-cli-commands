const getTags = require('./get-ember-cli-tags')

module.exports = function promptVersion() {
  return getTags()
    .then((tags) => {
      return this.ui.prompt({
        type: 'list',
        name: 'answer',
        message: 'Select ember-cli version to upgrade to',
        choices: tags,
      });
    }).then(({
      answer
    }) => answer);
}
