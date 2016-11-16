window.allyComponents = (function(allyComponents) {
  const TAB_ID = 'tab-heading';

  // unique id for each tab/tabpanel pair
  let uid = 1;

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
   * Optional attributes
   *
   *    wrap-focus - wraps the accordion roving tabindex when on the first/last heading
   *
   * Events will pass the target element as the detail property of the event
   *
   *    accordion-expanded - fired when an accordion panel is expanded
   *    accordion-collapsed - fired when an accordion panel is collapsed
   *    accordion-focused - fired when an accordion heading is selected
   *    accordion-blurred - fired when an accordion heading is unselected
   *
   * @example
   *  <div role="tablist" aria-multiselectable="true">
   *
   *    <h3 id="tab-heading0" role="tab" aria-expanded="true" aria-selected="true" tabindex="0">Heading 1</h3>
   *    <div role="tabpanel" aria-labelledby="tab-heading0" aria-hidden="false">
   *      Lorium ipsum dolores.
   *    </div>
   *
   *    <h3 id="tab-heading1" role="tab" aria-expanded="false" aria-selected="false" tabindex="-1">Heading 2</h3>
   *    <div role="tabpanel" aria-labelledby="tab-heading1" aria-hidden="true">
   *      Lorium ipsum dolores.
   *    </div>
   *
   *  </div>
   */
  allyComponents.accordion = function(element) {
    // ensure we are a DOM element and have proper element functions
    if (!element instanceof HTMLElement) return;

    // states
    let currentTabIndex = 0;
    let wrapFocus = element.hasAttribute('wrap-focus');
    let currentTab, lastTabIndex;

    // add role and state for the parent
    element.setAttribute('role', 'tablist');
    element.setAttribute('aria-multiselectable', true);

    // set role and state for each tab
    let tabs = Array.from(element.querySelectorAll('[role="tab"]'));
    for (let i = 0, tab; (tab = tabs[i]); i++) {
      tab.setAttribute('aria-expanded', false);
      tab.setAttribute('aria-selected', false);
      tab.setAttribute('tabindex', (i === 0 ? 0 : -1));
      tab.setAttribute('id', TAB_ID + (uid + i));
    }

    // set role and state for each tabpanel
    let panels = element.querySelectorAll('[role="tabpanel"]');
    for (let i = 0, panel; (panel = panels[i]); i++) {
      panel.setAttribute('aria-labelledby', TAB_ID + (uid + i));
      panel.setAttribute('aria-hidden', true);
    }

    uid += tabs.length;
    currentTab = tabs[0];
    lastTabIndex = tabs.length - 1;

    // keyboard events
    element.addEventListener('keydown', e => {

      switch (e.which) {
        // left/up arrow - move focus to previous heading when heading is selected
        case this.keys.left:
        case this.keys.up:
          if (e.target.getAttribute('role') === 'tab') {

            // optionally wrap focus
            if (wrapFocus) {
              currentTabIndex = (currentTabIndex === 0 ? lastTabIndex : currentTabIndex - 1);
            }
            else {
              currentTabIndex = (currentTabIndex === 0 ? 0 : currentTabIndex - 1);
            }

            updateFocusState();
          }

          break;

        // right/down arrow - move focus to next heading when heading is selected
        case this.keys.right:
        case this.keys.down:
          if (e.target.getAttribute('role') === 'tab') {

            // optionally wrap focus
            if (wrapFocus) {
              currentTabIndex = (currentTabIndex === lastTabIndex ? 0 : currentTabIndex + 1);
            }
            else {
              currentTabIndex = (currentTabIndex === lastTabIndex ? lastTabIndex : currentTabIndex + 1);
            }

            updateFocusState();
          }

          break;

          // end - move focus to last heading when heading is selected
          case this.keys.end:
            if (e.target.getAttribute('role') === 'tab') {
              currentTabIndex = lastTabIndex;

              updateFocusState();
            }

            break;

          // home - move focus to first heading when heading is selected
          case this.keys.home:
            if (e.target.getAttribute('role') === 'tab') {
              currentTabIndex = 0;

              updateFocusState();
            }

            break;

          // enter/space - toggle accordion expansion when heading is selected
          case this.keys.enter:
          case this.keys.space:
            if (e.target.getAttribute('role') === 'tab') {
              toggleTabPanel();
            }

            break;
      }

    }, true);

    // mouse events
    element.addEventListener('mousedown', e => {

      // update the currently focused item and toggle the panel when heading is selected
      if (e.target.getAttribute('role') === 'tab') {
        currentTabIndex = tabs.indexOf(e.target);

        updateFocusState();
        toggleTabPanel();
      }

    }, true);

    /**
     * Update the state of the currently selected tab.
     */
    function updateFocusState() {
      let event;

      // update states and roving tab index
      currentTab.setAttribute('aria-selected', false);
      currentTab.setAttribute('tabindex', -1);

      event = new CustomEvent('accordion-blurred', {detail: currentTab});
      element.dispatchEvent(event);

      currentTab = tabs[currentTabIndex];
      currentTab.setAttribute('aria-selected', true);
      currentTab.setAttribute('tabindex', 0);
      currentTab.focus();

      event = new CustomEvent('accordion-focused', {detail: currentTab});
      element.dispatchEvent(event);
    }

    /**
     * Open or close the currently selected tab panel.
     */
    function toggleTabPanel() {
      let panel = element.querySelector('[aria-labelledby="' + currentTab.getAttribute('id') + '"]');
      let event;

      // open panel
      if (currentTab.getAttribute('aria-expanded') === 'false') {
        currentTab.setAttribute('aria-expanded', true);
        panel.setAttribute('aria-hidden', false);

        event = new CustomEvent('accordion-expanded', {detail: currentTab});
      }
      // close panel
      else {
        currentTab.setAttribute('aria-expanded', false);
        panel.setAttribute('aria-hidden', true);

        event = new CustomEvent('accordion-collapsed', {detail: currentTab});
      }

      element.dispatchEvent(event);
    }

  }

  return allyComponents;

})(window.allyComponents || {});