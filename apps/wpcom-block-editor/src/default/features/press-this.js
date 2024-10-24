import { createBlock } from '@wordpress/blocks';
import { dispatch } from '@wordpress/data';
import { getQueryArgs } from '@wordpress/url';
import { isEditorReady } from '../../utils';

const { url } = getQueryArgs( window.location.href );

if ( url ) {
	( async () => {
		// Wait for the editor to be initialized and the core blocks registered.
		await isEditorReady();

		dispatch( 'core/editor' ).resetEditorBlocks( [
			createBlock( 'core/embed', { url, type: 'wp-embed' } ),
		] );
	} )();
}
