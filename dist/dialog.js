(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : factory(global.a11yEnhancer = global.a11yEnhancer || {});
})(this, function (exports) {
  'use strict';

  /**
   * Define commonly used keycodes for interacting with components.
   */

  var esc = 27;

  var TITLE_ID = 'ae_dialog-heading';

  // unique id for each dialog heading
  var uid = 1;

  /**
   * Implements an accessible accordion menu with proper state and focus support.
   * @see https://www.w3.org/TR/wai-aria-practices/#dialog_modal
   *
   * @param {HTMLElement} element - Container element of the accordion.
   * @param {ShadowRoot} [shadfowRoot=element] - Shadow root element if using a custom element with shadow root. Defaults to the container element.
   *
   * For this to work, the modal must be given the role="dialog". The element will be moved
   * to be a direct child of body. This ensures there are no z-index problems and that the
   * modal can trap keyboard focus easily by adding the inert attribute to all it's siblings.
   *
   * This implementation also requires the inert polyfill (npm install --save wicg-inert).
   *
   * By default, the modal is of type modal. This means that keyboard interactions are trapped
   * to the modal when it is opened and the rest of the page cannot be interacted with.
   *
   * Optional attributes on container element
   *
   *    type - type of dialog (modal, modeless). defaults to modal
   *
   * Events will pass the target element as the detail property of the event
   *
   *    modal-opened - fired on the element when the modal is opened (does not bubble)
   *    modal-closed - fired on the element when the modal is closed (does not bubble)
   */
  function dialog(element, shadowRoot) {

    // ensure we are a DOM element and have proper element functions
    if (!(element instanceof HTMLElement)) return;

    // if no shadowRoot is passed default to the container element
    // using toString() is the only safe way to check for a shadow root node when
    // the polyfill is not loaded
    var root = shadowRoot && shadowRoot.toString() === '[object ShadowRoot]' ? shadowRoot : element;

    var VALID_TYPES = ['modal', 'modeless'];
    var DEFAULT_TYPE = VALID_TYPES[0];

    // states
    var previousActiveElement = void 0;
    var isOpen = false;

    // options
    var type = element.getAttribute('type');
    if (VALID_TYPES.indexOf(type) !== -1) {
      element.type = type;
    } else {
      element.type = DEFAULT_TYPE;
    }

    // the role could be on the element or one of it's children
    var dialog = element.getAttribute('role') === 'dialog' ? element : root.querySelector('[role="dialog"]');

    // move the dialog to be a direct child of body if it's not already. this both resolves any
    // z-index problems and makes disabling the rest of the page easier (just query selector
    // everything under body except the dialog)
    if (element.type === 'modal' && element.parentElement !== document.body) {
      document.body.appendChild(element);
    }

    // allow the dialog to be focusable when opened
    // @see https://github.com/whatwg/html/issues/1929
    dialog.setAttribute('tabindex', -1);
    dialog.style.outline = 'none';

    // find the first heading and make it the label to the dialog
    var title = dialog.querySelector('h1,h2,h3,h4,h5,h6');
    if (title) {
      if (!title.hasAttribute('id')) {
        title.setAttribute('id', TITLE_ID + uid++);
      }

      // only set the label if it's not already set
      if (!dialog.hasAttribute('aria-labelledby')) {
        dialog.setAttribute('aria-labelledby', title.getAttribute('id'));
      }
    }

    // prevent anyone from modifying the public isOpen property
    Object.defineProperty(element, 'isOpen', {
      get: function get() {
        return isOpen;
      }
    });

    // give the element an open and close method that can be called externally
    /**
     * Open the dialog.
     */
    element.open = function () {
      if (isOpen) return;

      isOpen = true;
      previousActiveElement = document.activeElement;

      element.dispatchEvent(new Event('dialog-opened'));

      if (element.type === 'modal') {

        // prevent page from scrolling while open
        document.body.style.overflow = 'hidden';

        // make all siblings of the dialog inert if it's a modal
        Array.from(document.body.children).forEach(function (child) {
          if (child !== root) {
            child.inert = true;
          }
        });

        // event listeners
        element.addEventListener('keydown', checkCloseDialog);
      }

      // wait for the dispatch event to run in case a modal is hidden (display: none,
      // visibility: hidden, inert) as the browser will not focus a hidden element
      setTimeout(function (e) {

        // focus the dialog if no element has autofocus attribute
        if (!dialog.querySelector('[autofocus]')) {
          dialog.focus();
        } else {
          dialog.querySelector('[autofocus]').focus();
        }
      }, 50);
    };

    /**
     * Close the dialog.
     */
    element.close = function () {
      if (!isOpen) return;

      isOpen = false;

      element.dispatchEvent(new Event('dialog-closed'));

      if (element.type === 'modal') {
        document.body.style.overflow = null;

        // uninert all siblings
        Array.from(document.body.children).forEach(function (child) {
          if (child !== root) {
            child.inert = false;
          }
        });

        // remove event listeners
        element.removeEventListener('keydown', checkCloseDialog);
      }

      // wait for the dispatch event to run in case a modal is hidden (display: none,
      // visibility: hidden, inert) as the browser will not focus a hidden element
      setTimeout(function (e) {

        // focus the previous element
        previousActiveElement.focus();
        previousActiveElement = null;
      }, 50);
    };

    /**
     * Check for events that should close the dialog.
     * @param {Event} e
     */
    function checkCloseDialog(e) {

      // check for escape on keydown
      if (e.type === 'keydown' && e.which === esc) {
        element.close();
      }
    }
  }

  exports.dialog = dialog;

  Object.defineProperty(exports, '__esModule', { value: true });
});