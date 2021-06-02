/**
 * Internal dependencies
 */
import { uploadMedia } from './upload-media';
import wpcom from 'calypso/lib/wp';

const getExternalUploader = ( service ) => ( file, siteId, postId ) => {
	return wpcom.undocumented().site( siteId ).uploadExternalMedia( service, [ file.guid ], postId );
};

/**
 * Add a single external media file.
 *
 * @param {object|object[]} file The media file or files to upload
 * @param {object} site The site for which to upload the file(s)
 * @param {number} postId - ID of the post to attach the media item to
 * @param {object} service The external media service used
 */
export const addExternalMedia = ( file, site, postId, service ) => ( dispatch ) => {
	const uploader = getExternalUploader( service );
	return dispatch( uploadMedia( file, site, postId, uploader ) );
};
