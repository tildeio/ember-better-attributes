(function() {

Ember.Handlebars.registerHelper('id', function(id, options) {
  if (arguments.length === 1) {
    options = id;
    id = "ember-" + (++Ember.uuid);
  }

  options.data.scopedId = id;

  options.fn(this);

  delete options.data.generatedId;
});

})();
