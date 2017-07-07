(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : factory(global.a11yEnhancer = global.a11yEnhancer || {});
})(this, function (exports) {
  'use strict';

  /**
   * Define commonly used keycodes for interacting with components.
   */

  var up = 38;

  var down = 40;

  var LISTBOX_ID = 'ae_combobox-listbox';
  var OPTIONS_ID = 'ae_combobox-option';

  // unique id for each listbox and option
  var listboxUid = 1;
  var optionUid = 1;

  /**
   * Implements an accessible auto complete combo box with proper state and focus support
   * (a combo box that does not support auto complete should just use the <select> element).
   * @see https://www.w3.org/TR/wai-aria-practices-1.1/#combobox
   *
   * @param {HTMLElement} element - Container element of the combo box.
   * @param {ShadowRoot} [shadowRoot=element] - Shadow root element if using a custom element with shadow root. Defaults to the container element.
   *
   * For this to work, the input that controls the dropdown list must be given the
   * role="combobox" and the dropdown menu must be given the role="listbox". From this,
   * the code will assume that every direct child of the listbox is an option.
   *
   * By default, the combo box is an auto complete combo box. This means that the
   * list of choices should filter based on what the user types. By default, as the
   * user navigates through the list of choices the text field will not auto populate
   * with the selected option (e.g. Twitter or Dropbox search field).
   *
   * Optional attributes on container element
   *
   *    autocomplete="inline" - As the user navigates through the list of choices the
   *                            text field will auto populate with the selected option
   *                            (e.g. the address bar of a browser).
   *    autocomplete="both" - Combines both the list and inline auto complete options
   *    wrap-focus - wraps the option selection when on the first/last option
   *
   * Events will pass the target element as the detail property of the event
   *
   *    combobox-expanded - fired when the listbox is expanded
   *    combobox-collapsed - fired when the listbox is collapsed
   *    combobox-option-focused - fired when a listbox option is focused
   *    combobox-option-blurred - fired when a listbox option is blurred
   *    combobox-option-selected - fired when a listbox option is selected
   */
  function combobox(element, shadowRoot) {
    // ensure we are a DOM element and have proper element functions
    if (!element instanceof HTMLElement) return;

    // if no shadowRoot is passed default to the container element
    // using toString() is the only safe way to check for a shadow root node when
    // the polyfill is not loaded
    var root = shadowRoot && shadowRoot.toString() === '[object ShadowRoot]' ? shadowRoot : element;

    // states
    var currentOptionIndex = 0;
    var currentOption = void 0,
        lastOptionIndex = void 0;

    // valid option values
    var VALID_VALUES = {
      autocomplete: ['list', 'inline', 'both']
    };

    // options
    var OPTIONS = {
      autocomplete: element.getAttribute('autocomplete'),
      wrapFocus: element.hasAttribute('wrap-focus')
    };

    if (VALID_VALUES.autocomplete.indexOf(OPTIONS.autocomplete) === -1) {
      OPTIONS.autocomplete = VALID_VALUES.autocomplete[0];
    }

    // add role and state for the combobox (input field)
    var combobox = root.querySelector('[role="combobox"]');
    combobox.setAttribute('aria-activedescendant', OPTIONS_ID + optionUid);
    combobox.setAttribute('aria-autocomplete', OPTIONS.autocomplete);
    combobox.setAttribute('aria-expanded', false);
    combobox.setAttribute('aria-owns', LISTBOX_ID + listboxUid);
    combobox.setAttribute('aria-controls', LISTBOX_ID + listboxUid);

    // set role and state for the listbox (list of choices)
    var listbox = root.querySelector('[role="listbox"]');
    listbox.setAttribute('aria-hidden', true);
    listbox.setAttribute('id', LISTBOX_ID + listboxUid);

    // set role and state for each option
    var options = Array.from(listbox.children);
    for (var i = 0, option; option = options[i]; i++) {
      option.setAttribute('aria-selected', false);
      option.setAttribute('id', OPTIONS_ID + (optionUid + i));
      option.setAttribute('role', 'option');
    }

    listboxUid++;
    optionUid += options.length;
    currentOption = options[0];

    // if focus wraps, the text field becomes a focusable option
    if (OPTIONS.wrapFocus) {
      options.unshift(combobox);
      currentOptionIndex = 1; // initial focus should be first option in the list
    }

    lastOptionIndex = options.length - 1;

    // keyboard events
    root.addEventListener('keydown', function (e) {

      // alt + up/down arrow - open listbox
      if (e.altKey && (e.which === up || e.which === down)) {
        e.preventDefault();
        toggleListbox();

        return;
      }

      // remaining combobox keyboard interactions can only happen when the listbox is opened
      if (combobox.getAttribute('aria-expanded') === 'true') {
        switch (e.which) {

          // up arrow - move focus to previous option
          case up:
            e.preventDefault();

            // optionally wrap focus
            if (OPTIONS.wrapFocus) {
              currentOptionIndex = currentOptionIndex === 0 ? lastOptionIndex : currentOptionIndex - 1;
            } else {
              currentOptionIndex = currentOptionIndex === 0 ? 0 : currentOptionIndex - 1;
            }

            updateFocusState();
            break;

          // down arrow - move focus to next option
          case down:
            e.preventDefault();

            // optionally wrap focus
            if (OPTIONS.wrapFocus) {
              currentOptionIndex = currentOptionIndex === lastOptionIndex ? 0 : currentOptionIndex + 1;
            } else {
              currentOptionIndex = currentOptionIndex === lastOptionIndex ? lastOptionIndex : currentOptionIndex + 1;
            }

            updateFocusState();
            break;
        }
      }
    });

    /**
     * Update the state of the currently selected option.
     */
    function updateFocusState() {
      var event = void 0;

      // update states
      currentOption.setAttribute('aria-selected', false);

      event = new CustomEvent('combobox-option-blurred', { detail: currentOption });
      root.dispatchEvent(event);

      currentOption = options[currentOptionIndex];
      currentOption.setAttribute('aria-selected', true);

      // only set active descendant if an option is selected (wrap focus will make
      // the text filed a focusable option)
      combobox.setAttribute('aria-activedescendant', currentOption.id);

      event = new CustomEvent('combobox-option-focused', { detail: currentOption });
      root.dispatchEvent(event);
    }

    /**
     * Open the listbox.
     */
    function toggleListbox() {
      var event = void 0;

      // open listbox
      if (combobox.getAttribute('aria-expanded') === 'false') {
        combobox.setAttribute('aria-expanded', true);
        listbox.setAttribute('aria-hidden', false);

        event = new CustomEvent('combobox-expanded');
      }
      // close listbox
      else {
          combobox.setAttribute('aria-expanded', false);
          listbox.setAttribute('aria-hidden', true);

          event = new CustomEvent('combobox-collapsed');
        }

      root.dispatchEvent(event);
    }
  }

  exports.combobox = combobox;

  Object.defineProperty(exports, '__esModule', { value: true });
});