import { Stack } from './stack.type';

export type RunnerContext = {
	config?: string,
	silent?: boolean,
	verbose?: boolean,
	stack?: Stack,
	entry?: string,
	output?: string,
}
