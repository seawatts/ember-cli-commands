const sortObjectKeys = require('../utils/sort-object-keys');

module.exports = function performThreeWayMerger(merge, ourPkg) {
  Object.keys(merge).forEach((key) => {
    const dependencies = merge[key];
    updateLocalDependencies(dependencies, ourPkg[key]);
  });
}

function updateLocalDependencies(mergeDependencies, ourDependencies = {}) {
  let result = Object.assign({}, ourDependencies);
  mergeDependencies.add.map((dep) => result[dep.name] = dep.version);
  mergeDependencies.remove.map((dep) => delete result[dep.name]);
  mergeDependencies.change.map((dep) => result[dep.name] = dep.version);
  result = sortObjectKeys(result);
  Object.assign(ourDependencies, result);
}
