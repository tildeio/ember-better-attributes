(function() {

Ember.TESTING = true;

Ember.Handlebars.registerHelper('test-id', function(options) {
  return options.data.scopedId;
});

var compile = Ember.Handlebars.compile;

function append(string, controller) {
  var template = compile(string),
      view = Ember.View.create({
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

test("updates the initial value when it changes", function() {
  var controller = Ember.Object.create({ url: "http://example.com" });
  append("<a {{#id}}href='{{bind-attribute 'href' url}}'{{/id}}>click here</a>", controller);
  set(controller, 'url', "http://yehudakatz.com");

  shouldHaveElement('a[href*="yehudakatz.com"]');
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

})();
