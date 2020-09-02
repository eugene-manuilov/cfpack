import { Logger } from './logger';
import { RunnerData } from './types';
import { uuid } from './utils';
import { Config } from './config';

export abstract class Task {

	protected readonly taskUUID: string = uuid();

	protected input?: RunnerData;

	protected log?: Logger;

	protected options?: Config;

	protected readonly output: RunnerData = {};

	public setOptions( options: Config ): void {
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
