const semver = require('semver')

module.exports = function normalizeVersion(version) {
  if (version) {
    if (semver.valid(version) && version[0] !== 'v') {
      return `v${version}`;
    }
  }

  return version;
}
