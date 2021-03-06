goog.provide('gpub.diagrams.Renderer');

/**
 * A map from string to enabled renderers. Typically, the string key will be a
 * gpub.diagrams.Type enum, but to enable custom renderers, this is left
 * open-ended.
 *
 * Each Renderer must be registered here to be considered enabled, but most
 * renderers add to this map later, so that this package needn't know about the
 * down-stream diagram renderer packages.
 *
 * @type {!Object<!string, (function(): !gpub.diagrams.DiagramRenderer)>}
 */
gpub.diagrams.enabledRenderers = {};

/**
 * General diagram renderer.
 * @param {!gpub.spec.Spec} spec
 * @param {!gpub.opts.DiagramOptions} opts
 * @param {!gpub.util.MoveTreeCache} cache
 * @constructor @struct @final
 */
gpub.diagrams.Renderer = function(spec, opts, cache) {
  /** @private @const {!gpub.spec.Spec} */
  this.spec_ = spec;

  /** @private @const {!gpub.opts.DiagramOptions} */
  this.opts_ = opts;

  /** @private @const {!gpub.util.MoveTreeCache} */
  this.cache_ = cache;

  /**
   * Number of diagrams that have been rendered.
   * @private {number}
   */
  this.rendered_ = 0;
};

/**
 * Get a type specific renderer.
 * @param {!gpub.diagrams.Type} type
 * @return {!gpub.diagrams.DiagramRenderer}
 */
gpub.diagrams.Renderer.typeRenderer = function(type) {
  var ren = gpub.diagrams.enabledRenderers[type];
  if (!ren) {
    throw new Error('Unknown or unsupported render type: ' + type +
        '. Each renderer must have a function-provider present in ' +
        'gpub.diagrams.enabledRenderers.');
  }
  return ren();
};

gpub.diagrams.Renderer.prototype = {
  /** @return {!gpub.diagrams.Type} Returns the relevant diagram type. */
  diagramType: function() { return this.opts_.diagramType; },

  /**
   * Render all the positions in all the groups.
   * @return {!gpub.diagrams.Rendered} The rendered diagrams plus any metadata.
   */
  render: function() {
    var rendered = this.renderedObj();
    /** @type {!gpub.diagrams.DiagramCallback} */
    var handler = function(d, m) {
      rendered.diagrams.push(d);
      rendered.metadata.push(m);
    };
    this.renderGroups_(this.spec_.rootGrouping, handler);
    return rendered;
  },

  /**
   * Stream back the rendered diagrams, but store the metadata.
   *
   * @param {!gpub.diagrams.DiagramCallback} fn
   * @return {!gpub.diagrams.Rendered}
   */
  renderStream: function(fn) {
    var rendered = this.renderedObj();
    /** @type {!gpub.diagrams.DiagramCallback} */
    var handler = function(d, m) {
      rendered.metadata.push(m);
      fn(d, m);
    };
    this.renderGroups_(this.spec_.rootGrouping, handler);
    return rendered;
  },

  /**
   * Return the rendered object with just the matadata filled in.
   * @return {!gpub.diagrams.Rendered}
   */
  renderedObj: function() {
    return {
      type: this.diagramType(),
      diagrams: [],
      metadata: [],
    };
  },

  /**
   * Gets the diagram renderer for the passed-in diagram type
   * @return {!gpub.diagrams.DiagramRenderer}
   */
  diagramRenderer: function() {
    return gpub.diagrams.Renderer.typeRenderer(this.diagramType());
  },

  /**
   * @param {!gpub.spec.Grouping} g
   * @param {!gpub.diagrams.DiagramCallback} fn
   * @private
   */
  renderGroups_: function(g, fn) {
   this.renderOneGroup_(g, fn);
    for (var i = 0; i < g.groupings.length; i++) {
      this.renderOneGroup_(g, fn);
    }
  },

  /**
   * Render all the positions for a single group; We only render the generated
   * positions; if there are no generated positions, we try to render the
   * original position.
   * @param {!gpub.spec.Grouping} g
   * @param {!gpub.diagrams.DiagramCallback} fn
   * @private
   */
  renderOneGroup_: function(g, fn) {
    var out = [];

    for (var i = 0; i < g.positions.length; i++) {
      var pos = g.positions[i];
      if (g.generated[pos.id]) {
        var gen = g.generated[pos.id];
        for (var j = 0; j < gen.positions.length; j++) {
          this.renderOnePosition_(gen.positions[j], fn);
        }
      } else {
        this.renderOnePosition_(pos, fn);
      }
    }
  },

  /**
   * Render a single position.
   * @param {!gpub.spec.Position} pos
   * @param {!gpub.diagrams.DiagramCallback} fn Handler to receive the diagrams.
   * @private
   */
  renderOnePosition_: function(pos, fn) {
    this.rendered_++;
    if (this.opts_.skipDiagrams) {
      if (this.rendered_ <= this.opts_.skipDiagrams) {
        return;
      }
    }
    if (this.opts_.maxDiagrams) {
      if (this.rendered_ > this.opts_.maxDiagrams) {
        return;
      }
    }

    var mt = this.cache_.get(pos.gameId);
    var region = this.opts_.boardRegion;
    var init = glift.rules.treepath.parseInitialPath(pos.initialPosition);
    mt = mt.getTreeFromRoot(init);
    var flattenOpts = {
      boardRegion: region,
      nextMovesPath: glift.rules.treepath.parseFragment(pos.nextMovesPath  || ''),
      autoBoxCropOnVariation: this.opts_.autoBoxCropOnVariation,
      regionRestrictions: this.opts_.regionRestrictions,
      clearMarks: this.opts_.clearMarks,
      ignoreLabels: this.opts_.ignoreRenderLabels,
    };
    var flattened = glift.flattener.flatten(mt, flattenOpts);
    var dr = this.diagramRenderer();
    var suffix = gpub.diagrams.fileExtension[this.diagramType()] || 'unknown';
    var diagram = {
      id: pos.id,
      rendered: dr.render(flattened, this.opts_),
    };
    var metadata = {
      id: pos.id,
      extension: suffix,
      labels: pos.labels,
      comment: flattened.comment(),
      collisions: flattened.collisions(),
      isOnMainPath: flattened.isOnMainPath(),
      startingMoveNum: flattened.startingMoveNum(),
      endingMoveNum: flattened.endingMoveNum(),
    };
    fn(diagram, metadata);
  },

  /**
   * Process text inline, if possible, replacing stones with inline-images if
   * possible.
   * @param {string} text
   * @param {!gpub.opts.DiagramOptions} opt
   * @return {string} The processed text.
   */
  renderInline: function(text, opt) {
    return this.diagramRenderer().renderInline(text, opt);
  },
};
