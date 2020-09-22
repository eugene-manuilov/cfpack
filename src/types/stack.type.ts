import { Artifacts } from './artifacts.type';

export type Stack = {
	name: string,
	region?: string,
	artifacts?: Artifacts,
	params?: { [x: string]: string },
};
