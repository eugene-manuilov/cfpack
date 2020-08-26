import { ArtifactFile } from './artifact-file.type';

export type Artifact = {
	bucket: string,
	files: {
		[x: string]: string | ArtifactFile,
	},
};
