import { Logger } from './logger';
import { RunnerContext } from './runner-context.type';
import { RunnerData } from './runner-data.type';
import { uuid } from './utils/uuid';

export abstract class Task {

	protected readonly taskUUID: string = uuid();
	protected input?: RunnerData;
	protected log?: Logger;
	protected options?: RunnerContext;
	protected output?: RunnerData;

	public setOptions( options: RunnerContext ): void {
		this.options = options;
	}

	public setLogger( log: Logger ): void {
		this.log = log;
	}

	public setData( input: RunnerData ): void {
		this.input = input;
	}

	public abstract run( next: Function ): void;

}
