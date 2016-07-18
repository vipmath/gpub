goog.provide('gpub.api.BookOptions');
goog.provide('gpub.api.Frontmatter');

/**
 * @param {!gpub.api.BookOptions=} opt_options
 *
 * @constructor @struct @final
 */
gpub.api.BookOptions = function(opt_options) {
  var o = opt_options || {};

  /**
   * The format of the 'book' output that is produced by GPub.
   * See gpub.outputFormat.
   *
   * @const {gpub.OutputFormat}
   */
  this.outputFormat = o.outputFormat || gpub.OutputFormat.LATEX;

  /**
   * The size of the page. Element of gpub.book.page.type.
   *
   * @const {gpub.PageSize}
   */
  this.pageSize = o.pageSize || gpub.PageSize.LETTER;

  /**
   * Size of the intersections in the diagrams. If no units are specified, the
   * number is assumed to be in pt. Can also be specified in 'in', 'mm', or
   * 'em'.
   *
   * @const {string}
   */
  this.goIntersectionSize = o.goIntersectionSize || '12pt';

  /**
   * Override the default template.
   * A false-y template will result in using the default template.
   *
   * @const {?string}
   */
  this.template = o.template || null;

  /**
   * Any additional setup that needs to be done in the header. I.e.,
   * for diagram packages. Note, this is rather LaTeX specific, so should,
   * perhaps, be moved somewhere else.
   *
   * @type {string}
   */
  // TODO(kashomon): Get rid of this.
  this.init = o.init || '';

  /** @type {?string} */
  this.title = o.title || 'My Book';

  /** @type {?string} */
  this.subtitle = o.subtitle || null;

  /** @type {?string} */
  this.publisher = o.publisher || 'GPub';

  /** @type {!Array<string>} */
  this.authors = o.authors || [];

  /** @type {?string} */
  this.year = o.year || null;

  /**
   * Frontmatter is text supporting the bulk of the the work that comes
   * before/after the mainmatter of the book.
   *
   * Note: It's expected that the frontmatter (except for the copyright page)
   * will be specified as a markdown-string.
   *
   * Not all of these will be supported by all the book-generators. For those
   * that do support the relevant sections, the frontmatter and backmatter are
   * dumped into the book options.
   */
  this.frontmatter = new gpub.api.Frontmatter(o.frontmatter);

  // TODO(kashomon): Give a real constructor to the appendices.
  var app = o.appendices || {};

  this.appendices = {};

  /** @type {?string} */
  this.appendices.glossary = app.glossary || null;
};

/**
 * @param {!gpub.api.Frontmatter} options
 *
 * @constructor @struct @final
 */
gpub.api.Frontmatter = function(options) {
  var o = options || {};

  // epigraph: null, // AKA Quote Page

  /** @type {?string} */
  this.foreword = o.foreword || null;  // Author or unrelated person

  /** @type {?string} */
  this.preface = o.foreword || null; // Author

  /** @type {?string} */
  this.acknowledgements = o.acknowledgements || null;

  /** @type {?string} */
  this.introduction = o.introduction || null;

  /**
   * Generate the Table of Contents or just 'Contents'.
   * @type {boolean}
   */
  this.generateToc = !!o.generateToc;

  /**
   * Generates the copyright page. Copyright should be an object with the
   * format listed below:
   *
   *  {
   *     "publisher": "Foo Publisher",
   *     "license": "All rights reserved.",
   *     "publishYear": 2015,
   *     "firstEditionYear": 2015,
   *     "isbn": "1-1-123-123456-1",
   *     "issn": "1-123-12345-1",
   *     "addressLines": [
   *        "PO #1111",
   *        "1111 Mainville Road Rd, Ste 120",
   *        "Fooville",
   *        "CA 90001",
   *        "www.fooblar.com"
   *     ],
   *     "showPermanenceOfPaper": true,
   *     "printingRunNum": 1
   *  }
   * @type {!Object}
   */
  // TODO(kashomon): Make a proper type.
  this.copyright = o.copyright || null;

  /////////////////////
  // Special Options //
  /////////////////////

  /**
   * Whether or not to generate PDF/X-1a compatibile PDFs. Note: this only
   * applies to output formats that generate PDFs (latex).
   *
   * Most printers will require this option to be set.
   *
   * @const {boolean}
   */
  this.pdfx1a = o.pdfx1a || false;

  /**
   * An option only for PDF/X-1a. For this spceification, you must specify a
   * color profile file (e.g., ISOcoated_v2_300_eci.icc).
   *
   * @const {?string}
   */
  this.colorProfileFilePath = o.colorProfileFilePath || null;
};
