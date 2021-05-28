/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
import { HOME_LAYOUT_SET } from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';

export const layout = ( state = {}, action ) =>
	action.type === HOME_LAYOUT_SET ? action.layout : state;

export const sites = keyedReducer(
	'siteId',
	combineReducers( {
		layout,
	} )
);

const combinedReducer = combineReducers( {
	sites,
} );

export default withStorageKey( 'home', combinedReducer );
