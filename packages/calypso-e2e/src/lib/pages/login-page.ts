/**
 * Internal dependencies
 */

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	loginContainerSelector: '.wp-login__container',
	usernameSelector: '#usernameOrEmail',
	passwordSelector: '#password',
	changeAccountSelector: '#loginAsAnotherUser',
	alreadyLoggedInSelector: '.continue-as-user',
};

/**
 * Represents an instance of the calypso Login page.
 */
export class LoginPage {
	/**
	 * Creates an instance of the Login page.
	 *
	 * @param {Page} page Playwright page on which actions are executed.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	page: Page;

	/**
	 * Executes series of interactions on the log-in page to log in as a specific user.
	 *
	 * @param {Object} param0 Key/value pair holding the credentials for a user.
	 * @param {string} param0.username Username of the user.
	 * @param {string} param0.password Password of the user.
	 * @returns {Promise<void>} No return value.
	 * @throws {Error} If the log in process was unsuccessful for any reason.
	 */
	async login( { username, password }: { username: string; password: string } ): Promise< void > {
		const alreadyLoggedIn = await this.page.$( selectors.changeAccountSelector );
		if ( alreadyLoggedIn ) {
			await this.page.click( selectors.changeAccountSelector );
		}

		// Begin the process of logging in.
		await this.page.fill( selectors.usernameSelector, username );
		await this.page.keyboard.press( 'Enter' );
		await this.page.fill( selectors.passwordSelector, password );

		// Enter submits the form and initiates the log in process. Then wait for the navigation to
		// settle and complete.
		await Promise.all( [ this.page.waitForNavigation(), this.page.keyboard.press( 'Enter' ) ] );
	}
}
