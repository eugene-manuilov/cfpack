# Changelog

## [Unreleased] - TBD

-

## [v1.5.2] - 2021-10-26

- Updated dependencies to the latest versions.
- Added the ability to skip template validation.

## [v1.5.1] - 2020-11-20

- Updated aws-sdk dependency to the latest version.
- Added a workaround for big templates validation which tries not to use JSON formatting when template takes more than 51200 bytes.

## [v1.5.0] - 2020-11-14

- Updated builder to sort templates before merging it.
- Updated dependencies to the latest versions.
- Added version update check.

## [v1.4.2] - 2020-09-17

- Updated dependencies to the latest versions.
- Fixed issues with !Sub function.

## [v1.4.1] - 2020-09-05

- Updated dependencies to the latest versions.
- Updated package.json to keep eslint and jest configs in separate files.
- Fixed issues that happened when commands were run outside of a folder with cfpack.config.js file.

## [v1.4.0] - 2020-06-19

- Updated dependencies to the latest versions.
- Updated deploy task to exit with 0 code if there are no updates to perform.

## [v1.3.0] - 2019-07-19

- Updated dependencies to fix vulnerability issues found in dependant packages.
- Updated build command to validate the final template.
- Added condition functions to the yaml parser schema.
- Added bash/zsh-completion shortcuts for commands.
- Added unit tests to check that build task properly parses yml files.
- Fixed bug that didn't allow to keep templates in multiple folders.

## [v1.2.1] - 2019-06-14

- Updated dependencies to fix vulnerability issues found in dependant packages.

## [v1.2.0] - 2019-01-26

- Added `artifacts` command to upload files to a s3 bucket.
- Added spinner to the terminal output to indicate process.
- Added eslint config to standardise code base.
- Reworked tasks runner to use middlewares instead of array of tasks.
- Updated init command to use existing values if config file is already created.

## [v1.1.0] - 2019-01-13

- Updated **deploy** command to display stack events and wait till the update process ends.
- Updated **delete** command to display stack events and wait till the delete process ends.

## [v1.0.0] - 2019-01-12

The initial release that contains four commands to create init file, build templates, deploy templates and delete current stack.

[Unreleased]: https://github.com/eugene-manuilov/cfpack/compare/v1.5.2...master
[v1.5.2]: https://github.com/eugene-manuilov/cfpack/compare/v1.5.1...v1.5.2
[v1.5.1]: https://github.com/eugene-manuilov/cfpack/compare/v1.5.0...v1.5.1
[v1.5.0]: https://github.com/eugene-manuilov/cfpack/compare/v1.4.2...v1.5.0
[v1.4.2]: https://github.com/eugene-manuilov/cfpack/compare/v1.4.1...v1.4.2
[v1.4.1]: https://github.com/eugene-manuilov/cfpack/compare/v1.4.0...v1.4.1
[v1.4.0]: https://github.com/eugene-manuilov/cfpack/compare/v1.3.0...v1.4.0
[v1.3.0]: https://github.com/eugene-manuilov/cfpack/compare/v1.2.1...v1.3.0
[v1.2.1]: https://github.com/eugene-manuilov/cfpack/compare/v1.2.0...v1.2.1
[v1.2.0]: https://github.com/eugene-manuilov/cfpack/compare/v1.1.0...v1.2.0
[v1.1.0]: https://github.com/eugene-manuilov/cfpack/compare/v1.0.0...v1.1.0
[v1.0.0]: https://github.com/eugene-manuilov/cfpack/releases/tag/v1.0.0
