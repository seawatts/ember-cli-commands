const {
  spawnSync
} = require('child_process');
const ora = require('ora');

module.exports = function childProcess(command) {
  return new Promise((resolve, reject) => {
    if (dryRun) {
      this.ui.writeLine(command);
      return resolve();
    }

    const spinner = ora(command).start();
    let [splitCommand, ...args] = command.split(' ');

    const {
      err,
      stdout,
      stderr
    } = spawnSync(splitCommand, args, {
      stdio: 'inherit'
    });

    if (err) {
      if (verbose) {
        this.ui.writeError(stderr);
      }

      spinner.fail();
      return reject(new Error(`Could not complete '${command}' -- ${err}`));
    }

    if (verbose) {
      this.ui.writeLine(stdout);
    }

    spinner.succeed();
    resolve();
  });
}
