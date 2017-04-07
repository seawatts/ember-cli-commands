# ember-cli-commands

[![Build Status](https://travis-ci.org/seawatts/ember-cli-commands.svg?branch=master)](https://travis-ci.org/seawatts/ember-cli-commands)
[![Ember Observer Score](https://emberobserver.com/badges/ember-cli-commands.svg)](https://emberobserver.com/addons/ember-cli-commands)
[![npm version](https://badge.fury.io/js/ember-cli-commands.svg)](https://badge.fury.io/js/ember-cli-commands)

Are you ever tired of typing the same ember-cli update commands posted in the ember-cli releases page?

This ember addon is aimed to solve mundane tasks in ember-cli.

## Installation

`ember install ember-cli-commands`

or

`yarn add -D ember-cli-commands`

or

`npm install --save-dev ember-cli-commands`

## Usage

### Commands

`upgrade`
--------

> Upgrades your ember-cli version globally and locally and runs all the commands specified in the ember-cli [upgrade documentation](https://ember-cli.com/user-guide/#upgrading)

* Works: `everywhere`

**Parameters**

* `--target | -t` (String) (Default: `latest`)
> The version to update ember-cli to.

* `--interactive | -i` (Boolean) (Default: `false`)
> Allow the user to interactivily upgrade the dependencies. Useful if you don't want to accept the defaults for merging.

* `--use-yarn | -y` (Boolean) (Default: `false`)
> Use yarn to run the install command instead of npm.

* `--skip-local` (Boolean) (Default: `false`)
> Prevent upgrading ember-cli inside an ember project

* `--skip-global` (Boolean) (Default: `false`)
> Prevent upgrading ember-cli outside an ember project.

* `--dry-run | -d` (Boolean) (Default: `false`)
> Only output the commands that will be run.

* `--verbose | -v` (Boolean) (Default: `false`)
> Show extra output. Useful for debugging.

`upgrade:deps`
--------

> Upgrades dependencies inside your ember project.

* Works: `insideProject`

**Parameters**

* `--target | -t` (String) (Default: `latest`)
> The version to update ember-cli to.

* `--local-version | -l` (String) (Default: `null`)
> The version to update ember-cli to.

* `--interactive | -i` (Boolean) (Default: `false`)
> Allow the user to interactivily upgrade the dependencies. Useful if you don't want to accept the defaults for merging.

* `--use-yarn | -y` (Boolean) (Default: `false`)
> Use yarn to run the install command instead of npm.

* `--skip-install` (Boolean) (Default: `false`)
> Prevent upgrading ember-cli inside an ember project

* `--dry-run | -d` (Boolean) (Default: `false`)
> Only output the commands that will be run.

* `--verbose | -v` (Boolean) (Default: `false`)
> Show extra output. Useful for debugging.

## Cloning

* `git clone <repository-url>` this repository
* `cd ember-cli-commands`
* `npm install`
* `bower install`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).
