/*jshint boss:true*/

(function() {

var normalizePath       = Ember.Handlebars.normalizePath,
    handlebarsGet       = Ember.Handlebars.get,
    schedule            = Ember.run.once,
    typeOf              = Ember.typeOf,
    classStringForValue = Ember.View._classStringForValue;

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

Ember.Handlebars.registerHelper('bind-class', function(path, options) {
  var normalized = normalizePath(this, path, options),
      root = normalized.root,
      id = options.data.scopedId,
      view = options.data.view,
      truthy = options.hash.truthy,
      falsy = options.hash.falsy;

  Ember.assert("If you pass `this` as the path to `bind-class`, you must specify class names to use for truthy and falsy values using the `truthy=` and `falsy=` hash parameter", path !== '' || (truthy && falsy));

  path = normalized.path;

  var value = (path === 'this') ? root : handlebarsGet(root, path, options);
  var classString = classStringForValue(path, value, truthy, falsy);

  function updateClass() {
    var newValue = handlebarsGet(root, path, options),
        elem = Ember.$('#' + id),
        newClass;

    if (classString) {
      elem.removeClass(classString);
    }

    classString = classStringForValue(path, newValue, truthy, falsy);
    elem.addClass(classString);
  }

  if (path !== 'this') {
    view.registerObserver(root, path, function() {
      schedule('render', updateClass);
    });
  }

  options.data.buffer.push(classString);
});

function processAttributes(attributes) {
  var info = {};

  for (var i=0, l=attributes.length; i<l; i++) {
    var attribute = attributes[i],
        value = attribute[1];

    if (/\{\{.*\}\}/.test(value)) { info.bindings = true; }
    if (attribute === 'id') { info.id = value; }
  }

  return info;
}

HTML5Tokenizer.configure('generateAttributes', function(attributes) {
  var info = processAttributes(attributes), id;

  out = "";

  if (info.bindings) {
    id = info.id ? ' "' + info.id + '"' : "";
    out += "{{#id" + id + "}}";
  }

  out += HTML5Tokenizer.original.generateAttributes(attributes);

  if (info.bindings) {
    out += "{{/id}}";
  }

  return out;
});

HTML5Tokenizer.configure('generateAttribute', function(name, value) {
  if (name === 'class') {
    return generateClass(name, value);
  } else {
    return generateAttribute(name, value);
  }
});

function generateAttribute(name, value) {
  var binding = /^\{\{\s*([a-zA-Z0-9_$\-]+)\s*\}\}$/.exec(value);

  if (binding) {
    value = "{{bind-attribute '" + name + "' " + binding[1] + "}}";
    return name + '="' + value + '"';
  } else if (/\{\{/.test(value)) {
    return name + '="' + value + '"';
  }

  return HTML5Tokenizer.original.generateAttribute(name, value);
}

function matchNextClass(string) {
  if (string.slice(0,2) === "{{") {
    return string.match(/^(\{\{\s*.*?\s*\}\})\s*(.*)$/);
  } else if (string.length) {
    return string.match(/^([^ ]*)\s*(.*)$/);
  }
}

function generateClass(name, value) {
  var out = [], className;

  while (match = matchNextClass(value)) {
    out.push(generateOneClass(match[1]));
    value = match[2];
  }

  return 'class="' + out.join(" ") + '"';
}

function generateOneClass(value) {
  var binding = /^\{\{([a-zA-Z0-9_$\-]+)\}\}$/.exec(value);

  if (binding) {
    return "{{bind-class " + binding[1] + "}}";
  } else if (/\{\{/.test(value)) {
    return value;
  } else {
    return value.replace(/"/, '\\"');
  }
}

})();
