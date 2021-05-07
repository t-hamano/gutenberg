/**
 * External dependencies
 */
import Clipboard from 'clipboard';

/**
 * WordPress dependencies
 */
import { useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import useRefEffect from '../use-ref-effect';

/**
 * @template T
 * @typedef {import('react').RefObject<T>} RefObject */

/**
 * @template T
 * @param {T} value
 * @return {import('react').RefObject<T>} The updated ref
 */
function useUpdatedRef( value ) {
	const ref = useRef( value );
	ref.current = value;
	return ref;
}

/**
 * Copies the given text to the clipboard when the element is clicked.
 *
 * @param {string | (() => string)} text      The text to copy. Use a function if not
 *                                  already available and expensive to compute.
 * @param {Function}      onSuccess Called when to text is copied.
 *
 * @return {import('react').Ref<Node>} A ref to assign to the target element.
 */
export default function useCopyToClipboard( text, onSuccess ) {
	// Store the dependencies as refs and continuesly update them so they're
	// fresh when the callback is called.
	const textRef = useUpdatedRef( text );
	const onSuccesRef = useUpdatedRef( onSuccess );
	return useRefEffect( ( node ) => {
		// Clipboard listens to click events.
		const clipboard = new Clipboard( /** @type {Element} */ ( node ), {
			text() {
				return typeof textRef.current === 'function'
					? textRef.current()
					: textRef.current || '';
			},
		} );

		clipboard.on( 'success', ( { clearSelection } ) => {
			// Clearing selection will move focus back to the triggering
			// button, ensuring that it is not reset to the body, and
			// further that it is kept within the rendered node.
			clearSelection();
			// Handle ClipboardJS focus bug, see
			// https://github.com/zenorocha/clipboard.js/issues/680
			/** @type {HTMLElement} */ ( node ).focus();

			if ( onSuccesRef.current ) {
				onSuccesRef.current();
			}
		} );

		return () => {
			clipboard.destroy();
		};
	}, [] );
}
