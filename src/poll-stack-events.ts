import { green, red, gray, white } from 'chalk';
import { CloudFormation, AWSError } from 'aws-sdk';
import {
	StackId,
	Timestamp,
	DescribeStackEventsInput,
	DescribeStackEventsOutput,
	StackEvent
} from 'aws-sdk/clients/cloudformation';

import { Logger } from './logger';

export class PollStackEvents {

	private events: { [x: string]: boolean } = {};

	private pollParams?: DescribeStackEventsInput;

	private pollInterval?: ReturnType<typeof setInterval>;

	public static getTime( timestamp: Timestamp ): string {
		const date = new Date( timestamp );

		const hour = date.getHours().toString().padStart( 2, '0' );
		const min = date.getMinutes().toString().padStart( 2, '0' );
		const sec = date.getSeconds().toString().padStart( 2, '0' );

		return `${ hour }:${ min }:${ sec }`;
	}

	public constructor(
		private readonly uuid: string,
		private readonly cloudformation: CloudFormation,
		private readonly log: Logger
	) {}

	public start( stackId?: StackId ): void {
		this.events = {};

		this.pollParams = { StackName: stackId };
		this.pollInterval = setInterval( this.poll.bind( this ), 2500 );

		this.log.info( white.bold( 'Event Logs:' ) );
	}

	public stop(): void {
		if ( this.pollInterval ) {
			clearInterval( this.pollInterval );
		}

		if ( this.log ) {
			this.log.info( '' );
		}
	}

	private poll(): void {
		this.cloudformation.describeStackEvents( this.pollParams || {}, ( err: AWSError, data: DescribeStackEventsOutput ) => {
			if ( !err && data.StackEvents ) {
				data.StackEvents.reverse().forEach( this.displayEvent, this );
			}
		} );
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

		if ( ClientRequestToken === this.uuid && !this.events[EventId] ) {
			this.events[EventId] = true;

			let resource = ( LogicalResourceId || '' ).padEnd( 35, ' ' );
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
				`[${ PollStackEvents.getTime( Timestamp ) }]`,
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
