goog.provide('gpub.spec')

/**
 * Methods for processing and creating Glift specifications.
 */
gpub.spec = {
  /**
   * Takes a list of SGFs and produces a Gpub spec. This first pass does a
   * brain-dead transformation based on the position defaults.
   *
   * Importantly, this creates a serializeable book object that can be store for
   * later processing.
   *
   * @param {!gpub.Options} options
   * @return {!gpub.spec.Spec}
   */
  create: function(options) {
    var sgfs = options.sgfs;
    var specOptions = options.specOptions;
    var defaultPositionType = specOptions.defaultPositionType;

    var spec = new gpub.spec.Spec({
      specOptions: options.specOptions,
      diagramOptions: options.diagramOptions,
      bookOptions: options.bookOptions
    });

    var rootGrouping = spec.rootGrouping;
    rootGrouping.positionType = defaultPositionType;

    for (var i = 0; i < sgfs.length; i++) {
      var sgfStr = sgfs[i];
      if (!sgfStr) {
        throw new Error('No SGF String defined for index: ' + i);
      }
      var mt = glift.parse.fromString(sgfStr);
      var alias = 'sgf-' + (i+1);

      // If the Game Name is specified, we prepend that to the index for
      // readability.
      var GN = glift.rules.prop.GN;
      if (mt.properties().contains(GN)) {
        alias = mt.properties().getOneValue(GN) + '-' + (i+1);
      }

      // Ensure the sgf mapping contains the alias-to-sgf mapping.
      if (!spec.sgfMapping[alias]) {
        spec.sgfMapping[alias] = sgfStr;
      }

      // At this point, there is a 1x1 mapping between passed-in SGF string and
      // position. That need not be true generally, but it is true here.
      var position = new gpub.spec.Position({
        alias: alias,
        id: alias
      })

      rootGrouping.positions.push(position);
    }
    return spec;
  },

  /**
   * Process a spec by transforming the positions positions. All  SGFS are
   * grouped by type into new Grouping objects, if the types are not uniform,
   * and prepended to the sub-groupings list.
   *
   * @param {!gpub.spec.Spec} spec
   * @return {!gpub.spec.Spec} the transformed spec.
   */
  process: function(spec) {
    return new gpub.spec.Processor(spec).process();
  },
};
