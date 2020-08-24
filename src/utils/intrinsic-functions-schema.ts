import { Type, Schema, TypeConstructorOptions } from 'js-yaml';

/**
 * Returns a full function name based on provided yaml tag.
 *
 * @param {string} name The yaml tag.
 * @returns {string} The function name.
 */
export function getFunctionName( name: string ): string {
	if ( name === 'Ref' || name === 'Condition' ) {
		return name;
	}

	return `Fn::${ name }`;
}

/**
 * Returns a custructor function for yaml tag type.
 *
 * @param {string} fn The function name.
 * @returns {Function} The constructor function.
 */
export function getFunctionConstruct( fn: string ): ( data: any ) => any {
	if ( fn === 'Fn::GetAtt' ) {
		return ( data: string ) => {
			const parts = data.split( '.' );
			return {
				'Fn::GetAtt': [
					parts[0],
					parts.slice( 1 ).join( '.' ),
				],
			};
		};
	}

	return ( data: string ) => ( { [fn]: data } );
}

/**
 * Creates and returns a new yaml tag type.
 *
 * @param {string} name The tag name.
 * @param {string} kind The kind of CF function. Valid values are: sequence, scalar and mapping.
 * @returns {Type} A new tag type instance.
 */
export function createType( name: string, kind: 'sequence' | 'scalar' | 'mapping' ): Type {
	const fn = getFunctionName( name );
	const params: TypeConstructorOptions = {
		kind,
		construct: getFunctionConstruct( fn ),
	};

	return new Type( `!${ name }`, params );
}

/**
 * Creates yaml schema with intrinsic functions available in CF.
 *
 * @returns {Schema} A new schema instance.
 */
export function createSchema(): Schema {
	const scalar = [
		'Base64',
		'GetAtt',
		'GetAZs',
		'ImportValue',
		'Sub',
		'Ref',
		'Condition',
	];

	const sequence = [
		'Cidr',
		'FindInMap',
		'Join',
		'Select',
		'And',
		'Equals',
		'If',
		'Not',
		'Or',
		'Split',
	];

	const mapping = [
		'Transform',
	];

	return Schema.create( [
		...scalar.map( ( name: string ) => createType( name, 'scalar' ) ),
		...sequence.map( ( name: string ) => createType( name, 'sequence' ) ),
		...mapping.map( ( name: string ) => createType( name, 'mapping' ) ),
	] );
}
