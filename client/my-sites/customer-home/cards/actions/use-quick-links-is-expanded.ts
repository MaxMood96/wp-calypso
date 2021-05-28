/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getStoredItem } from 'calypso/lib/browser-storage';
import { useLocalStorage } from 'calypso/lib/use-local-storage';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';

export function useQuickLinksIsExpanded(): [
	boolean | null,
	( isExpanded: boolean ) => void,
	boolean
] {
	const userId = useSelector( getCurrentUserId );
	const [ isExpanded, setIsExpanded ] = useLocalStorage< boolean | null >(
		`a8c-customer-home-quick-links-expanded-${ userId }`,
		null
	);

	useEffect( () => {
		// The isExpanded state was previously in the Redux store and persisted
		// locally using that mechanism. Now that the expanded state is controlled
		// by the useLocalStorage hook, this helper will migrate any existing
		// state from the persisted Redux store and set up the hook state.

		if ( isExpanded !== null ) {
			// Something already stored in local storage, no need to migrate from Redux store
			return;
		}

		if ( ! userId ) {
			// Logged out? Probably shouldn't be seeing the quick-expander.
			// Default to expanded anyway
			setIsExpanded( true );
		}

		getStoredItem( `redux-state-${ userId }:home` )
			.then( ( result: any ) => {
				if ( result?.quickLinksToggleStatus === 'collapsed' ) {
					setIsExpanded( false );
				} else {
					setIsExpanded( true );
				}
			} )
			.catch( () => {
				setIsExpanded( true );
			} );
	}, [ isExpanded, setIsExpanded, userId ] );

	return [ isExpanded, setIsExpanded, isExpanded !== null ];
}
