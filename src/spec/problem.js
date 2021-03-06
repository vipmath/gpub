
/**
 * Process a problem position, creating a generated return object.
 * @param {!glift.rules.MoveTree} mt
 * @param {!gpub.spec.Position} position
 * @param {!gpub.spec.IdGen} idGen
 * @param {!gpub.spec.PositionOverrider} overrider
 * @param {!gpub.opts.SpecOptions} opt
 * @return {!gpub.spec.Processed} processed positions.
 * @package
 */
gpub.spec.processProblems = function(mt, position, idGen, overrider, opt) {
  var outPositions = [];
  var conditions = opt.problemConditions;
  var gameId = position.gameId;
  mt = mt.newTreeRef();

  var ipString = glift.rules.treepath.toInitPathString;
  var fragString = glift.rules.treepath.toFragmentString;

  var gen = new gpub.spec.Generated({
    id: position.id
  });

  var processed = /** @type {!gpub.spec.Processed} */ ({
    // Pass back the movetree only if it's modified (i.e., rotation).
    movetree: null,
    generated: gen,
  });

  if (opt.autoRotateCropPrefs &&
      opt.autoRotateCropTypes[gpub.spec.PositionType.PROBLEM]) {
    mt = glift.orientation.autoRotateCrop(mt, opt.autoRotateCropPrefs);
    processed.movetree = mt;
  }

  // Should be empty now.
  var initPos = mt.treepathToHere();

  /**
   * @param {!glift.rules.MoveTree} movetree
   * @param {!glift.rules.Treepath} prevPos Path to the previous position
   *    recorded.
   * @param {!glift.rules.Treepath} sincePrevPos Path since the previous
   *    position recorded.
   * @param {!glift.enums.problemResults} correctness whether position is
   *    considered 'correct'.
   *
   * Note: The full path to the current position should be equal to
   * prevPos.concat(sincePrevPos).
   */
  var pathRecurse = function(movetree, prevPos, sincePrevPos, correctness) {
    var newCor = glift.rules.problems.positionCorrectness(movetree, conditions);
    // Record positions when
    // - There are comments
    // - We're at the end of a branch.
    // - We're at the root
    if (movetree.properties().getComment() ||
        movetree.node().numChildren() === 0 ||
        (prevPos.length === initPos.length && sincePrevPos.length === 0)) {
      var label = newCor;
      if (prevPos.length === 0 && sincePrevPos.length === 0) {
        label = 'PROBLEM_ROOT';
      }
      var ip = ipString(prevPos);
      var frag = fragString(sincePrevPos);

      // Apply overrides, if necessary
      var moveNum = movetree.onMainline ? prevPos.length + sincePrevPos.length : undefined;
      var outPath = overrider.applyOverridesIfNecessary({
        gameId: gameId,
        moveNumber: moveNum,
        initialPosition: ip,
        nextMovesPath: frag,
      }, prevPos, sincePrevPos);
      if (outPath.initialPosition) {
        ip = ipString(outPath.initialPosition);
      }
      if (outPath.nextMovesPath) {
        frag = fragString(outPath.nextMovesPath);
      }

      var pos = new gpub.spec.Position({
        id: idGen.next(gameId, ip, frag),
        gameId: gameId,
        initialPosition: ip,
        nextMovesPath: frag,
        labels: [label, gpub.spec.PositionType.PROBLEM],
      });

      outPositions.push(pos);
      prevPos = prevPos.concat(sincePrevPos);
      sincePrevPos = [];
    }
    for (var i = 0; i < movetree.node().numChildren(); i++) {
      var nmt = movetree.newTreeRef();
      var pp = prevPos.slice();
      var spp = sincePrevPos.slice();
      spp.push(i);
      nmt.moveDown(i);
      // Note: there's no indicator when to break here. In other words, we
      // assume that the whole subtree is part of the problem, which might not
      // be true, but either we make this assumption or we introduce arbitrary
      // constraints.
      pathRecurse(nmt, pp, spp, newCor);
    }
  };

  pathRecurse(mt, initPos, [], glift.enums.problemResults.INDETERMINATE);
  gen.positions = outPositions;
  return processed;
};
