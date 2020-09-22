import { Type, Schema } from 'js-yaml';

import {
	getFunctionName,
	getFunctionConstruct,
	createType,
	createSchema
} from './intrinsic-functions-schema';

describe( 'Intrinsic functions schema', () => {
	describe( 'getFunctionName', () => {
		it( 'should return "Ref" as is', () => {
			expect( getFunctionName( 'Ref' ) ).toBe( 'Ref' );
		} );

		it( 'should return "Condition" as is', () => {
			expect( getFunctionName( 'Condition' ) ).toBe( 'Condition' );
		} );

		it( 'should return "Fn::{Name}" name for other functions', () => {
			expect( getFunctionName( 'FindInMap' ) ).toBe( 'Fn::FindInMap' );
		} );
	} );

	describe( 'getFunctionConstruct', () => {
		it( 'should return a function', () => {
			expect( typeof getFunctionConstruct( 'Fn::Join' ) ).toBe( 'function' );
		} );

		it( 'should return special constructor for Fn::GetAtt function', () => {
			const construct = getFunctionConstruct( 'Fn::GetAtt' );
			expect( typeof construct ).toBe( 'function' );
			expect( construct( 'one.two.three' ) ).toEqual( {
				'Fn::GetAtt': [ 'one', 'two.three' ],
			} );
		} );

		it( 'should return basic constructor for other functions', () => {
			const construct = getFunctionConstruct( 'Fn::Base64' );
			expect( typeof construct ).toBe( 'function' );
			expect( construct( 'test' ) ).toEqual( {
				'Fn::Base64': 'test',
			} );
		} );
	} );

	describe( 'createType', () => {
		it( 'should return a Type instance', () => {
			expect( createType( 'Transform', 'mapping' ) instanceof Type ).toBeTruthy();
		} );

		it( 'should return a type with correct "kind" property', () => {
			const type = createType( 'Or', 'sequence' );
			expect( type ).not.toBeUndefined();
			expect( type.kind ).toBe( 'sequence' );
		} );

		it( 'should return a type with a special constructor for Fn::GetAtt function', () => {
			const type = createType( 'GetAtt', 'scalar' );
			expect( type ).not.toBeUndefined();
			expect( type.construct( 'one.two.three' ) ).toEqual( {
				'Fn::GetAtt': [ 'one', 'two.three' ],
			} );
		} );

		it( 'should return a type with basic constructor for other functions', () => {
			const type = createType( 'Base64', 'scalar' );
			expect( type ).not.toBeUndefined();
			expect( type.construct( 'test' ) ).toEqual( {
				'Fn::Base64': 'test',
			} );
		} );
	} );

	describe( 'createSchema', () => {
		it( 'should return a Schema instance', () => {
			expect( createSchema() instanceof Schema ).toBeTruthy();
		} );
	} );
} );
