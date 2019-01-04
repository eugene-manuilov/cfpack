const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const Task = require('../Task');

class BuildTask extends Task {

	run() {
		this.log('Build template file...');

		this.info(`├─ Looking for templates in the ${this.options.folder} folder...`);
		this.findTemplates();
		if (this.outputArtifacts.files.length === 0) {
			return;
		}

		this.info(`├─ Processing found templates...`);
		this.processTemplates();

		this.info(`└─ Building final template...`);
	}

	findTemplates() {
		const files = this.walkTemplates(this.options.folder, []);
		if (files.length > 0) {
			this.info(`├─ Found ${files.length} template(s)...`);
		} else {
			this.info('└─ Found no templates in the folder...');
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

			console.log(doc);

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
		try {
			const content = fs.readFileSync(file, 'utf8');
			const doc = yaml.safeLoad(content);

			this.info(`├─ Processed ${file} template...`);

			return doc;
		} catch (e) {
			const error = e.toString().split('\n').join('\n│  ');
			this.info(`├─ Error processing ${file} template: ${error}`);
		}

		return false;
	}

}

module.exports = BuildTask;
