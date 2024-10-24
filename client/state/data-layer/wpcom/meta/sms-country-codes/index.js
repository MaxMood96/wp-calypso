import { translate } from 'i18n-calypso';
import { COUNTRIES_SMS_FETCH, COUNTRIES_SMS_UPDATED } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';

/**
 * Dispatches a request to fetch all available WordPress.com countries
 *
 * @param 	{Object} action The action to dispatch next
 * @returns {Object} dispatched http action
 */
export const fetchCountriesSms = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: '/meta/sms-country-codes/',
		},
		action
	);

/**
 * Dispatches a countries updated action then the request for countries succeeded.
 *
 * @param   {Object}   action   Redux action
 * @param   {Array}    countries  array of raw device data returned from the endpoint
 * @returns {Object}            disparched user devices add action
 */
export const updateCountriesSms = ( action, countries ) => ( {
	type: COUNTRIES_SMS_UPDATED,
	countries,
} );

/**
 * Dispatches a error notice action when the request for the supported countries list fails.
 *
 * @returns {Object}            dispatched error notice action
 */
export const showCountriesSmsLoadingError = () =>
	errorNotice( translate( "We couldn't load the countries list." ) );

registerHandlers( 'state/data-layer/wpcom/meta/sms-country-codes/index.js', {
	[ COUNTRIES_SMS_FETCH ]: [
		dispatchRequest( {
			fetch: fetchCountriesSms,
			onSuccess: updateCountriesSms,
			onError: showCountriesSmsLoadingError,
		} ),
	],
} );
