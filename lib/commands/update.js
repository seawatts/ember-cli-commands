const { exec } = require('child_process');
const ora = require('ora');

module.exports = {
  name: 'update',
  description: 'Updates ember-cli to a specific version',
  works: 'insideProject',

  availableOptions: [
    {
      name: 'verbose',
      type: Boolean,
      default: false,
      aliases: ['v']
    }
  ],

  anonymousOptions: [
    '<version>'
  ],

  run(commandArgs) {
    let {
      verbose,
      version
    } = commandArgs;

    if (version === undefined) {
      version = 'latest';
    }

    function execPromisified(command) {
      return new Promise((resolve, reject) => {
        const spinner = ora(command).start();
        exec(command, (err, stdout, stderr) => {
          if (err) {
            if (verbose) {
              console.error(stderr);
            }

            spinner.fail();
            return reject(new Error(`Could not complete '${command}' -- ${err}`));
          }

          if (verbose) {
            console.log(stdout);
          }

          spinner.succeed();
          resolve();
        });
      });
    }

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


