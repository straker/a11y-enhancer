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
   * @see https://www.youtube.com/watch?v=JS68faEUduk
   * @see https://ebay.gitbooks.io/mindpatterns/content/disclosure/dialog.html
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
    element.setAttribute('aria-hidden', true);

    var type = element.getAttribute('type');
    if (VALID_TYPES.indexOf(type) !== -1) {
      element.type = type;
    } else {
      element.type = DEFAULT_TYPE;
    }

    // the role could be on the element or one of it's children
    var dialog = element.getAttribute('role') === 'dialog' ? element : root.querySelector('[role="dialog"]');

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

    /**
     * Open the dialog.
     */
    element.open = function () {
      if (!this.hasAttribute('aria-hidden')) return;

      previousActiveElement = document.activeElement;
      this.inert = false;

      // inert will restore the previous state of aria-hidden (true) so we must
      // remove the aria-hidden attribute after inert has finished
      this.removeAttribute('aria-hidden');

      if (this.type === 'modal') {

        // prevent page from scrolling while open
        document.body.style.overflow = 'hidden';

        // we need to inert every subtree except for the one that contains this dialog
        // walk up the DOM tree and add inert to all children except for the child
        // that contains the dialog's tree. save each node we inerted so we don't have
        // to walk the tree again to uninert nodes
        this._inertedElements = [];
        this._uninertedElements = [];
        var el = this;

        do {

          // an element that is a child of a shadowroot will have a parentNode but not
          // a parentElement. a shadowroot element has neither but instead has a host
          var parent = el.parentNode || el.host;

          // if the dialogs subtree has already been inerted, then we need to uninert it
          if (parent.inert) {
            parent.inert = false;
            this._uninertedElements.push(parent);
          }

          for (var i = 0, child; child = parent.children[i]; i++) {

            // by only adding inert to elements that have not been inerted, we can
            // preserve a11y through stacking modals
            if (!(child === el || child.hasAttribute('data-no-inert') || child.inert)) {
              child.inert = true;
              this._inertedElements.push(child);
            }
          }

          el = parent;
        } while (el !== document.body);

        // event listeners
        this.addEventListener('keydown', checkCloseDialog);
      }

      this.dispatchEvent(new Event('dialog-opened'));

      // wait for the dispatch event to run in case a modal is hidden (display: none,
      // visibility: hidden, inert) as the browser will not focus a hidden element
      setTimeout(function (e) {

        // focus the dialog if no element has autofocus attribute
        if (!dialog.querySelector('[autofocus]')) {
          dialog.focus();
        } else {
          dialog.querySelector('[autofocus]').focus();
        }
      }, 100);
    };

    /**
     * Close the dialog.
     */
    element.close = function () {
      if (this.hasAttribute('aria-hidden')) return;

      this.setAttribute('aria-hidden', true);

      if (this.type === 'modal') {

        // in Safari, removing the overflow style or uninerting nodes causes a
        // visually delay in any css animations so we have to wrap it in a set timeout
        // to get it off the current frame (50ms doesn't seem to be enough)
        setTimeout(function () {
          document.body.style.overflow = null;

          // uninert all nodes
          this._inertedElements.forEach(function (node) {
            node.inert = false;
          });
          this._uninertedElements.forEach(function (node) {
            node.inert = true;
          });
          this._inertedElements = null;
          this._uninertedElements = null;

          // focus the previous element
          previousActiveElement.focus();
          previousActiveElement = null;
        }.bind(this), 100);

        // remove event listeners
        this.removeEventListener('keydown', checkCloseDialog);
      } else {

        // focus the previous element
        previousActiveElement.focus();
        previousActiveElement = null;
      }

      this.dispatchEvent(new Event('dialog-closed'));
    };

    /**
     * Check for events that should close the dialog.
     * @param {Event} e
     */
    function checkCloseDialog(e) {
      if (e.which === esc) {
        element.close();
      }
    }
  }

  exports.dialog = dialog;

  Object.defineProperty(exports, '__esModule', { value: true });
});