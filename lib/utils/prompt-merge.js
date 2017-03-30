module.exports = function promptMerge(merge, ourPkg) {
  let promise = Promise.resolve();
  for (let [dependencyKey, dependencies] of Object.entries(merge)) {
    for (let [mergeKey, dependency] of Object.entries(dependencies)) {
      promise = promise
        .then(() => promptCheckbox.call(this, mergeKey, dependencies[mergeKey], ourPkg[dependencyKey])
          .then((deps) => dependencies[mergeKey] = deps));
    }
  }

  return promise;
}

function promptCheckbox(mergeType, dependencies, ourPkg) {
  if (dependencies.length === 0) {
    return Promise.resolve([]);
  }

  return this.ui.prompt({
      type: 'checkbox',
      name: 'checked',
      message: `Select packages you would like to ${mergeType}`,
      choices: dependencies.map((dependency) => {
        let name = `${dependency.name} = ${dependency.version}`

        switch (mergeType) {
          case 'change':
            name = `${dependency.name} ${ourPkg[dependency.name]} => ${dependency.version}`
            break;
          case 'remove':
            name = dependency.name;
            break;
        }

        return {
          value: dependency,
          name,
        };
      })
    })
    .then(({
      checked
    }) => checked);
}
