import { withStorageKey } from '@automattic/state-utils';
import { includes } from 'lodash';
import {
	MEDIA_DELETE,
	SITE_SETTINGS_RECEIVE,
	SITE_SETTINGS_REQUEST,
	SITE_SETTINGS_REQUEST_FAILURE,
	SITE_SETTINGS_REQUEST_SUCCESS,
	SITE_SETTINGS_SAVE,
	SITE_SETTINGS_SAVE_FAILURE,
	SITE_SETTINGS_SAVE_SUCCESS,
	SITE_SETTINGS_UPDATE,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { items as itemSchemas } from './schema';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID to whether a request is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const requesting = ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_SETTINGS_REQUEST: {
			const { siteId } = action;
			return { ...state, [ siteId ]: true };
		}
		case SITE_SETTINGS_REQUEST_SUCCESS: {
			const { siteId } = action;
			return { ...state, [ siteId ]: false };
		}
		case SITE_SETTINGS_REQUEST_FAILURE: {
			const { siteId } = action;
			return { ...state, [ siteId ]: false };
		}
	}

	return state;
};

/**
 * Returns the save Request status after an action has been dispatched. The
 * state maps site ID to the request status
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const saveRequests = ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_SETTINGS_SAVE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: { saving: true, status: 'pending', error: false },
			};
		}
		case SITE_SETTINGS_SAVE_SUCCESS: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: { saving: false, status: 'success', error: false },
			};
		}
		case SITE_SETTINGS_SAVE_FAILURE: {
			const { siteId, error } = action;

			return {
				...state,
				[ siteId ]: { saving: false, status: 'error', error },
			};
		}
	}

	return state;
};

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID to the site settings object.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const items = withSchemaValidation( itemSchemas, ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_SETTINGS_RECEIVE: {
			const { siteId, settings } = action;

			return {
				...state,
				[ siteId ]: settings,
			};
		}
		case SITE_SETTINGS_UPDATE: {
			const { siteId, settings } = action;

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					...settings,
				},
			};
		}
		case MEDIA_DELETE: {
			const { siteId, mediaIds } = action;
			const settings = state[ siteId ];
			if ( ! settings || ! includes( mediaIds, settings.site_icon ) ) {
				return state;
			}

			return {
				...state,
				[ siteId ]: {
					...settings,
					site_icon: null,
				},
			};
		}
	}

	return state;
} );

const combinedReducer = combineReducers( {
	items,
	requesting,
	saveRequests,
} );

export default withStorageKey( 'siteSettings', combinedReducer );
