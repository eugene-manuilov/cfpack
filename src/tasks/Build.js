const os = require('os');
const fs = require('fs');
const path = require('path');

const yaml = require('js-yaml');

const Task = require('../Task');
const intrinsicFunctions = require('../utils/intrinsic-functions-schema');

class BuildTask extends Task {

	run() {
		this.log.message('Build template file...');

		this.log.info(`├─ Looking for templates in the ${this.options.entry} folder...`);
		this.findTemplates();
		if (this.outputArtifacts.files.length === 0) {
			return;
		}

		this.log.info(`├─ Processing found templates...`);
		this.processTemplates();

		this.log.info(`└─ Building final template...`);
		this.saveFinalTemplate();

		this.log.message(`Template has been created and saved as ${this.outputArtifacts.templateFile}`);
		this.info('');
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

		this.outputArtifacts.files = files;
	}

	walkTemplates(dir, list) {
		fs.readdirSync(dir).forEach((file) => {
			const filename = path.join(dir, file);
			if (fs.statSync(filename).isDirectory()) {
				list = this.walkTemplates(filename, list);
			} else {
				list.push(filename);
			}
		});

		return list;
	}

	processTemplates() {
		const template = {};

		this.outputArtifacts.files.forEach((file) => {
			const doc = this.processTemplate(file);
			if (!doc) {
				return;
			}

			Object.keys(doc).forEach((group) => {
				if (typeof doc[group] === 'object') {
					if (doc[group].constructor.name === 'Date') {
						template[group] = doc[group].toISOString().split('T')[0];
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

		this.outputArtifacts.template = template;
	}

	processTemplate(file) {
		const content = fs.readFileSync(file, 'utf8');

		try {
			const doc = JSON.parse(content);
			return doc;
		} catch(e) {
			// do nothing
		}

		try {
			const doc = yaml.safeLoad(content, { schema: intrinsicFunctions });

			this.log.info(`├─ Processed ${file} template...`);

			return doc;
		} catch (e) {
			const error = e.toString().split('\n').join('\n│  ');
			this.log.info(`├─ Error processing ${file} template: ${error}`);
		}

		return false;
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

		const data = JSON.stringify(this.outputArtifacts.template, '', 4);
		fs.writeFileSync(filename, data, { encoding: 'utf8' });
		this.outputArtifacts.templateFile = filename;
	}

}

module.exports = BuildTask;
