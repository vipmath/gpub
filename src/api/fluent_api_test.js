(function() {
  module('gpub.api.fluentApiTest');
  var sgfs = testdata.sgfs;

  test('Spec Creation', function() {
    var veasy = testdata.sgfs.veryeasy;
    var triv = testdata.sgfs.trivialproblem;
    var opt = {
      sgfs: [veasy, triv],
      ids: ['veasy', 'triv'],
      specOptions: {
        positionType: 'PROBLEM',
      },
    };
    var id0 = opt.ids[0];
    var id1 = opt.ids[1];

    var api = gpub.init(opt);
    ok(api, 'must be defined');
    deepEqual(api.opt_.sgfs, opt.sgfs);
    deepEqual(api.opt_.ids, opt.ids);

    api.createSpec();
    var spec = api.spec();
    deepEqual(spec.version, gpub.spec.SpecVersion.V1);
    var expMap = {};
    expMap[id0] = opt.sgfs[0];
    expMap[id1] = opt.sgfs[1];
    deepEqual(spec.sgfMapping, expMap);
    deepEqual(spec.rootGrouping.positions.length, 2);
    deepEqual(spec.rootGrouping.positionType, 'PROBLEM');
    deepEqual(api.diagrams_, null);

    var expCache = {};
    expCache[id0] = glift.parse.fromString(opt.sgfs[0]);
    expCache[id1] = glift.parse.fromString(opt.sgfs[1]);
    deepEqual(api.cache_.sgfMap, expMap, 'cache sgf map');
    deepEqual(api.cache_.get(id0).toSgf(), expCache[id0].toSgf(), 'sgf1 text');
    deepEqual(api.cache_.get(id1).toSgf(), expCache[id1].toSgf(), 'sgf2 text');
  });

  test('Spec Creation (options)', function() {
    var veasy = testdata.sgfs.veryeasy;
    var triv = testdata.sgfs.trivialproblem;
    var opt = {
      sgfs: [veasy, triv],
      ids: ['veasy', 'triv'],
      specOptions: {
        positionType: 'PROBLEM',
      },
    };
    var api = gpub.init(opt).createSpec()

    var spec = api.spec();
    var jsonspec = api.jsonSpec();
    ok(spec, 'spec should be defined');
    ok(jsonspec, 'spec should be defined');
    deepEqual(typeof spec, 'object', 'Spec should be an object');
    deepEqual(typeof jsonspec, 'string', 'JSON spec should be a string');

    deepEqual(gpub.init().createSpec(jsonspec).jsonSpec(), jsonspec);
    deepEqual(gpub.init().createSpec(spec).jsonSpec(), jsonspec);
  });

  test('Process Spec +(options)', function() {
    var veasy = testdata.sgfs.veryeasy;
    var api = gpub.init({sgfs: [veasy] })
        .createSpec()
        .processSpec({
          positionType: 'PROBLEM'
        });

    deepEqual(api.spec().specOptions.positionType, 'PROBLEM');
  });

  test('Full Diagram Creation', function() {
    var sgf = testdata.gogameguru_commentary;
    var api = gpub.init({
        sgfs: [sgf],
        diagramOptions: {
          maxDiagrams: 20,
        }})
      .createSpec()
      .processSpec()
      .renderDiagrams();

    var diag = api.diagrams();
    ok(diag, 'Diagrams must be defined');
    deepEqual(diag.diagrams.length, 20);
    var idmap = {};
    for (var i = 0; i < diag.diagrams.length; i++) {
      var d  = diag.diagrams[i];
      ok(d.rendered, 'Must have rendered content');
      ok(d.id, 'Must have id');
      ok(!idmap[d.id], 'Duplicate ID detected: ' + d.id);
      // Diagrams are not generally required to have comments, but due to the
      // way game_commentary is processed, all diagrams will have comments for
      // this type.
      ok(d.comment, 'Must have a comment');
    }
  });

  test('Full Diagram Creation +(options)', function() {
    var sgf = testdata.gogameguru_commentary;
    var api = gpub.init({
        sgfs: [sgf],
      })
      .createSpec()
      .processSpec()
      .renderDiagrams({
        maxDiagrams: 20,
      })
    var diag = api.diagrams();
    deepEqual(diag.diagrams.length, 20);
  });

  test('Full Diagram Creation streamed +(options)', function() {
    var sgf = testdata.gogameguru_commentary;
    var callCount = 0;
    var api = gpub.init({
        sgfs: [sgf],
      })
      .createSpec()
      .processSpec()
      .renderDiagramsStream(function(d) {
        ok(d.id);
        ok(d.rendered);
        callCount++;
      }, {
        maxDiagrams: 20,
      })
    deepEqual(callCount, 20);
  });
})();