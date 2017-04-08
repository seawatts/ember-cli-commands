/* eslint-env node */
'use strict';
const commands = require('./lib/commands');

module.exports = {
  name: 'ember-cli-commands',
  includedCommands() {
    return commands;
  },
};
