import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

const selectors = {
	visitSiteButton: '.button >> text=Visit site',

	// Task card (topmost card)
	taskHeadingMessage: ( message: string ) =>
		`.primary__customer-home-location-content :text("${ message }")`,

	domainUpsellCard: `.domain-upsell__card`,
	domainUpsellSuggestedDomain: `.domain-upsell__card .domain-upsell-illustration`,
	domainUpsellBuyDomain: ( message: string ) =>
		`.domain-upsell-actions button:text("${ message }")`,
};

/**
 * Page representing the WPCOM home dashboard.
 */
export class MyHomePage {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Visits the `/home` endpoint.
	 *
	 * @param {string} siteSlug Site URL.
	 */
	async visit( siteSlug: string ): Promise< void > {
		await this.page.goto( getCalypsoURL( `/home/${ siteSlug }` ), {
			timeout: 20 * 1000,
		} );
	}

	/**
	 * Click on the Visit Site button on the home dashboard.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async visitSite(): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.visitSiteButton ),
		] );
	}

	/**
	 * Validates the domain upsell is showing
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async validateDomainUpsell(): Promise< void > {
		await this.page.locator( selectors.domainUpsellCard ).waitFor();
	}

	/**
	 * Get suggested domain name.
	 *
	 * @returns {string} No return value.
	 */
	async suggestedDomainName(): Promise< string | null > {
		await this.page.locator( selectors.domainUpsellSuggestedDomain ).waitFor();

		const locator = this.page.locator( selectors.domainUpsellSuggestedDomain );

		await locator.waitFor();

		return await locator.locator( 'text' ).textContent();
	}

	/**
	 * Click on Buy this Domain button on the domain Upsell.
	 *
	 * @param {string} buyDomainButton Button text to click.
	 * @returns {Promise<void>} No return value.
	 */
	async clickBuySuggestedDomain( buyDomainButton: string ): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.domainUpsellBuyDomain( buyDomainButton ) ),
		] );
	}

	/**
	 * Given a partial or full string, verify that a message containing
	 * the string is shown on the Task card heading.
	 *
	 * @param {string} message Partial or fully matching text to search.
	 */
	async validateTaskHeadingMessage( message: string ): Promise< void > {
		await this.page.waitForSelector( selectors.taskHeadingMessage( message ) );
	}
}
