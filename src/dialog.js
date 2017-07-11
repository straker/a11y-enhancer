import * as KEYS from './key-codes';

const TITLE_ID = 'ae_dialog-heading';

// unique id for each dialog heading
let uid = 1;

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
  if ( !(element instanceof HTMLElement) ) return;

  // if no shadowRoot is passed default to the container element
  // using toString() is the only safe way to check for a shadow root node when
  // the polyfill is not loaded
  const root = (shadowRoot && shadowRoot.toString() === '[object ShadowRoot]' ? shadowRoot : element);

  const VALID_TYPES = ['modal', 'modeless'];
  const DEFAULT_TYPE = VALID_TYPES[0];

  // states
  let previousActiveElement;
  element.isOpen = false;

  // options
  let type = element.getAttribute('type');
  if (VALID_TYPES.indexOf(type) !== -1) {
    element.type = type;
  }
  else {
    element.type = DEFAULT_TYPE;
  }

  // the role could be on the element or one of it's children
  const dialog = (element.getAttribute('role') === 'dialog' ? element : root.querySelector('[role="dialog"]'));

  // allow the dialog to be focusable when opened
  // @see https://github.com/whatwg/html/issues/1929
  dialog.setAttribute('tabindex', -1);
  dialog.style.outline = 'none';

  // find the first heading and make it the label to the dialog
  const title = dialog.querySelector('h1,h2,h3,h4,h5,h6');
  if (title) {
    if (!title.hasAttribute('id')) {
      title.setAttribute('id', TITLE_ID + uid++);
    }

    // only set the label if it's not already set
    if (!dialog.hasAttribute('aria-labelledby')) {
      dialog.setAttribute('aria-labelledby', title.getAttribute('id'));
    }
  }

  // give the element an open and close method that can be called externally
  /**
   * Open the dialog.
   */
  element.open = function() {
    if (this.isOpen) return;

    this.isOpen = true;
    previousActiveElement = document.activeElement;

    this.dispatchEvent(new Event('dialog-opened'));

    if (this.type === 'modal') {

      // prevent page from scrolling while open
      document.body.style.overflow = 'hidden';

      // we need to inert every subtree except for the one that contains this dialog
      // walk up the DOM tree and add inert to all children except for the child
      // that contains the dialog's tree. save each node we inerted so we don't have
      // to walk the tree again
      this._inertedElements = [];
      let el = this;

      do {

        // an element that is a child of a shadowroot will have a parentNode but not
        // a parentElement. a shadowroot element has neither but instead has a host
        let parent = el.parentNode || el.host;

        for (let i = 0, child; (child = parent.children[i]); i++) {

          // by only adding inert to elements that have not been inerted, we can
          // preserve a11y through stacking modals
          if (child !== el && !child.inert) {
            child.inert = true;
            this._inertedElements.push(child);
          }
        }

        el = parent;
      } while (el !== document.body);

      // event listeners
      this.addEventListener('keydown', checkCloseDialog);
    }

    // wait for the dispatch event to run in case a modal is hidden (display: none,
    // visibility: hidden, inert) as the browser will not focus a hidden element
    setTimeout(function(e) {

      // focus the dialog if no element has autofocus attribute
      if (!dialog.querySelector('[autofocus]')) {
        dialog.focus();
      }
      else {
        dialog.querySelector('[autofocus]').focus();
      }
    }, 50);
  };

  /**
   * Close the dialog.
   */
  element.close = function() {
    if (!this.isOpen) return;

    this.isOpen = false;

    this.dispatchEvent(new Event('dialog-closed'));

    if (this.type === 'modal') {
      document.body.style.overflow = null;

      // uninert all nodes
      this._inertedElements.forEach(function(node) {
        node.inert = false;
      });
      this._inertedElements = null;

      // remove event listeners
      this.removeEventListener('keydown', checkCloseDialog);
    }

    // wait for the dispatch event to run in case a modal is hidden (display: none,
    // visibility: hidden, inert) as the browser will not focus a hidden element
    setTimeout(function(e) {

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
    if (e.type === 'keydown' && e.which === KEYS.esc) {
      element.close();
    }
  }
}

export {dialog};