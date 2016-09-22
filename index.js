/* jshint node: true */
'use strict';
const commands = require('./lib/commands');

module.exports = {
  name: 'ember-cli-commands',
  isDevelopingAddon() {
    return true;
  },
  includedCommands() {
    return commands;
  },
};
