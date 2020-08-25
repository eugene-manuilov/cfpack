export const ERROR_REQUIRED = 'This field is required';

export function isNotEmpty( value: string ): boolean | string {
	return value.trim().length > 0 || ERROR_REQUIRED;
}
