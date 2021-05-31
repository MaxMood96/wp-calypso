/**
 * Internal dependencies
 */
import { LoginPage } from '../pages/login-page';
import { getAccountCredential, getCalypsoURL } from '../../data-helper';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

/**
 * Class representing the end-to-end log in process.
 */
export class LoginFlow {
	page: Page;
	username: string;
	password: string;

	/**
	 * Creates an instance of the log in flow.
	 *
	 * @param {Page} page Instance of a Playwright page on which test steps are executing.
	 * @param {string} [accountType] Type of account to be used for the log in process.
	 */
	constructor( page: Page, accountType = 'defaultUser' ) {
		this.page = page;

		// Ignoring the last portion of the destructure (siteURL) because
		// it is not useful to us yet.
		const [ username, password ] = getAccountCredential( accountType );
		this.username = username;
		this.password = password;
	}

	/**
	 * Executes the common steps of logging in as any particular user.
	 *
	 * @param {Page} page Page on which interactions should occur.
	 * @returns {Promise<void>} No return value.
	 */
	async baseflow( page: Page ): Promise< void > {
		console.log( 'Logging in as ' + this.username );

		const loginPage = new LoginPage( page );
		await loginPage.login( { username: this.username, password: this.password } );
	}

	/**
	 * Log in as the specified user from the WPCOM Log-In endpoint.
	 * This is the basic action of logging in.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async login(): Promise< void > {
		await this.page.goto( getCalypsoURL( 'log-in' ) );
		await this.baseflow( this.page );
	}

	/**
	 * Log in as the specified user from a popup, typically triggered while logged out.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async loginFromPopup(): Promise< void > {
		// Popup emits the event 'popup'. Capturing the event obtains the Page object
		// for the popup page, where the login form is located.
		const popupPage = await this.page.waitForEvent( 'popup' );

		// Execute the login steps using the popup page, not the base page.
		await this.baseflow( popupPage );

		// Wait for the popup to be closed before passing control back.
		await popupPage.waitForEvent( 'close' );
	}
}
