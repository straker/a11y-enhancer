describe('accordion', function() {
  var fixtureEl, el, tabs, panels;

  // load the fixture
  before(function(done) {
    loadFixture('accordion', function(element) {
      fixtureEl = element;
      done();
    });
  });

  // setup the element for each test
  beforeEach(function() {
    el = fixtureEl.cloneNode(true);
    a11yEnhancer.accordion(el);

    tabs = el.querySelectorAll('[role="tab"]');
    panels = el.querySelectorAll('[role="tabpanel"]');
  });






  describe('keyboard, mouse, and AIRA support', function() {

    it('should add "role=tablist" to the container', function() {
      expect(el.getAttribute('role')).to.equal('tablist');
    });

    it('should add all required ARIA attributes to the header', function() {
      expect(tabs[0].getAttribute('aria-controls')).to.equal(panels[0].id);
      expect(tabs[0].getAttribute('aria-expanded')).to.equal('false');
      expect(tabs[0].getAttribute('aria-selected')).to.equal('true');
    });

    it('should add all required ARIA attributes to the panel', function() {
      expect(panels[0].getAttribute('aria-hidden')).to.equal('true');
      expect(panels[0].getAttribute('aria-labelledby')).to.equal(tabs[0].id);
    });

    it('should move focus to the next header with right and down keys', function() {
      tabs[0].focus();  // move focus to the first header

      // right key
      var event = new Event('keydown', {bubbles: true});
      event.which = KEYS.right;
      tabs[0].dispatchEvent(event);

      expect(tabs[0].getAttribute('tabindex')).to.equal('-1');
      expect(tabs[0].getAttribute('aria-selected')).to.equal('false');

      expect(tabs[1].getAttribute('tabindex')).to.equal('0');
      expect(tabs[1].getAttribute('aria-selected')).to.equal('true');

      // down key
      event.which = KEYS.down;
      tabs[0].dispatchEvent(event);

      expect(tabs[1].getAttribute('tabindex')).to.equal('-1');
      expect(tabs[1].getAttribute('aria-selected')).to.equal('false');

      expect(tabs[2].getAttribute('tabindex')).to.equal('0');
      expect(tabs[2].getAttribute('aria-selected')).to.equal('true');
    });

    it('should move focus to the previous header with left and up keys', function() {
      tabs[0].focus();  // move focus to the first header

      // move focus down two headings
      var event = new Event('keydown', {bubbles: true});
      event.which = KEYS.down;
      tabs[0].dispatchEvent(event);
      tabs[0].dispatchEvent(event);

      // left key
      event.which = KEYS.left;
      tabs[0].dispatchEvent(event);

      expect(tabs[1].getAttribute('tabindex')).to.equal('0');
      expect(tabs[1].getAttribute('aria-selected')).to.equal('true');

      expect(tabs[2].getAttribute('tabindex')).to.equal('-1');
      expect(tabs[2].getAttribute('aria-selected')).to.equal('false');

      // up key
      event.which = KEYS.up;
      tabs[0].dispatchEvent(event);

      expect(tabs[0].getAttribute('tabindex')).to.equal('0');
      expect(tabs[0].getAttribute('aria-selected')).to.equal('true');

      expect(tabs[1].getAttribute('tabindex')).to.equal('-1');
      expect(tabs[1].getAttribute('aria-selected')).to.equal('false');
    });

    it('should move focus to the last and first header with end and home keys', function() {
      tabs[0].focus();  // move focus to the first header

      // end key
      var event = new Event('keydown', {bubbles: true});
      event.which = KEYS.end;
      tabs[0].dispatchEvent(event);

      expect(tabs[tabs.length-1].getAttribute('tabindex')).to.equal('0');
      expect(tabs[tabs.length-1].getAttribute('aria-selected')).to.equal('true');

      expect(tabs[0].getAttribute('tabindex')).to.equal('-1');
      expect(tabs[0].getAttribute('aria-selected')).to.equal('false');

      // home key
      event.which = KEYS.home;
      tabs[0].dispatchEvent(event);

      expect(tabs[0].getAttribute('tabindex')).to.equal('0');
      expect(tabs[0].getAttribute('aria-selected')).to.equal('true');

      expect(tabs[tabs.length-1].getAttribute('tabindex')).to.equal('-1');
      expect(tabs[tabs.length-1].getAttribute('aria-selected')).to.equal('false');
    });

    it('should open and close a panel with enter and space keys', function() {
      tabs[0].focus();  // move focus to the first header

      // end key
      var event = new Event('keydown', {bubbles: true});
      event.which = KEYS.enter;
      tabs[0].dispatchEvent(event);

      expect(tabs[0].getAttribute('aria-expanded')).to.equal('true');
      expect(panels[0].getAttribute('aria-hidden')).to.equal('false');

      // close
      event.which = KEYS.space;
      tabs[0].dispatchEvent(event);

      expect(tabs[0].getAttribute('aria-expanded')).to.equal('false');
      expect(panels[0].getAttribute('aria-hidden')).to.equal('true');
    });

    it('should open and close a panel with the mouse', function() {
      // open
      tabs[0].dispatchEvent( new Event('mousedown', {bubbles: true}) );

      expect(tabs[0].getAttribute('aria-expanded')).to.equal('true');
      expect(panels[0].getAttribute('aria-hidden')).to.equal('false');

      // close
      tabs[0].dispatchEvent( new Event('mousedown', {bubbles: true}) );

      expect(tabs[0].getAttribute('aria-expanded')).to.equal('false');
      expect(panels[0].getAttribute('aria-hidden')).to.equal('true');
    });
  });





  describe('events', function() {

    it('should fire an "accordion-expanded" event when a panel is expanded', function(done) {
      // timeout after 1 second if the event is not triggered
      this.timeout(1000);

      el.addEventListener('accordion-expanded', function(e) {
        expect(e.detail).to.equal(tabs[0]);

        done();
      });

      tabs[0].dispatchEvent( new Event('mousedown', {bubbles: true}) );
    });

    it('should fire an "accordion-collapsed" event when a panel is collapsed', function(done) {
      // timeout after 1 second if the event is not triggered
      this.timeout(1000);

      el.addEventListener('accordion-collapsed', function(e) {
        expect(e.detail).to.equal(tabs[0]);

        done();
      });

      // open then close the tab
      tabs[0].dispatchEvent( new Event('mousedown', {bubbles: true}) );
      tabs[0].dispatchEvent( new Event('mousedown', {bubbles: true}) );
    });

    it('should fire an "accordion-focused" event when a hander is focused', function(done) {
      // timeout after 1 second if the event is not triggered
      this.timeout(1000);

      el.addEventListener('accordion-focused', function(e) {
        expect(e.detail).to.equal(tabs[1]);

        done();
      });

      var event = new Event('keydown', {bubbles: true});
      event.which = KEYS.down;
      tabs[0].dispatchEvent(event);
    });

    it('should fire an "accordion-blurred" event when a hander is blurred', function(done) {
      // timeout after 1 second if the event is not triggered
      this.timeout(1000);

      el.addEventListener('accordion-blurred', function(e) {
        expect(e.detail).to.equal(tabs[0]);

        done();
      });

      var event = new Event('keydown', {bubbles: true});
      event.which = KEYS.down;
      tabs[0].dispatchEvent(event);
    });

  });

});