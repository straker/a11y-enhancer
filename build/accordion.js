'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (global, factory) {
  (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : factory(global.a11yEnhancer = global.a11yEnhancer || {});
})(undefined, function (exports) {
  'use strict';

  // define commonly used keycodes for interacting with components

  var enter = 13;

  var space = 32;

  var end = 35;
  var home = 36;
  var left = 37;
  var up = 38;
  var right = 39;
  var down = 40;

  var TAB_ID = 'tab-heading';
  var PANEL_ID = 'tab-panel';

  // unique id for each tab/tabpanel pair
  var uid = 1;

  /**
   * Implements an accessible accordion menu with proper state and focus support.
   * @see https://www.w3.org/TR/wai-aria-practices-1.1/#accordion
   *
   * @param {HTMLElement} element - Container element of the accordion.
   *
   * For this to work, each accordion heading must be given the role="tab" and each
   * accordion menu must be given the role="tabpanel". From this, the code will
   * assume that sibling tab + tabpanel elements are related, so ensure each tab's
   * panel follows it without another tab in between.
   *
   * Optional attributes on container element
   *
   *    wrap-focus - wraps the accordion roving tabindex when on the first/last heading
   *    expanded - defaults all accordions to be expanded
   *    multiple - multiple menus can be expanded
   *
   * Events will pass the target element as the detail property of the event
   *
   *    accordion-expanded - fired when an accordion panel is expanded
   *    accordion-collapsed - fired when an accordion panel is collapsed
   *    accordion-focused - fired when an accordion heading is selected
   *    accordion-blurred - fired when an accordion heading is unselected
   *
   * Example
   *
   *  <div>
   *
   *    <h3 role="tab">Heading 1</h3>
   *    <div role="tabpanel">Lorium ipsum dolores.</div>
   *
   *    <h3 role="tab">Heading 2</h3>
   *    <div role="tabpanel">Lorium ipsum dolores.</div>
   *
   *  </div>
   *
   * Will be upgraded to
   *
   *  <div role="tablist" aria-multiselectable="true">
   *
   *    <h3 id="tab-heading1" role="tab" aria-expanded="true" aria-selected="true" tabindex="0">Heading 1</h3>
   *    <div role="tabpanel" aria-labelledby="tab-heading1" aria-hidden="false">
   *      Lorium ipsum dolores.
   *    </div>
   *
   *    <h3 id="tab-heading2" role="tab" aria-expanded="false" aria-selected="false" tabindex="-1">Heading 2</h3>
   *    <div role="tabpanel" aria-labelledby="tab-heading2" aria-hidden="true">
   *      Lorium ipsum dolores.
   *    </div>
   *
   *  </div>
   */
  function accordion(element) {
    // ensure we are a DOM element and have proper element functions
    if (!element instanceof HTMLElement) return;

    // states
    var currentTabIndex = 0;
    var currentTab = void 0,
        lastTabIndex = void 0;

    // options
    var options = {
      wrapFocus: element.hasAttribute('wrap-focus'),
      expanded: element.hasAttribute('expanded'),
      multiple: element.hasAttribute('multiple')
    };

    // add role and state for the parent
    element.setAttribute('role', 'tablist');
    element.setAttribute('aria-multiselectable', options.multiple);

    // set role and state for each tab
    var tabs = Array.from(element.querySelectorAll('[role="tab"]'));
    for (var i = 0, tab$$1; tab$$1 = tabs[i]; i++) {
      tab$$1.setAttribute('aria-expanded', options.expanded ? true : false);
      tab$$1.setAttribute('aria-selected', i === 0 ? true : false);
      tab$$1.setAttribute('aria-controls', PANEL_ID + (uid + i));
      tab$$1.setAttribute('tabindex', i === 0 ? 0 : -1);
      tab$$1.setAttribute('id', TAB_ID + (uid + i));
    }

    // set role and state for each tabpanel
    var panels = element.querySelectorAll('[role="tabpanel"]');
    for (var _i = 0, panel; panel = panels[_i]; _i++) {
      panel.setAttribute('aria-labelledby', TAB_ID + (uid + _i));
      panel.setAttribute('aria-hidden', options.expanded ? false : true);
      panel.setAttribute('id', PANEL_ID + (uid + _i));
    }

    uid += tabs.length;
    currentTab = tabs[0];
    lastTabIndex = tabs.length - 1;

    // keyboard events
    element.addEventListener('keydown', function (e) {

      switch (e.which) {
        // left/up arrow - move focus to previous heading when heading is selected
        case left:
        case up:
          if (e.target.getAttribute('role') === 'tab') {

            // optionally wrap focus
            if (options.wrapFocus) {
              currentTabIndex = currentTabIndex === 0 ? lastTabIndex : currentTabIndex - 1;
            } else {
              currentTabIndex = currentTabIndex === 0 ? 0 : currentTabIndex - 1;
            }

            updateFocusState();
          }

          break;

        // right/down arrow - move focus to next heading when heading is selected
        case right:
        case down:
          if (e.target.getAttribute('role') === 'tab') {

            // optionally wrap focus
            if (options.wrapFocus) {
              currentTabIndex = currentTabIndex === lastTabIndex ? 0 : currentTabIndex + 1;
            } else {
              currentTabIndex = currentTabIndex === lastTabIndex ? lastTabIndex : currentTabIndex + 1;
            }

            updateFocusState();
          }

          break;

        // end - move focus to last heading when heading is selected
        case end:
          if (e.target.getAttribute('role') === 'tab') {
            currentTabIndex = lastTabIndex;

            updateFocusState();
          }

          break;

        // home - move focus to first heading when heading is selected
        case home:
          if (e.target.getAttribute('role') === 'tab') {
            currentTabIndex = 0;

            updateFocusState();
          }

          break;

        // enter/space - toggle accordion expansion when heading is selected
        case enter:
        case space:
          if (e.target.getAttribute('role') === 'tab') {
            toggleTabPanel(currentTab);
          }

          break;
      }
    }, true);

    // mouse events
    element.addEventListener('mousedown', function (e) {

      // update the currently focused item and toggle the panel when heading is selected
      if (e.target.getAttribute('role') === 'tab') {
        currentTabIndex = tabs.indexOf(e.target);

        updateFocusState();
        toggleTabPanel(currentTab);
      }
    }, true);

    /**
     * Update the state of the currently selected tab.
     */
    function updateFocusState() {
      var event = void 0;

      // update states and roving tab index
      currentTab.setAttribute('aria-selected', false);
      currentTab.setAttribute('tabindex', -1);

      event = new CustomEvent('accordion-blurred', { detail: currentTab });
      element.dispatchEvent(event);

      currentTab = tabs[currentTabIndex];
      currentTab.setAttribute('aria-selected', true);
      currentTab.setAttribute('tabindex', 0);
      currentTab.focus();

      event = new CustomEvent('accordion-focused', { detail: currentTab });
      element.dispatchEvent(event);
    }

    /**
     * Open or close the currently selected tab panel.
     */
    function toggleTabPanel(tab$$1) {
      var panel = element.querySelector('#' + tab$$1.getAttribute('aria-controls'));
      var event = void 0;

      // open panel
      if (tab$$1.getAttribute('aria-expanded') === 'false') {

        // close other open tab before opening this one
        if (!options.multiple && element.querySelector('[aria-expanded="true"]')) {
          var openPanel = element.querySelector('[aria-expanded="true"]');
          toggleTabPanel(openPanel);
        }

        tab$$1.setAttribute('aria-expanded', true);
        panel.setAttribute('aria-hidden', false);

        event = new CustomEvent('accordion-expanded', { detail: tab$$1 });
      }
      // close panel
      else {
          tab$$1.setAttribute('aria-expanded', false);
          panel.setAttribute('aria-hidden', true);

          event = new CustomEvent('accordion-collapsed', { detail: tab$$1 });
        }

      element.dispatchEvent(event);
    }
  }

  exports.accordion = accordion;

  Object.defineProperty(exports, '__esModule', { value: true });
});