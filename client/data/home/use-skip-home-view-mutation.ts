/**
 * External dependencies
 */
import { useCallback } from 'react';
import { useMutation, useQueryClient, UseMutationResult } from 'react-query';
import config from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';

type ReminderDuration = '1d' | '1w' | null;

interface Variables {
	siteId: number;
	viewName: string;
	reminder: ReminderDuration;
}

interface Result extends UseMutationResult< void, unknown, Variables > {
	skipHomeView: ( siteId: number, viewName: string, reminder: ReminderDuration ) => void;
}

function useSkipHomeViewMutation( siteId: number ): Result {
	const queryClient = useQueryClient();
	const mutation = useMutation< void, unknown, Variables >(
		( { siteId, viewName, reminder } ) =>
			wp.req.post( {
				path: `/sites/${ siteId }/home/layout/skip`,
				apiNamespace: 'wpcom/v2',
				...( config.isEnabled( 'home/layout-dev' ) && { query: { dev: true } } ),
				body: {
					view: viewName,
					...( reminder && { reminder } ),
				},
			} ),
		{
			onSuccess() {
				queryClient.invalidateQueries( [ 'home-layout', siteId ] );
			},
		}
	);

	const { mutate } = mutation;

	const skipHomeView = useCallback(
		( siteId: number, viewName: string, reminder: ReminderDuration ) => {
			mutate( { siteId, viewName, reminder } );
		},
		[ mutate ]
	);

	return { skipHomeView, ...mutation };
}

export default useSkipHomeViewMutation;
