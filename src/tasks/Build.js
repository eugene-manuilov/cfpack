const os = require('os');
const fs = require('fs');
const path = require('path');

const AWS = require('aws-sdk');
const yaml = require('js-yaml');
const chalk = require('chalk');

const Task = require('../Task');
const intrinsicFunctions = require('../utils/intrinsic-functions-schema');

class BuildTask extends Task {

	constructor() {
		super();
		this.lastError = false;
	}

	run(next) {
		this.log.message('Build template file...');

		this.log.info(`├─ Looking for templates in the ${this.options.entry} folder...`);
		this.findTemplates();
		if (this.output.files.length === 0) {
			return;
		}

		this.log.info('├─ Processing found templates...');
		this.processTemplates();

		this.log.info('├─ Validating final template...');
		this.validateFinalTemplate(() => {
			this.saveFinalTemplate();
			this.log.info(`└─ Final template: ${chalk.magenta(this.output.templateFile)}\n`);
			next(this.output);
		});
	}

	findTemplates() {
		const { entry } = this.options;
		const entryPath = path.isAbsolute(entry)
			? entry
			: path.resolve(process.cwd(), entry);

		if (!fs.existsSync(entryPath)) {
			this.log.error('The entry folder is not found.');
		}

		const files = this.walkTemplates(entryPath, []);
		if (files.length > 0) {
			this.log.info(`├─ Found ${files.length} template(s)...`);
		} else {
			this.log.info('└─ Found no templates in the folder...');
		}

		this.output.files = files;
	}

	walkTemplates(dir, list) {
		let newlist = [...list];

		fs.readdirSync(dir).forEach((file) => {
			const filename = path.join(dir, file);
			if (fs.statSync(filename).isDirectory()) {
				newlist = [...newlist, ...this.walkTemplates(filename, list)];
			} else {
				newlist.push(filename);
			}
		});

		return newlist;
	}

	processTemplates() {
		const template = {};

		this.output.files.forEach((file) => {
			this.lastError = false;

			const doc = this.processTemplate(file);
			if (!doc) {
				const error = this.lastError.toString().split('\n').join('\n│  ');
				this.log.info(`├─ Error processing ${file} template: ${error}`);
				return;
			}

			this.log.info(`├─ Processed ${file} template...`);

			Object.keys(doc).forEach((group) => {
				if (typeof doc[group] === 'object') {
					if (doc[group].constructor.name === 'Date') {
						const [dateString] = doc[group].toISOString().split('T');
						template[group] = dateString;
					} else {
						if (!template[group]) {
							template[group] = {};
						}

						Object.keys(doc[group]).forEach((key) => {
							template[group][key] = doc[group][key];
						});
					}
				} else {
					template[group] = doc[group];
				}
			});
		});

		this.output.template = template;
	}

	processTemplate(file) {
		const content = fs.readFileSync(file, 'utf8');

		try {
			return content.trim(0).charAt(0) === '{'
				? JSON.parse(content)
				: yaml.safeLoad(content, { schema: intrinsicFunctions });
		} catch (e) {
			this.lastError = e;
		}

		return false;
	}

	validateFinalTemplate(callback) {
		const { stack } = this.options;
		const cloudformation = new AWS.CloudFormation({
			apiVersion: '2010-05-15',
			region: stack.region,
		});

		cloudformation.validateTemplate({ TemplateBody: JSON.stringify(this.output.template, '', 4) }, (err) => {
			if (err) {
				this.log.error(`├─ ${err.message}`, false);
				this.log.error(`└─ RequestId: ${chalk.magenta(err.requestId)}`, false);
				this.log.stop();
				process.exit(1);
			} else {
				callback();
			}
		});
	}

	saveFinalTemplate() {
		let filename = this.options.output;
		if (!filename) {
			const prefix = path.join(os.tmpdir(), 'cfpack-');
			const folder = fs.mkdtempSync(prefix);
			filename = path.join(folder, 'template.json');
		}

		filename = path.isAbsolute(filename)
			? filename
			: path.resolve(process.cwd(), filename);

		const data = JSON.stringify(this.output.template, '', 4);
		fs.writeFileSync(filename, data, { encoding: 'utf8' });
		this.output.templateFile = filename;
	}

}

module.exports = BuildTask;
