import { Logger } from './logger';
import { RunnerContext, RunnerData } from './types';
import { uuid } from './utils';

export abstract class Task {

	protected readonly taskUUID: string = uuid();

	protected input?: RunnerData;

	protected log?: Logger;

	protected options?: RunnerContext;

	protected readonly output: RunnerData = {};

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
