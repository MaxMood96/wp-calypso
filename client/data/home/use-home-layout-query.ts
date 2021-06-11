/**
 * External dependencies
 */
import { useQuery, UseQueryResult } from 'react-query';
import config from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

const useHomeLayoutQuery = (
	siteId: number | null,
	isDev?: boolean,
	forcedView?: string
): UseQueryResult => {
	isDev = config.isEnabled( 'home/layout-dev' ) || isDev;

	return useQuery(
		// Don't include `isDev` or `forcedView` in query key, we want every
		// caller to have the same idea of what the current view is.
		[ 'home-layout', siteId ],
		() =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/home/layout`,
				apiNamespace: 'wpcom/v2',
				query: {
					...( isDev && { dev: true } ),
					...( isDev && forcedView && { view: forcedView } ),
				},
			} ),
		{ refetchOnWindowFocus: false, enabled: !! siteId }
	);
};

export default useHomeLayoutQuery;
