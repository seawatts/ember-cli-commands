const chalk = require('chalk');
const getTags = require('../utils/get-ember-cli-tags')
const {
  compare
} = require('semver');

module.exports = {
  name: 'versions',
  description: 'Show all versions of ember-cli',
  works: 'everywhere',
  availableOptions: [{
    name: 'verbose',
    type: Boolean,
    default: false,
    aliases: ['v'],
    description: 'Show extra output. Useful for debugging.',
  }, ],

  run() {
    const {
      ui,
      project: {
        emberCLIVersion,
      },
    } = this;
    const localCliVersion = emberCLIVersion();

    return getTags().then((tags) => {
      const sortedTags = tags.sort(compare);
      sortedTags.map((tag) => {
        if (tag === localCliVersion) {
          ui.writeLine(chalk.green(`-> ${tag} (local version)`));
        } else {
          ui.writeLine(tag);
        }
      });
    });
  },
};
