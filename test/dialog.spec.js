describe('dialog', function() {
  let fixtureEl, dialog;

  // load the fixture
  before(function(done) {
    loadFixture('dialog', function(element) {
      fixtureEl = element;
      done();
    });
  });

  // setup the element for each test
  beforeEach(function() {
    dialog = fixtureEl.cloneNode(true);
    a11yEnhancer.dialog(dialog);

    document.body.appendChild(dialog);
  });

  afterEach(function(done) {
    dialog.close();
    dialog.remove();
    dialog = null;

    // since inert cleanup is on a setTimeout, we need to wait for it to complete
    // before moving on with the tests
    setTimeout(function() {
      done();
    }, 150)
  });





  describe('functionality, and keyboard and AIRA support', function() {

    it ('should add tabindex=-1 to the dialog', function() {
      expect(dialog.getAttribute('tabindex')).to.equal('-1');
    });

    it('should add aria-hidden to the dialog', function() {
      expect(dialog.hasAttribute('aria-hidden')).to.be.true;
    });

    it('should add aria-labelledby to the dialog which points to the first header', function() {
      let title = dialog.querySelector('h1,h2,h3,h4,h5,h6');
      expect(title.hasAttribute('id')).to.be.true;
      expect(dialog.getAttribute('aria-labelledby')).to.equal(title.getAttribute('id'));
    });

    it('should not throw an error if there is no header', function() {
      dialog = fixtureEl.cloneNode(true);
      dialog.querySelector('h1').remove();

      let fn = function() {
        a11yEnhancer.dialog(dialog);
      }

      expect(fn).to.not.throw();
    });

    it('should not throw errors when called without parameters', function() {
      let fn = function() {
        a11yEnhancer.dialog();
      }

      expect(fn).to.not.throw();
    });

    it('should allow you to pass in a shadow root', function() {
      dialog = fixtureEl.cloneNode(true);

      let div = document.createElement('div');
      let shadow = div.attachShadow({mode: 'closed'});
      shadow.appendChild(dialog);
      a11yEnhancer.dialog(div, shadow);

      expect(shadow.querySelector('[role=dialog]').getAttribute('tabindex')).to.equal('-1');

      // for cleanup, make dialog equal the div that has the close function
      dialog = div;
    });

    it('should have open and close functions', function() {
      expect(typeof dialog.open).to.equal('function');
      expect(typeof dialog.close).to.equal('function');
    });

    it('should remove the aria-hidden attribute when the dialog is opened', function() {
      dialog.open();
      expect(dialog.hasAttribute('aria-hidden')).to.be.false;
    });

    it('should move focus to the dialog when opened if no element has autofocus', function(done) {
      // timeout after 1 second if the event is not triggered
      this.timeout(1000);

      dialog.open();

      // ensure the event has had time to trigger
      setTimeout(function() {
        expect(document.activeElement).to.equal(dialog);
        done();
      }, 100);
    });

    it('should move focus to the element with autofocus when opened', function(done) {
      // timeout after 1 second if the event is not triggered
      this.timeout(1000);

      let button = dialog.querySelector('button');
      button.setAttribute('autofocus', '');

      dialog.open();

      // ensure the event has had time to trigger
      setTimeout(function() {
        expect(document.activeElement).to.equal(button);
        done();
      }, 100);
    });

    it('should return focus to the element that opened the dialog when it closes', function(done) {
      // timeout after 1 second if the event is not triggered
      this.timeout(1000);

      let button = document.createElement('button');
      document.body.appendChild(button);
      button.focus();

      expect(document.activeElement).to.equal(button);

      dialog.open();

      // ensure the event has had time to trigger
      setTimeout(function() {
        expect(document.activeElement).to.not.equal(button);

        dialog.close();

        setTimeout(function() {
          expect(document.activeElement).to.equal(button);
          done();
        }, 100);
      }, 100);
    });

    it('should not open the dialog twice', function(done) {
      let count = 0;

      dialog.addEventListener('dialog-opened', function(e) {
        count++;
      });

      dialog.open();
      dialog.open();

      // ensure the event has had time to trigger
      setTimeout(function() {
        expect(count).to.equal(1);
        done();
      }, 500);
    });

    it('should find the dialog if it\'s a child of the element', function() {
      dialog = fixtureEl.cloneNode(true);

      let div = document.createElement('div');
      div.appendChild(dialog);

      a11yEnhancer.dialog(div);

      expect(dialog.getAttribute('tabindex')).to.equal('-1');

      // for cleanup, make dialog equal the div that has the close function
      dialog = div;
    });





    describe('modal', function() {

      it('should default to type modal', function() {
        expect(dialog.type).to.equal('modal');
      });

      it('should add the inert attribute to all siblings when opened and remove it when closed', function(done) {
        let children = Array.from(document.body.children);
        children.forEach(function(child) {
          expect(child.hasAttribute('inert')).to.be.false;
        });

        dialog.open();

        children.forEach(function(child) {
          if (child !== dialog) {
            expect(child.hasAttribute('inert')).to.be.true;
          }
        });

        dialog.close();

        setTimeout(function() {
          children.forEach(function(child) {
            expect(child.hasAttribute('inert')).to.be.false;
          });

          done();
        }, 200);
      });

      it('should remove inert from a dialogs subtree when opened and reinert on close', function(done) {
        var dialog2 = fixtureEl.cloneNode(true);
        a11yEnhancer.dialog(dialog2);

        var div = document.createElement('div');
        div.appendChild(dialog2);

        document.body.appendChild(div);

        dialog.open();

        expect(div.hasAttribute('inert')).to.be.true;

        dialog2.open();

        expect(div.hasAttribute('inert')).to.be.false;

        dialog2.close();

        setTimeout(function() {
          expect(div.hasAttribute('inert')).to.be.true;

          done();
        }, 200);
      });

      it('should inert all subtrees except the dialogs and remove it when closed', function(done) {
        var div = document.createElement('div');
        div.innerHTML = `
          <section></section>
          <section></section>
          <div>
            <section></section>
          </div>`;

        div.querySelector('div').appendChild(dialog);
        document.body.appendChild(div);

        dialog.open();

        expect(div.hasAttribute('inert')).to.be.false;
        expect(div.querySelector('div').hasAttribute('inert')).to.be.false;
        Array.from(div.querySelectorAll('section')).forEach(function(section) {
          expect(section.hasAttribute('inert')).to.be.true;
        });

        dialog.close();

        setTimeout(function() {
          expect(div.hasAttribute('inert')).to.be.false;
          expect(div.querySelector('div').hasAttribute('inert')).to.be.false;
          Array.from(div.querySelectorAll('section')).forEach(function(section) {
            expect(section.hasAttribute('inert')).to.be.false;
          });

          done();
        }, 200);
      });

      it('should close the dialog with the esc key', function() {
        dialog.open();

        let event = new Event('keydown', {bubbles: true});
        event.which = KEYS.esc;
        dialog.dispatchEvent(event);

        expect(dialog.hasAttribute('aria-hidden')).to.be.true;
      });

      it('should not close the dialog with any key', function() {
        dialog.open();

        let event = new Event('keydown', {bubbles: true});
        event.which = 1;
        dialog.dispatchEvent(event);

        expect(dialog.hasAttribute('aria-hidden')).to.be.false;
      });

    });





    describe('modeless', function() {

      it('should allow type of modeless', function() {
        dialog.setAttribute('type', 'modeless');
        a11yEnhancer.dialog(dialog);

        expect(dialog.type).to.equal('modeless');
      });

      it('should not move the dialog to the body if not a child of body', function() {
        dialog.setAttribute('type', 'modeless');
        a11yEnhancer.dialog(dialog);

        let div = document.createElement('div');
        document.body.appendChild(div);
        div.appendChild(dialog);

        expect(dialog.parentElement).to.equal(div);

        a11yEnhancer.dialog(dialog);

        expect(dialog.parentElement).to.equal(div);
      });

      it('should not add the inert attribute if the modal is of type modeless', function() {
        dialog.setAttribute('type', 'modeless');
        a11yEnhancer.dialog(dialog);

        dialog.open();

        Array.from(document.body.children).forEach(function(child) {
          expect(child.hasAttribute('inert')).to.be.false;
        });
      });

      it('should not close the dialog with the esc key', function() {
        dialog.setAttribute('type', 'modeless');
        a11yEnhancer.dialog(dialog);

        dialog.open();

        let event = new Event('keydown', {bubbles: true});
        event.which = KEYS.esc;
        dialog.dispatchEvent(event);

        expect(dialog.hasAttribute('aria-hidden')).to.be.false;
      });

    });

  });





  describe('events', function() {

    it('should fire the "dialog-opened" event when the dialog is opened', function(done) {
      // timeout after 1 second if the event is not triggered
      this.timeout(1000);

      dialog.addEventListener('dialog-opened', function(e) {
        expect(e.target).to.equal(dialog);

        done();
      });

      dialog.open();
    });

    it('should fire the "dialog-closed" event when the dialog is closed', function(done) {
      // timeout after 1 second if the event is not triggered
      this.timeout(1000);

      dialog.addEventListener('dialog-closed', function(e) {
        expect(e.target).to.equal(dialog);

        done();
      });

      dialog.open();
      dialog.close();
    });

  });

});