goog.provide('gpub.diagrams.gnos.Renderer');

/**
 * The diagrams-specific renderer for gnos. Implicitly, this implements the
 * gpub.diagrams.DiagramRenderer record-type interface.
 *
 * @constructor @final @struct
 */
gpub.diagrams.gnos.Renderer = function() {}

gpub.diagrams.gnos.Renderer.prototype = {
  /**
   * The create method!
   *
   * We expect flattened and options to be defined.
   * @param {!glift.flattener.Flattened} flat
   * @param {!gpub.opts.DiagramOptions} opt
   * @return {string} The rendered diagram.
   */
  render: function(flat, opt) {
    return gpub.diagrams.gnos.create(flat, opt);
  },

  /**
   * Render-inline some inline text via gnos.
   * @param {string} text
   * @param {!gpub.opts.DiagramOptions} opt
   * @return {string} The processed text
   */
  renderInline: function(text, opt) {
    return gpub.diagrams.gnos.renderInline(text, opt);
  }
};

// Enabled the Renderer!
gpub.diagrams.enabledRenderers['GNOS'] = function() {
  return new gpub.diagrams.gnos.Renderer();
};
