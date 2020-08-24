import { isAbsolute, join, dirname } from 'path';
import { statSync, createReadStream } from 'fs';
import { PassThrough } from 'stream';

import { S3 } from 'aws-sdk';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import { bold } from 'chalk';
import { create } from 'archiver';
import * as glob from 'glob';

import { Task } from '../task';
import { Artifacts, Artifact, ArtifactFile } from '../types';

export class ArtifactsTask extends Task {

	private s3?: S3;

	private list?: Artifacts;

	public run( next: Function ): void {
		const { stack } = this.options || {};
		const { region, artifacts } = stack || {};
		if ( !artifacts ) {
			next( this.input );
			return;
		}

		this.s3 = new S3( {
			apiVersion: '2006-03-01',
			region,
		} );

		this.list = ( Array.isArray( artifacts ) ? artifacts : [ artifacts ] ).reverse();

		const promise = this.runNextArtifacts();
		if ( promise instanceof Promise ) {
			promise
				.then( () => {
					if ( this.log ) {
						this.log.info( '' );
					}

					next( this.input );
				} )
				.catch( ( err ) => {
					if ( this.log ) {
						this.log.error( err );
					}
				} );
		} else {
			next( this.input );
		}
	}

	public runNextArtifacts(): Promise<void> | null {
		if ( Array.isArray( this.list ) && this.list.length > 0 ) {
			const item = this.list.pop();
			if ( item ) {
				const promise = this.processArtifacts( item );

				promise.then( this.runNextArtifacts.bind( this ) );

				return promise;
			}
		}

		return null;
	}

	public processArtifacts( artifact: Artifact ): Promise<void> {
		const { bucket, files } = artifact;
		if ( !bucket ) {
			if ( this.log ) {
				this.log.warning( 'S3 bucket is not defined, skipping artifacts uploading...' );
			}

			return Promise.resolve();
		}

		const keys = Object.keys( files );
		if ( !keys.length ) {
			if ( this.log ) {
				this.log.warning( `No files are defined for ${ bold( bucket ) } bucket, skipping...` );
			}

			return Promise.resolve();
		}

		if ( this.log ) {
			this.log.message( `Uploading artifacts to ${ bold( bucket ) } bucket...` );
		}

		return new Promise( ( resolve, reject ) => {
			const promises = [];
			for ( let i = 0, len = keys.length; i < len; i++ ) {
				const artifactFile: ArtifactFile = typeof files[keys[i]] === 'string'
					? {
						baseDir: '.',
						compression: 'none',
						path: files[keys[i]],
					} as ArtifactFile
					: files[keys[i]] as ArtifactFile;

				const promise = this.processArtifact( bucket, keys[i], artifactFile );

				promises.push( promise );
			}

			Promise.all( promises )
				.then( () => {
					if ( this.log ) {
						this.log.info( '└─ Artifacts are uploaded...' );
					}

					resolve();
				} )
				.catch( reject );
		} );
	}

	public processArtifact( bucket: string, location: string, args: ArtifactFile ): Promise<void> {
		const { config = '' } = this.options || {};

		let baseDir: string = args.baseDir || '.';
		if ( !isAbsolute( baseDir ) ) {
			baseDir = join( dirname( config ), baseDir );
		}

		let filepath = args.path || '';
		if ( !filepath ) {
			return Promise.resolve();
		}

		if ( baseDir ) {
			filepath = join( baseDir, filepath );
		}

		return new Promise( ( resolve ) => {
			glob( filepath, { absolute: true, stat: true }, ( err, files ) => {
				if ( err ) {
					if ( this.log ) {
						this.log.error( err.toString() );
					}
				} else if ( args.compression === 'zip' ) {
					this.compressAndUploadFiles( bucket, location, baseDir, files )
						.then( () => resolve() )
						.catch( () => resolve() );
				} else {
					this.uploadFiles( bucket, location, baseDir, files )
						.then( resolve )
						.catch( resolve );
				}
			} );
		} );
	}

	public async compressAndUploadFiles( bucket: string, location: string, baseDir: string, files: string[] ): Promise<void> {
		const passThroughStream = new PassThrough();
		const archive = create( 'zip', {
			zlib: {
				level: 9,
			},
		} );

		archive.pipe( passThroughStream );

		files.forEach( ( file ) => {
			if ( !statSync( file ).isDirectory() ) {
				archive.file( file, { name: file.substring( baseDir.length ) } );
			}
		} );

		await archive.finalize();

		return new Promise( ( resolve ) => {
			const params: PutObjectRequest = {
				Bucket: bucket,
				Key: location,
				Body: passThroughStream,
				ContentType: 'application/zip',
			};

			if ( this.s3 ) {
				this.s3.upload( params, ( putError ) => {
					if ( this.log ) {
						if ( putError ) {
							this.log.warning( `├─ ${ putError }` );
						} else {
							this.log.info( `├─ Uploaded files to ${ bold( `s3://${ bucket }/${ location }` ) }` );
						}
					}

					resolve();
				} );
			}
		} );
	}

	public uploadFiles( bucket: string, location: string, baseDir: string, files: string[] ): Promise<void> {
		const filesMap: { name: string, path: string }[] = [];

		files.forEach( ( file ) => {
			if ( !statSync( file ).isDirectory() ) {
				filesMap.push( {
					name: join( location, file.substring( baseDir.length ) ),
					path: file,
				} );
			}
		} );

		if ( !filesMap.length ) {
			return Promise.resolve();
		}

		const promises = [];
		for ( let i = 0, len = filesMap.length; i < len; i++ ) {
			const params: PutObjectRequest = {
				Bucket: bucket,
				Key: filesMap[i].name,
				Body: createReadStream( filesMap[i].path ),
			};

			if ( this.s3 ) {
				promises.push( this.s3.putObject( params ).promise() );
			}
		}

		return Promise.all( promises )
			.then( () => {
				const uri = bold( `s3://${ bucket }/${ location }` );
				if ( this.log ) {
					this.log.info( `├─ Uploaded files to ${ uri }` );
				}
			} )
			.catch( ( err ) => {
				if ( this.log ) {
					this.log.error( err );
				}
			} );
	}

}
