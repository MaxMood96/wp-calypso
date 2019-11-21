/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card/compact';
import Header from './card/header';
import Property from './card/property';
import SubscriptionSettings from './card/subscription-settings';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import { domainManagementRedirectSettings } from 'my-sites/domains/paths';
import { recordPaymentSettingsClick } from './payment-settings-analytics';

class SiteRedirect extends React.Component {
	getAutoRenewalOrExpirationDate() {
		const { domain, translate } = this.props;

		if ( domain.isAutoRenewing ) {
			return (
				<Property label={ translate( 'Redirect renews on' ) }>
					{ domain.autoRenewalMoment.format( 'LL' ) }
				</Property>
			);
		}

		return (
			<Property label={ translate( 'Redirect expires on' ) }>
				{ domain.expirationMoment.format( 'LL' ) }
			</Property>
		);
	}

	handlePaymentSettingsClick = () => {
		this.props.recordPaymentSettingsClick( this.props.domain );
	};

	render() {
		const { domain, translate } = this.props;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div>
				<div className="domain-details-card">
					<Header { ...this.props } />

					<Card>
						<Property label={ translate( 'Type', { context: 'A type of domain.' } ) }>
							{ translate( 'Site Redirect' ) }
						</Property>

						{ this.getAutoRenewalOrExpirationDate() }

						<SubscriptionSettings
							type={ domain.type }
							subscriptionId={ domain.subscriptionId }
							siteSlug={ this.props.selectedSite.slug }
							onClick={ this.handlePaymentSettingsClick }
						/>
					</Card>
				</div>

				<VerticalNav>{ this.siteRedirectNavItem() }</VerticalNav>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	siteRedirectNavItem() {
		return (
			<VerticalNavItem
				path={ domainManagementRedirectSettings(
					this.props.selectedSite.slug,
					this.props.domain.name
				) }
			>
				{ this.props.translate( 'Redirect Settings' ) }
			</VerticalNavItem>
		);
	}
}

export default connect( null, { recordPaymentSettingsClick } )( localize( SiteRedirect ) );
