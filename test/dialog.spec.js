describe('dialog', function() {
  var fixtureEl, el, dialog;

  // load the fixture
  before(function(done) {
    loadFixture('dialog', function(element) {
      fixtureEl = element;
      done();
    });
  });

  // setup the element for each test
  beforeEach(function() {
    el = fixtureEl.cloneNode(true);
    a11yEnhancer.dialog(el);

    dialog = el.querySelector('[role="dialog"]');
  });

  afterEach(function() {
    dialog.close();
    dialog.remove();
    dialog = null;
  });





  describe('keyboard, mouse, and AIRA support', function() {

    it ('should add tabindex=-1 to the dialog', function() {
      expect(dialog.getAttribute('tabindex')).to.equal('-1');
    });

    it('should add aria-labelledby to the dialog which points to the first header', function() {
      var title = dialog.querySelector('h1,h2,h3,h4,h5,h6');
      expect(title.hasAttribute('id')).to.be.true;
      expect(dialog.getAttribute('aria-labelledby')).to.equal(title.getAttribute('id'));
    });

    it('should have open and close functions', function() {
      expect(typeof dialog.open).to.equal('function');
      expect(typeof dialog.close).to.equal('function');
    });

    it('should move the dialog to the body if not a child of body', function() {
      var div = document.createElement('div');
      document.body.appendChild(div);
      div.appendChild(dialog);

      expect(dialog.parentElement).to.equal(div);

      a11yEnhancer.dialog(dialog);

      expect(dialog.parentElement).to.equal(document.body);
    });

    it('should add the open attribute when the dialog is opened', function() {
      dialog.open();
      expect(dialog.hasAttribute('open')).to.be.true;
    });

    it('should move focus to the dialog when opened if no element has autofocus', function() {
      dialog.open();
      expect(document.activeElement).to.equal(dialog);
    });

    it('should move focus to the elemtn with autofocus when opened', function() {
      var button = dialog.querySelector('button');
      button.setAttribute('autofocus', '');

      dialog.open();
      expect(document.activeElement).to.equal(button);
    });

    it('should return focus to the element that opened the dialog when it closes', function() {
      var button = document.createElement('button');
      document.body.appendChild(button);
      button.focus();

      expect(document.activeElement).to.equal(button);

      dialog.open();

      expect(document.activeElement).to.not.equal(button);

      dialog.close();

      expect(document.activeElement).to.equal(button);
    });

    it('should add the inert attribute to all siblings when opened and remove it when closed', function() {
      var children = Array.from(document.body.children);
      children.forEach(function(child) {
        expect(child.hasAttribute('inert')).to.be.false;
      });

      dialog.open();

      children.forEach(function(child) {
        if (child !== el) {  // el because the dialog code moves the passed in element to body
          expect(child.hasAttribute('inert')).to.be.true;
        }
      });

      dialog.close();

      children.forEach(function(child) {
        expect(child.hasAttribute('inert')).to.be.false;
      });
    });

    it('should not add the inert attribute if the modal is of type modeless', function() {
      dialog.setAttribute('modeless', '');
      a11yEnhancer.dialog(dialog);

      dialog.open();

      Array.from(document.body.children).forEach(function(child) {
        expect(child.hasAttribute('inert')).to.be.false;
      });
    });

    it('should close the dialog with the esc key', function() {
      dialog.open();

      var event = new Event('keydown', {bubbles: true});
      event.which = KEYS.esc;
      dialog.dispatchEvent(event);

      expect(dialog.hasAttribute('open')).to.be.false;
    });

    it('should close the modal when clicking outside of it', function() {
      dialog.open();

      el.dispatchEvent( new Event('click', {bubbles: true}) );

      expect(dialog.hasAttribute('open')).to.be.false;
    });

    it('should not close the modal when clicking inside of it', function() {
      dialog.open();

      dialog.dispatchEvent( new Event('click', {bubbles: true}) );

      expect(dialog.hasAttribute('open')).to.be.true;
    });

  });





  describe('events', function() {

    it('should fire the "dialog-opened" event when the dialog is opened', function() {
      // timeout after 1 second if the event is not triggered
      this.timeout(1000);

      el.addEventListener('dialog-opened', function(e) {
        expect(e.detail).to.equal(dialog);

        done();
      });

      dialog.open();
    });

    it('should fire the "dialog-closed" event when the dialog is closed', function() {
      // timeout after 1 second if the event is not triggered
      this.timeout(1000);

      el.addEventListener('dialog-closed', function(e) {
        expect(e.detail).to.equal(dialog);

        done();
      });

      dialog.open();
      dialog.close();
    });

  });

});