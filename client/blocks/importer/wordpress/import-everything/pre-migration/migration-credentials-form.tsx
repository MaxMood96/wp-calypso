import { Button } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { NextButton } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CredentialsForm from 'calypso/components/advanced-credentials/credentials-form';
import {
	FormMode,
	INITIAL_FORM_ERRORS,
	INITIAL_FORM_STATE,
	validate,
} from 'calypso/components/advanced-credentials/form';
import { useMigrateProvisionMutation } from 'calypso/data/site-migration/migrate-provision-mutation';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { updateCredentials } from 'calypso/state/jetpack/credentials/actions';
import getJetpackCredentialsUpdateError from 'calypso/state/selectors/get-jetpack-credentials-update-error';
import getJetpackCredentialsUpdateStatus from 'calypso/state/selectors/get-jetpack-credentials-update-status';
import { StartImportTrackingProps } from './types';

interface Props {
	sourceSite: SiteDetails;
	targetSite: SiteDetails;
	startImport: ( props?: StartImportTrackingProps ) => void;
	selectedHost: string;
	onChangeProtocol: ( protocol: 'ftp' | 'ssh' ) => void;
}

export const MigrationCredentialsForm: React.FunctionComponent< Props > = ( props ) => {
	const { sourceSite, targetSite, startImport } = props;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { hostname } = new URL( sourceSite.URL );
	const [ formState, setFormState ] = useState( { ...INITIAL_FORM_STATE, host: hostname } );
	const [ formErrors, setFormErrors ] = useState( INITIAL_FORM_ERRORS );
	const [ formMode, setFormMode ] = useState( FormMode.Password );
	const [ hasMissingFields, setHasMissingFields ] = useState( false );

	const formSubmissionStatus = useSelector(
		( state ) =>
			getJetpackCredentialsUpdateStatus( state, sourceSite.ID ) as
				| 'unsubmitted'
				| 'pending'
				| 'success'
				| 'failed'
	);

	const isFormSubmissionPending = formSubmissionStatus === 'pending';
	const formHasErrors = formErrors && Object.keys( formErrors ).length > 0;

	useEffect( () => {
		// Clear the hasMissingFields flag when there are no more errors.
		if ( ! formHasErrors ) {
			setHasMissingFields( false );
		}
	}, [ formErrors ] );

	// validate changes to the credentials form
	useEffect( () => {
		const errors = validate( formState, formMode );

		// Shorten the root user error message as the original message used in the form is too long.
		if ( formState.user === 'root' ) {
			errors.user = {
				message: translate( "We can't accept credentials for the root user." ),
				waitForInteraction: true,
			};
		}

		if ( typeof formState.port === 'string' ) {
			errors.port = {
				message: translate( 'Invalid port.' ),
				waitForInteraction: true,
			};
		}

		setFormErrors( errors );
	}, [ formState, formMode ] );

	useEffect( () => {
		props.onChangeProtocol( formState.protocol as 'ftp' | 'ssh' );
	}, [ formState.protocol ] );

	useEffect( () => {
		if ( formSubmissionStatus === 'success' ) {
			startImport( {
				type: 'with-credentials',
			} );
		}
	}, [ formSubmissionStatus ] );

	const handleUpdateCredentials = () => {
		if ( formHasErrors ) {
			return;
		}

		const credentials = { ...formState };

		if ( formMode === FormMode.Password ) {
			credentials.kpri = '';
		} else if ( formMode === FormMode.PrivateKey ) {
			credentials.pass = '';
		}

		dispatch( recordTracksEvent( 'calypso_site_migration_credentials_update' ) );
		dispatch( updateCredentials( sourceSite.ID, credentials, true, false ) );
	};

	const { migrateProvision, isLoading, isError, error } =
		useMigrateProvisionMutation( handleUpdateCredentials );

	const submitCredentials = useCallback(
		( e ) => {
			e.preventDefault();
			setHasMissingFields( false );
			// If the form is submitted with errors, prevent the submission and show the errors.
			if ( formHasErrors ) {
				setHasMissingFields( true );
				return;
			}

			migrateProvision( targetSite.ID, sourceSite.ID, true );
		},
		[ formHasErrors, dispatch, sourceSite.ID, formState, formMode ]
	);

	const updateError = useSelector( ( state ) =>
		getJetpackCredentialsUpdateError( state, sourceSite.ID )
	);

	useEffect( () => {
		if ( updateError ) {
			dispatch( recordTracksEvent( 'calypso_site_migration_credentials_update_error' ) );
		}
	}, [ updateError ] );

	return (
		<>
			<form onSubmit={ submitCredentials }>
				<CredentialsForm
					disabled={ isFormSubmissionPending || isLoading }
					formErrors={ formErrors }
					formMode={ formMode }
					formState={ formState }
					host={ props.selectedHost }
					role="main"
					onFormStateChange={ setFormState }
					onModeChange={ setFormMode }
					withHeader={ false }
				/>

				{ updateError && (
					<div className="pre-migration__content pre-migration__error">
						{ updateError.translatedError }
					</div>
				) }

				{ isError && error instanceof Error && (
					<div className="pre-migration__content pre-migration__error">
						{ translate( 'We could not store your credentials:' ) } { error.message }
					</div>
				) }

				{ hasMissingFields && formHasErrors && (
					<div className="pre-migration__content pre-migration__error">
						{ translate(
							'Please make sure all fields are filled in correctly before proceeding.'
						) }
					</div>
				) }

				<div className="pre-migration__content pre-migration__proceed import__footer-button-container">
					<NextButton type="submit" isBusy={ isFormSubmissionPending || isLoading }>
						{ isFormSubmissionPending || isLoading
							? translate( 'Testing credentials' )
							: translate( 'Start migration' ) }
					</NextButton>
					<Button
						borderless={ true }
						className="action-buttons__content-only"
						onClick={ () =>
							startImport( {
								type: 'skip-credentials',
							} )
						}
					>
						{ translate( 'Skip credentials (slower setup)' ) }
					</Button>
				</div>
			</form>
		</>
	);
};

export default MigrationCredentialsForm;
