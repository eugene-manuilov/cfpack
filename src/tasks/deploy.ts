import { magenta } from 'chalk';
import { CloudFormation, AWSError } from 'aws-sdk';
import {
	CreateStackInput,
	CreateStackOutput,
	UpdateStackInput,
	UpdateStackOutput
} from 'aws-sdk/clients/cloudformation';

import { ApiTask } from '../api-task';

export class DeployTask extends ApiTask {

	public run( next: Function ): void {
		if ( this.log ) {
			this.log.message( 'Deploying template file...' );
		}

		const { stack } = this.options || {};
		const {
			name: StackName = '',
			region = 'us-east-1',
		} = stack || {};

		this.cloudformation = new CloudFormation( {
			apiVersion: '2010-05-15',
			region,
		} );

		if ( this.log ) {
			this.log.info( `├─ Checking whether ${ StackName } stack exists...` );
		}

		this.cloudformation.describeStacks( { StackName }, ( err ) => {
			if ( err ) {
				this.createStack( next );
			} else {
				this.updateStack( next );
			}
		} );
	}

	public createStack( next: Function ): void {
		const { stack } = this.options || {};
		const {
			name: StackName = '',
			params: stackParams = {},
		} = stack || {};

		const params: CreateStackInput = {
			...stackParams,
			StackName,
			TemplateBody: this.input && this.input.template ? JSON.stringify( this.input.template ) : '',
			ClientRequestToken: this.taskUUID,
		};

		if ( this.log ) {
			this.log.info( '└─ Stack doesn\'t exist. Creating a new one...\n' );
		}

		const callback = this.getStackRequestCallback<CreateStackOutput>( 'Stack is creating...', () => {
			this.cloudformation.waitFor( 'stackCreateComplete', { StackName }, () => {
				this.stopPollingEvents();

				if ( this.log ) {
					this.log.message( 'Stack has been created.' );
				}

				next();
			} );
		} );

		this.cloudformation.createStack( params, callback );
	}

	public updateStack( next: Function ): void {
		const { stack } = this.options || {};
		const {
			name: StackName = '',
			params: stackParams = {},
		} = stack || {};

		const params: UpdateStackInput = {
			...stackParams,
			StackName,
			TemplateBody: this.input && this.input.template ? JSON.stringify( this.input.template ) : '',
			ClientRequestToken: this.taskUUID,
		};

		if ( this.log ) {
			this.log.info( '└─ Stack exists, updating...\n' );
		}

		const callback = this.getStackRequestCallback<UpdateStackOutput>( 'Stack is updating...', () => {
			this.cloudformation.waitFor( 'stackUpdateComplete', { StackName }, () => {
				this.stopPollingEvents();

				if ( this.log ) {
					this.log.message( 'Stack has been updated.' );
				}

				next();
			} );
		} );

		this.cloudformation.updateStack( params, callback );
	}

	public getStackRequestCallback<T extends CreateStackOutput | UpdateStackOutput>( message: string, callback: Function ): ( err: AWSError, data: T ) => void {
		return ( err: AWSError, data: T ) => {
			if ( err ) {
				if ( this.log ) {
					this.log.error( `${ err.code }: ${ err.message }`, false );
					this.log.info( `└─ RequestId: ${ magenta( err.requestId ) }` );
					this.log.stop();
				}
				process.exit( err.code === 'ValidationError' ? 0 : 1 );
			} else {
				if ( this.log ) {
					this.log.message( message );
					// @ts-ignore
					this.log.info( `├─ RequestId: ${ magenta( data.ResponseMetadata.RequestId ) }` );
					this.log.info( `└─ StackId: ${ magenta( data.StackId ) }\n` );
				}

				this.startPollingEvents();
				callback();
			}
		};
	}

}
