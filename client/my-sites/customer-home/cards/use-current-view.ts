/**
 * External dependencies
 */
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useHomeLayoutQuery from 'calypso/data/home/use-home-layout-query';

export function useCurrentView(): string | undefined {
	const siteId = useSelector( getSelectedSiteId );
	const { data } = useHomeLayoutQuery( siteId );

	return ( data as any )?.view_name;
}
