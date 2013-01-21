(function() {

Ember.TESTING = true;

Ember.Handlebars.registerHelper('test-id', function(options) {
  return options.data.scopedId;
});

var compile = Ember.Handlebars.compile,
    originalCompile = Ember.Handlebars.originalCompile;

function append(string, controller) {
  var template;

  if (string.match(/#id/)) {
    template = originalCompile(string);
  } else {
    template = compile(string);
  }

  var view = Ember.View.create({
    controller: controller,
    template: template
  });

  Ember.run(function() {
    view.appendTo('#qunit-fixture');
  });
}

function shouldHaveElement(selector, message) {
  var node = $(selector)[0];

  QUnit.push(!!node, node, selector, message);
}

function $(selector) {
  return Ember.$(selector, '#qunit-fixture');
}

function set(object, name, value) {
  Ember.run(function() {
    Ember.set(object, name, value);
  });
}

module("The {{#id}} helper");

test("generates an `id` for downstream usage", function() {
  append("<div {{#id}}data-id='{{test-id}}'{{/id}}>Contents</div>");

  shouldHaveElement('[data-id]');
  var id = $("[data-id]").attr('data-id');
  shouldHaveElement('[id="' + id + '"]');
});

test("takes an explicit `id` that it supplies downstream", function() {
  append('<div id="explicit" {{#id "explicit"}}data-id="{{test-id}}"{{/id}}>Contents</div>');

  shouldHaveElement('[id^="explicit"]');
  shouldHaveElement('[data-id="explicit"]');
});

module("The {{bind-attribute}} helper (used with #id)");

test("emits the initial value", function() {
  var controller = Ember.Object.create({ url: "http://example.com" });
  append("<a {{#id}}href='{{bind-attribute 'href' url}}'{{/id}}>click here</a>", controller);

  shouldHaveElement('a[href*="example.com"]');
});

test("emits the initial value (with a prefix and suffix)", function() {
  var controller = Ember.Object.create({ url: "example.com" });
  append("<a {{#id}}href='{{bind-attribute 'href' url prefix='http://' suffix='/'}}'{{/id}}>click here</a>", controller);

  shouldHaveElement('a[href="http://example.com/"]');
});

test("updates the initial value when it changes", function() {
  var controller = Ember.Object.create({ url: "http://example.com" });
  append("<a {{#id}}href='{{bind-attribute 'href' url}}'{{/id}}>click here</a>", controller);
  set(controller, 'url', "http://yehudakatz.com");

  shouldHaveElement('a[href*="yehudakatz.com"]');
});

test("updates the initial value when it changes (with a prefix and suffix)", function() {
  var controller = Ember.Object.create({ url: "example.com" });
  append("<a {{#id}}href='{{bind-attribute 'href' url prefix='http://' suffix='/'}}'{{/id}}>click here</a>", controller);
  set(controller, 'url', "yehudakatz.com");

  shouldHaveElement('a[href="http://yehudakatz.com/"]');
});

test("removes the attribute if the value becomes falsy", function() {
  var controller = Ember.Object.create({ url: "http://example.com" });
  append("<a {{#id}}href='{{bind-attribute 'href' url}}'{{/id}}>click here</a>", controller);
  set(controller, 'url', null);

  shouldHaveElement('a:not(href)');
});

test("makes the value the same as the name if the value becomes true", function() {
  var controller = Ember.Object.create({ url: "http://example.com" });
  append("<a {{#id}}href='{{bind-attribute 'href' url}}'{{/id}}>click here</a>", controller);
  set(controller, 'url', true);

  shouldHaveElement('a[href="href"]');
});

module("The {{bind-class}} helper (used with #id)");

test("when the class is a string, emits the string", function() {
  var controller = Ember.Object.create({ active: "active" });
  append("<div {{#id}}class='tab {{bind-class active}}'{{/id}}>Tab</div>", controller);

  shouldHaveElement('div.tab.active');
});

test("when the class is `this`, requires a truthy value", function() {
  raises(function() {
    var controller = Ember.Object.create();
    append("<div {{#id}}class='tab {{bind-class this}}'{{/id}}>Tab</div>", controller);
  }, /truthy/);
});

test("when the class is `this`, emits the truthy value", function() {
  var controller = Ember.Object.create();
  append("<div {{#id}}class='tab {{bind-class this truthy='active' falsy='inactive'}}'{{/id}}>Tab</div>", controller);

  shouldHaveElement('div.tab.active');
});

test("when a truthy name is specified and the value is truthy, emits the truthy value", function() {
  var controller = Ember.Object.create({ active: true });
  append("<div {{#id}}class='tab {{bind-class active truthy='active' falsy='inactive'}}'{{/id}}>Tab</div>", controller);

  shouldHaveElement('div.tab.active');
});

test("when a falsy name is specified and the value is falsy, emits the falsy value", function() {
  var controller = Ember.Object.create({ active: false });
  append("<div {{#id}}class='tab {{bind-class active truthy='active' falsy='inactive'}}'{{/id}}>Tab</div>", controller);

  shouldHaveElement('div.tab.inactive');
});

test("when the class is a string, updates the string", function() {
  var controller = Ember.Object.create({ active: "active" });
  append("<div {{#id}}class='tab {{bind-class active}}'{{/id}}>Tab</div>", controller);

  shouldHaveElement('div.tab.active');
});

test("when a falsy name is specified and the value is changed changed to falsy, updates to the falsy value", function() {
  var controller = Ember.Object.create({ active: true });
  append("<div {{#id}}class='tab {{bind-class active truthy='active' falsy='inactive'}}'{{/id}}>Tab</div>", controller);
  set(controller, 'active', false);

  shouldHaveElement('div.tab.inactive');
});

test("when a truthy name is specified and the value is changed to truthy, updates to the truthy value", function() {
  var controller = Ember.Object.create({ active: false });
  append("<div {{#id}}class='tab {{bind-class active truthy='active' falsy='inactive'}}'{{/id}}>Tab</div>", controller);
  set(controller, 'active', true);

  shouldHaveElement('div.tab.active');
});

module("Using the precompilation sugar for attributes");

test("emits the initial value", function() {
  var controller = Ember.Object.create({ url: "http://example.com" });
  append("<a href='{{url}}'>click here</a>", controller);

  shouldHaveElement('a[href*="example.com"]');
});

test("emits the initial value (with a prefix and suffix)", function() {
  var controller = Ember.Object.create({ url: "example.com" });
  append("<a href='http://{{url}}/'>click here</a>", controller);

  shouldHaveElement('a[href="http://example.com/"]');
});

test("updates the initial value when it changes", function() {
  var controller = Ember.Object.create({ url: "http://example.com" });
  append("<a href='{{url}}'>click here</a>", controller);
  set(controller, 'url', "http://yehudakatz.com");

  shouldHaveElement('a[href*="yehudakatz.com"]');
});

test("updates the initial value when it changes (with a prefix and suffix)", function() {
  var controller = Ember.Object.create({ url: "example.com" });
  append("<a href='http://{{url}}/'>click here</a>", controller);
  set(controller, 'url', "yehudakatz.com");

  shouldHaveElement('a[href="http://yehudakatz.com/"]');
});

test("double quotes in prefixes and suffixes", function() {
  var controller = Ember.Object.create({ title: "Edge Cases" });
  append("<div title='\"{{title}}\"'>Living on the Edge</div>", controller);
  set(controller, 'title', "Life on the Edge");

  shouldHaveElement('div[title=\'"Life on the Edge"\']');
});

test("single quotes in prefixes and suffixes", function() {
  var controller = Ember.Object.create({ title: "Edge Cases" });
  append("<div title=\"'{{title}}'\">Living on the Edge</div>", controller);

  shouldHaveElement('div[title="\'Edge Cases\'"]');

  set(controller, 'title', "Life on the Edge");

  shouldHaveElement('div[title="\'Life on the Edge\'"]');
});

test("single quotes in the attribute's value", function() {
  var controller = Ember.Object.create({ title: "'Edge Cases'" });
  append("<div title=\"{{title}}\">Living on the Edge</div>", controller);

  shouldHaveElement("div[title=\"'Edge Cases'\"]");

  set(controller, 'title', "'Life on the Edge'");

  shouldHaveElement("div[title=\"'Life on the Edge'\"]");
});

test("double quotes in the attribute's value", function() {
  var controller = Ember.Object.create({ title: '"Edge Cases"' });
  append("<div title=\"{{title}}\">Living on the Edge</div>", controller);
  set(controller, 'title', '"Life on the Edge"');

  shouldHaveElement('div[title=\'"Life on the Edge"\']');
});


test("removes the attribute if the value becomes falsy", function() {
  var controller = Ember.Object.create({ url: "http://example.com" });
  append("<a href='{{href}}'>click here</a>", controller);
  set(controller, 'url', null);

  shouldHaveElement('a:not(href)');
});

test("makes the value the same as the name if the value becomes true", function() {
  var controller = Ember.Object.create({ url: "http://example.com" });
  append("<a href='{{url}}'>click here</a>", controller);
  set(controller, 'url', true);

  shouldHaveElement('a[href="href"]');
});

module("Using the precompilation sugar for classes");

test("when the class is a string, emits the string", function() {
  var controller = Ember.Object.create({ active: "active" });
  append("<div class='tab {{active}}'>Tab</div>", controller);

  shouldHaveElement('div.tab.active');
});

test("when the class is `this`, requires a truthy value", function() {
  raises(function() {
    var controller = Ember.Object.create();
    append("<div class='tab {{this}}'>Tab</div>", controller);
  }, /truthy/);
});

test("when the class is `this`, emits the truthy value", function() {
  var controller = Ember.Object.create();
  append("<div class='tab {{bind-class this truthy=\"active\" falsy=\"inactive\"}}'>Tab</div>", controller);

  shouldHaveElement('div.tab.active');
});

test("when a truthy name is specified and the value is truthy, emits the truthy value", function() {
  var controller = Ember.Object.create({ active: true });
  append("<div class='tab {{bind-class active truthy=\"active\" falsy=\"inactive\"}}'>Tab</div>", controller);

  shouldHaveElement('div.tab.active');
});

test("when a falsy name is specified and the value is falsy, emits the falsy value", function() {
  var controller = Ember.Object.create({ active: false });
  append("<div class='tab {{bind-class active truthy=\"active\" falsy=\"inactive\"}}'>Tab</div>", controller);

  shouldHaveElement('div.tab.inactive');
});

test("when the class is a string, updates the string", function() {
  var controller = Ember.Object.create({ active: "active" });
  append("<div class='tab {{active}}'>Tab</div>", controller);

  shouldHaveElement('div.tab.active');
});

test("when a falsy name is specified and the value is changed changed to falsy, updates to the falsy value", function() {
  var controller = Ember.Object.create({ active: true });
  append("<div class='tab {{bind-class active truthy=\"active\" falsy=\"inactive\"}}'>Tab</div>", controller);
  set(controller, 'active', false);

  shouldHaveElement('div.tab.inactive');
});

test("when a truthy name is specified and the value is changed to truthy, updates to the truthy value", function() {
  var controller = Ember.Object.create({ active: false });
  append("<div class='tab {{bind-class active truthy=\"active\" falsy=\"inactive\"}}'>Tab</div>", controller);
  set(controller, 'active', true);

  shouldHaveElement('div.tab.active');
});

})();
