/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_close_click`.
 *
 * @returns {{handler: Function, selector: string, type: string}} event object definition.
 */
export default () => ( {
	selector:
		'.edit-post-header .edit-post-fullscreen-mode-close, .edit-site-navigation-toggle__button',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_block_editor_close_click' ),
} );
