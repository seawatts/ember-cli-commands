module.exports = function promptMerge(merge, ourPkg) {
  const promises = [];
  Object.keys(merge).forEach((dependencyKey) => {
    const dependencies = merge[dependencyKey];

    Object.keys(dependencies).forEach((mergeKey) => {
      let promise = promptCheckbox.call(this, mergeKey, dependencies[mergeKey], ourPkg[dependencyKey])
        .then((deps) => dependencies[mergeKey] = deps);

      promises.push(promise);
    });
  });

  return Promise.all(promises);
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
