import { magenta } from 'chalk';
import { AWSError } from 'aws-sdk';
import {
	DescribeStacksInput,
	DescribeStacksOutput,
	StackId,
	DeleteStackInput
} from 'aws-sdk/clients/cloudformation';

import { ApiTask } from '../api-task';

export class DeleteTask extends ApiTask {

	private stackId?: StackId;

	public run( next: Function ): void {
		if ( this.log ) {
			this.log.message( 'Deleting stack...' );
		}

		const { stack } = this.options || {};
		const { name: stackName, region } = stack || {};
		this.cloudformation.config.region = region || 'us-east-1';

		if ( this.log ) {
			this.log.info( `├─ Checking whether ${ stackName } stack exists...` );
		}

		const params: DescribeStacksInput = { StackName: stackName };
		this.cloudformation.describeStacks( params, ( err: AWSError, data: DescribeStacksOutput ) => {
			if ( err ) {
				if ( this.log ) {
					this.log.error( `└─ ${ err.code }: ${ err.message }` );
				}
				next();
			} else {
				this.stackId = data && Array.isArray( data.Stacks ) && data.Stacks.length > 0
					? data.Stacks[0].StackId
					: undefined;
				this.deleteStack( next );
			}
		} );
	}

	public deleteStack( next: Function ): void {
		const { stack } = this.options || {};
		const { name: stackName } = stack || {};

		const params: DeleteStackInput = {
			StackName: stackName || '',
			ClientRequestToken: this.taskUUID,
		};

		this.cloudformation.deleteStack( params, ( err: AWSError, data: {} ) => {
			if ( err ) {
				if ( this.log ) {
					this.log.error( `${ err.code }: ${ err.message }` );
				}
			} else {
				if ( this.log ) {
					const { ResponseMetadata } = data as { [x: string]: { [y: string]: string } };
					this.log.info( '├─ Stack is deleting...' );
					this.log.info( `└─ RequestId: ${ magenta( ResponseMetadata.RequestId ) }\n` );
				}

				this.startPollingEvents( this.stackId );
				this.cloudformation.waitFor( 'stackDeleteComplete', { StackName: this.stackId }, () => {
					this.stopPollingEvents();
					if ( this.log ) {
						this.log.message( 'Stack has been deleted.' );
					}
					next();
				} );
			}
		} );
	}

}
