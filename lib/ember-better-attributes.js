(function() {

var normalizePath = Ember.Handlebars.normalizePath,
    handlebarsGet = Ember.Handlebars.get,
    schedule      = Ember.run.once,
    typeOf        = Ember.typeOf;

Ember.Handlebars.registerHelper('id', function(id, options) {
  if (arguments.length === 1) {
    options = id;
    id = "ember-" + (++Ember.uuid);
    options.data.buffer.push('id="' + id + '" ');
  }

  options.data.scopedId = id;

  options.fn(this);

  delete options.data.generatedId;
});

function assertValidAttribute(value) {
  var type = typeOf(value);
  Ember.assert("Attributes must be numbers, strings or booleans, not " + value + " (" + type + ")", value === null || value === undefined || type === 'number' || type === 'string' || type === 'boolean');
}

Ember.Handlebars.registerHelper('bind-attribute', function(name, path, options) {
  var normalized = normalizePath(this, path, options.data),
      root = normalized.root,
      id = options.data.scopedId,
      view = options.data.view;

  path = normalized.path;

  var value = (path === 'this') ? root : handlebarsGet(root, path, options);
  assertValidAttribute(value);

  function updateAttribute() {
    var newValue = handlebarsGet(root, path, options);
    assertValidAttribute(newValue);

    var elem = Ember.$('#' + id);
    Ember.View.applyAttributeBindings(elem, name, newValue);
  }

  if (path !== 'this') {
    view.registerObserver(root, path, function() {
      schedule('render', updateAttribute);
    });
  }

  return value;
});

})();
