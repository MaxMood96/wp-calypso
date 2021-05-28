/**
 * Internal dependencies
 */
import {
	HOME_LAYOUT_REQUEST,
	HOME_LAYOUT_SET,
	HOME_LAYOUT_SKIP_CURRENT_VIEW,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/home/layout';
import 'calypso/state/home/init';

export const requestHomeLayout = ( siteId, isDev = false, forcedView = null ) => ( {
	type: HOME_LAYOUT_REQUEST,
	siteId,
	isDev,
	forcedView,
} );

export const skipViewHomeLayout = ( siteId, viewName, reminder = null ) => ( {
	type: HOME_LAYOUT_SKIP_VIEW,
	siteId,
	reminder,
	viewName,
} );

export const setHomeLayout = ( siteId, layout ) => ( {
	type: HOME_LAYOUT_SET,
	siteId,
	layout,
} );
