# Change Log

## v2.0.0 (TBD)

- Replaced yargs with oclif framework.
- Reworked everything to use Typescript.
- Added jest tests to test different pieces of the core.
- Added check for updates to inform when a new release is out.
- Enhanced `init` command to ask more questions and to create a better config file.
- Breaking: Updated supported version of Node to be 12+.

## v1.4.1 (2020-09-05)

- Updated dependencies to the latest versions.
- Updated package.json to keep eslint and jest configs in separate files.
- Fixed issues that happened when commands were run outside of a folder with cfpack.config.js file.

## v1.4.0 (2020-06-19)

- Updated dependencies to the latest versions.
- Updated deploy task to exit with 0 code if there are no updates to perform.

## v1.3.0 (2019-07-19)

- Updated dependencies to fix vulnerability issues found in dependant packages.
- Updated build command to validate the final template.
- Added condition functions to the yaml parser schema.
- Added bash/zsh-completion shortcuts for commands.
- Added unit tests to check that build task properly parses yml files.
- Fixed bug that didn't allow to keep templates in multiple folders.

## v1.2.1 (2019-06-14)

- Updated dependencies to fix vulnerability issues found in dependant packages.

## v1.2.0 (2019-01-26)

- Added `artifacts` command to upload files to a s3 bucket.
- Added spinner to the terminal output to indicate process.
- Added eslint config to standardise code base.
- Reworked tasks runner to use middlewares instead of array of tasks.
- Updated init command to use existing values if config file is already created.

## v1.1.0 (2019-01-13)

- Updated **deploy** command to display stack events and wait till the update process ends.
- Updated **delete** command to display stack events and wait till the delete process ends.

## v1.0.0 (2019-01-12)

The initial release that contains four commands to create init file, build templates, deploy templates and delete current stack.
