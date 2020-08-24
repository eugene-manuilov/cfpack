import { green, red, gray, white } from 'chalk';
import { CloudFormation, AWSError } from 'aws-sdk';
import {
	StackEvent,
	DescribeStackEventsInput,
	DescribeStackEventsOutput,
	Timestamp,
	StackId
} from 'aws-sdk/clients/cloudformation';

import { Task } from './task';

export abstract class ApiTask extends Task {

	protected cloudformation: CloudFormation = new CloudFormation( { apiVersion: '2010-05-15' } );

	private events: { [x: string]: boolean } = {};

	private resourceMaxLength?: number;

	private pollParams?: DescribeStackEventsInput;

	private pollInterval?: ReturnType<typeof setInterval>;

	public static getTime( timestamp: Timestamp ): string {
		const date = new Date( timestamp );

		const hour = date.getHours().toString().padStart( 2, '0' );
		const min = date.getMinutes().toString().padStart( 2, '0' );
		const sec = date.getSeconds().toString().padStart( 2, '0' );

		return `${ hour }:${ min }:${ sec }`;
	}

	public startPollingEvents( stackId?: StackId ): void {
		const { stack } = this.options || {};
		const { name } = stack || {};

		this.events = {};

		this.pollParams = { StackName: stackId || name };
		this.pollInterval = setInterval( this.pollStackEvents.bind( this ), 2500 );

		if ( this.log ) {
			this.log.info( white.bold( 'Event Logs:' ) );
		}
	}

	public stopPollingEvents(): void {
		if ( this.pollInterval ) {
			clearInterval( this.pollInterval );
		}

		if ( this.log ) {
			this.log.info( '' );
		}
	}

	public pollStackEvents(): void {
		this.cloudformation.describeStackEvents( this.pollParams || {}, ( err: AWSError, data: DescribeStackEventsOutput ) => {
			if ( !err && data.StackEvents ) {
				data.StackEvents.reverse().forEach( this.displayEvent.bind( this ) );
			}
		} );
	}

	private getResourceMaxLength(): number {
		if ( !this.resourceMaxLength ) {
			const { stack } = this.options || {};
			const { name: stackName } = stack || {};

			const { template } = this.input || {};
			const { Resources } = template || {};

			this.resourceMaxLength = Math.max(
				35, // not less than 35 characters
				stackName ? stackName.length : 0,
				...Object.keys( Resources || [] ).map( ( item ) => item.length )
			);
		}

		return this.resourceMaxLength;
	}

	public displayEvent( event: StackEvent ): void {
		const {
			EventId,
			ClientRequestToken,
			Timestamp,
			LogicalResourceId,
			ResourceStatus,
			ResourceStatusReason,
		} = event;

		if ( ClientRequestToken === this.taskUUID && !this.events[EventId] ) {
			this.events[EventId] = true;

			let resource = ( LogicalResourceId || '' ).padEnd( this.getResourceMaxLength(), ' ' );
			let status = ( ResourceStatus || '' ).padEnd( 45, ' ' 	);

			switch ( ResourceStatus ) {
				case 'CREATE_COMPLETE':
				case 'UPDATE_COMPLETE':
				case 'DELETE_COMPLETE':
				case 'UPDATE_ROLLBACK_COMPLETE':
					status = green.bold( status );
					resource = green.bold( resource );
					break;
				case 'CREATE_FAILED':
				case 'UPDATE_FAILED':
				case 'DELETE_FAILED':
				case 'UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS':
				case 'UPDATE_ROLLBACK_IN_PROGRESS':
				case 'ROLLBACK_FAILED':
					status = red.bold( status );
					resource = red.bold( resource );
					break;
				default:
					status = gray.bold( status );
					break;
			}

			const message = [
				`[${ ApiTask.getTime( Timestamp ) }]`,
				resource,
				status,
				ResourceStatusReason || gray( '—' ),
			];

			if ( this.log ) {
				this.log.info( message.join( ' ' ) );
			}
		}
	}

}
