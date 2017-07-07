/**
 * Define commonly used keycodes for interacting with components.
 */
var KEYS = {
  tab: 9,
  enter: 13,
  esc: 27,
  space: 32,
  pageup: 33,
  pagedown: 34,
  end: 35,
  home: 36,
  left: 37,
  up: 38,
  right: 39,
  down: 40
};

/**
 * Load a fixture for the test.
 * @param {string} name - Name of the fixture (base/test/fixtures/ is implied).
 * @param {function} callback - Callback function. Passed the container element.
 */
function loadFixture(name, callback) {
  var req = new XMLHttpRequest();

  req.addEventListener('load', function() {
    if (req.status !== 200) {
      throw new Error('failed to load accordion fixture: ' + req.responseText);
    }

    var el = document.createElement('div');
    el.innerHTML = req.responseText;

    callback(el.children[0]);
  });

  req.open('GET', 'base/test/fixtures/' + name + '.html', true);
  req.send();
}