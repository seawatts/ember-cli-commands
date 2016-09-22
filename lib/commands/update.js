const { exec } = require('child_process');

module.exports = {
  name: 'update',
  description: 'Updates ember-cli to a specific revision',
  works: 'insideProject',

  availableOptions: [
    {
      name: 'revision',
      type: String,
      required: true
    },
    {
      name: 'verbose',
      type: Boolean
    },
    {
      name: 'log-info-color',
      type: String,
      description: '(Default: "blue")'
    },
    {
      name: 'log-error-color',
      type: String,
      description: '(Default: "red")'
    }
  ],

  anonymousOptions: [
    '<deployTarget>'
  ],

  run(commandOptions, rawArgs) {
    // commandOptions.deployTarget = rawArgs.shift();
    let version = 'v2.8.0' || 'latest';

    return Promise.all([
      execPromisified('npm uninstall -g ember-cli'),
      execPromisified('npm cache clean'),
      execPromisified('bower cache clean'),
      execPromisified('rm -rf node_modules bower_components dist tmp'),
    ]).then(() => {
      return Promise.all([
        execPromisified(`npm install -g ember-cli@${version}`),
        execPromisified(`npm install --save-dev ember-cli@${version}`),
        execPromisified('bower install'),
      ]).then(() => {
        return Promise.all([
          execPromisified('npm install'),
        ]).then(() => execPromisified('ember init'));
      });
    });
  }
};

function execPromisified(command) {
  return new Promise((resolve, reject) => {
    exec(command, (err) => {
      if (err) {
        return reject(new Error(`Could not complete '${command}' -- ${err}`));
      }

      resolve();
    });
  });
}
