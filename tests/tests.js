(function() {

Ember.TESTING = true;

Ember.Handlebars.registerHelper('test-id', function(options) {
  return options.data.scopedId;
});

var compile = Ember.Handlebars.compile;

function append(string) {
  var template = compile(string),
      view = Ember.View.create({
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

module("The {{#id}} helper");

test("The #id helper generates an `id` for downstream usage", function() {
  append("<div {{#id}}data-id='{{test-id}}'{{/id}}>Contents</div>");
  shouldHaveElement('[data-id^=ember]');
});

test("The #id helper takes an explicit `id` that it supplies downstream", function() {
  append('<div {{#id "explicit"}}data-id="{{test-id}}"{{/id}}>Contents</div>');
  shouldHaveElement('[data-id=explicit]');
});

})();
