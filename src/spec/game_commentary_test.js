(function() {
  module('gpub.spec.gameCommentary');

  var gameId = 'zed';
  var specOpts = new gpub.opts.SpecOptions();
  var ov = new gpub.spec.PositionOverrider();

  test('Process basic game commentary', function() {
    var sgf = '(;GM[1]C[A Game!];B[aa]C[Here\'s a move])';
    var mt = glift.parse.fromString(sgf);
    var id = 'simple-id';
    var idGen = new gpub.spec.IdGen(id);
    var pos = new gpub.spec.Position({
      id: id,
      gameId: id,
    });

    var gen = gpub.spec.processGameCommentary(mt, pos, idGen, ov, specOpts).generated;
    deepEqual(gen.positions.length, 2);
    deepEqual(gen.positions[0].id, id + '-0', 'gen-1 id');
    deepEqual(gen.positions[0].initialPosition, '0', 'gen-1 init pos');
    deepEqual(gen.positions[0].nextMovesPath, undefined, 'gen-1 next-moves');
    deepEqual(gen.positions[0].labels, ['MAINLINE', 'GAME_COMMENTARY'], 'gen-1 lbl');

    deepEqual(gen.positions[1].id, id + '-1', 'gen-2 id');
    deepEqual(gen.positions[1].initialPosition, '0', 'gen-2 init pos');
    deepEqual(gen.positions[1].nextMovesPath, '0', 'gen-2 next moves');
    deepEqual(gen.positions[1].labels, ['MAINLINE', 'GAME_COMMENTARY'], 'gen-2 lbl');

    var genLabels = gen.positionLabels();
    deepEqual(genLabels['MAINLINE'].length, 2);
    deepEqual(genLabels['GAME_COMMENTARY'].length, 2);
  });

  test('Process game commentary with variations', function() {
    var sgf = '(;GM[1]C[A Game!];B[aa]C[Here\'s a move]' +
        '(;W[ac]C[And another!])' +
        '(;W[ad]C[Yet another!]))';
    var mt = glift.parse.fromString(sgf);
    var id = 'simple-id';
    var idGen = new gpub.spec.IdGen(id);
    var pos = new gpub.spec.Position({
      id: id,
      gameId: id,
    });
    var gen = gpub.spec.processGameCommentary(mt, pos, idGen, ov, specOpts).generated;
    deepEqual(gen.positions.length, 4);

    var genLabels = gen.positionLabels();
    deepEqual(genLabels['MAINLINE'].length, 3);
    deepEqual(genLabels['VARIATION'].length, 1);
    deepEqual(genLabels['GAME_COMMENTARY'].length, 4);
    deepEqual(gen.positions[3].labels, ['VARIATION', 'GAME_COMMENTARY'], 'gen-3 lbl');
  });

  test('Process gamebook', function() {
    var sgf = '(;GM[1]' +
        ';B[qd] ;W[dd] ;B[pq] ;W[oc] ;B[dp] ;W[po] ;B[pe] ;W[md] ;B[qm]' +
        ';W[qq] ;B[qp] ;W[pp] ;B[qo] ;W[qn] ;B[pn] ;W[rn] ;B[rq] ;W[qr]' +
        ';B[ro] ;W[rm] ;B[oq] ;W[np] ;B[rr] ;W[ql] ;B[pm] ;W[pl] ;B[nm]' +
        ';W[op] ;B[ol] ;W[pj] ;B[qh] ;W[ok] ;B[nk] ;W[nj] ;B[mk] ;W[so]' +
        ';B[rp] ;W[mm] ;B[nn] ;W[mn] ;B[mj] ;W[ni] ;B[mi] ;W[mh] ;B[lh]' +
        ';W[mg] ;B[lg] ;W[on] ;B[om] ;W[mf] ;B[jp] ;W[km] ;B[jj] ;W[im]' +
        ';B[lp] ;W[nq] ;B[pr] ;W[or] ;B[qs] ;W[no] ;B[nl] ;W[lo] ;B[gp]' +
        ';W[jh] ;B[ji] ;W[ih] ;B[hj] ;W[fm] ;B[kf] ;W[if] ;B[kd] ;W[id]' +
        ';B[fj] ;W[dm] ;B[ck] ;W[kk] ;B[le] ;W[of] ;B[cf] ;W[dh] ;B[hg]' +
        ';W[hh] ;B[gh] ;W[gg] ;B[fh] ;W[hi] ;B[ik] ;W[gi] ;B[fi] ;W[gj]' +
        ';B[gk] ;W[fk] ;B[gl] ;W[fl] ;B[gm] ;W[gn] ;B[hn] ;W[hm] ;B[fn]' +
        ';W[go] ;B[fo] ;W[ho] ;B[il] ;W[ej] ;B[jn] ;W[jm] ;B[in] ;W[hp]' +
        ';B[gq] ;W[jo] ;B[io] ;W[ip] ;B[ko] ;W[kn] ;B[jo] ;W[jq] ;B[kp]' +
        ';W[hr] ;B[kr] ;W[gr] ;B[jr] ;W[fp] ;B[fq] ;W[fr] ;B[eq] ;W[ir]' +
        ';B[er] ;W[lr] ;B[mr] ;W[lq] ;B[kq] ;W[mq] ;B[iq] ;W[hq] ;B[fs]' +
        ';W[ks] ;B[is] ;W[mp] ;B[fg] ;W[gf] ;B[ff] ;W[en] ;B[eo] ;W[do]' +
        ';B[ep] ;W[co] ;B[gs] ;W[jq] ;B[ge] ;W[hf] ;B[iq] ;W[hl] ;B[hk]' +
        ';W[jq] ;B[jg] ;W[js] ;B[ig] ;W[cq] ;B[cp] ;W[bp] ;B[br] ;W[fd]' +
        ';B[cd] ;W[cc] ;B[de] ;W[bd] ;B[dl] ;W[ek] ;B[cm] ;W[bn] ;B[bq]' +
        ';W[cj] ;B[bj] ;W[ci] ;B[bm] ;W[bi] ;B[ed] ;W[ce] ;B[dc] ;W[ee]' +
        ';B[cd] ;W[jf] ;B[kg] ;W[dd] ;B[ei] ;W[dj] ;B[cd] ;W[cr] ;B[ap]' +
        ';W[dd] ;B[df] ;W[ec] ;B[dg] ;W[bf] ;B[bg] ;W[ag] ;B[ah] ;W[af]' +
        ';B[fe] ;W[bh] ;B[gd] ;W[qg] ;B[rg] ;W[qf] ;B[rf] ;W[qc] ;B[rk]' +
        ';W[rl] ;B[qi] ;W[rj] ;B[qj] ;W[qk] ;B[oh] ;W[og] ;B[oi] ;W[oj]' +
        ';B[ri] ;W[sk] ;B[rd] ;W[rc] ;B[od] ;W[pc] ;B[me] ;W[nh] ;B[si]' +
        ';W[ao] ;B[bo] ;W[sd] C[It was a great game!])'
    var mt = glift.parse.fromString(sgf);
    var id = 'zed';
    var idGen = new gpub.spec.IdGen(id);
    var pos = new gpub.spec.Position({
      id: id,
      gameId: id,
    });
    var gen = gpub.spec.processGameCommentary(mt, pos, idGen, ov, specOpts).generated;
    deepEqual(gen.positions.length, 1, 'num variations');
    ok(gen.positions[0].nextMovesPath, '0:228', 'Testing nextmoves path');

    var genLabels = gen.positionLabels();
    deepEqual(genLabels['MAINLINE'].length, 1);
    deepEqual(genLabels['VARIATION'], undefined);
  });

  test('Process basic game commentary: rotation', function() {
    var sgf = '(;GM[1]C[A Game!];B[dd]C[Here\'s a move])';
    var mt = glift.parse.fromString(sgf);
    var id = 'simple-id';
    var idGen = new gpub.spec.IdGen(id);
    var pos = new gpub.spec.Position({
      id: id,
      gameId: id,
    });

    var proc = gpub.spec.processGameCommentary(mt, pos, idGen, ov, new gpub.opts.SpecOptions({
      autoRotateGames: true,
    }));
    ok(proc.movetree, 'Processed movetree must be defined');

    var gen = proc.generated;

    deepEqual(gen.positions[1].id, id + '-1', 'gen-2 id');
    deepEqual(gen.positions[1].initialPosition, '0', 'gen-2 init pos');

    var genLabels = gen.positionLabels();
    deepEqual(genLabels['MAINLINE'].length, 2);
    deepEqual(genLabels['GAME_COMMENTARY'].length, 2);
  });

  test('Show previous moves: moveNumber', function() {
    var sgf = '(;GM[1]' +
        ';B[qd] ;W[dd] ;B[pq] ;W[oc] ;B[dp] ;W[po] ;B[pe] ;W[md] ;B[qm]' + // mv 9
        ';W[qq] ;B[qp] ;W[pp] ;B[qo] ;W[qn] ;B[pn] ;W[rn] ;B[rq] ;W[qr]' + // mv 18
        ';W[ao] ;B[bo] ;W[sd] C[It was a great game!])' // mv 21
    var mt = glift.parse.fromString(sgf);
    var id = 'simple-id';
    var idGen = new gpub.spec.IdGen(id);
    var pos = new gpub.spec.Position({
      id: id,
      gameId: id,
    });

    var o = [{
      gameId: id,
      moveNumber: 21,
      showPreviousMoves: 5,
    }];
    var overrider = new gpub.spec.PositionOverrider(o);

    var proc = gpub.spec.processGameCommentary(mt, pos, idGen, overrider, specOpts);
    var gen = proc.generated;
    deepEqual(gen.positions.length, 1);
    deepEqual(gen.positions[0].id, id + '-0', 'gen-1 id');
    deepEqual(gen.positions[0].initialPosition, '16', 'gen-1 init pos');
    deepEqual(gen.positions[0].nextMovesPath, '0:5', 'gen-1 next moves');
  });

  test('Show previous moves: initpos+nextmoves', function() {
    var sgf = '(;GM[1]' +
        ';B[qd] ;W[dd] ;B[pq] ;W[oc] ;B[dp] ;W[po] ;B[pe] ;W[md] ;B[qm]' + // mv 9
        ';W[qq] ;B[qp] ;W[pp] ;B[qo] ;W[qn] ;B[pn] ;W[rn] ;B[rq] ;W[qr]' + // mv 18
        ';W[ao] ;B[bo] ;W[sd] C[It was a great game!])' // mv 21
    var mt = glift.parse.fromString(sgf);
    var id = 'simple-id';
    var idGen = new gpub.spec.IdGen(id);
    var pos = new gpub.spec.Position({
      id: id,
      gameId: id,
    });

    var o = [{
      gameId: id,
      initialPosition: '0',
      nextMovesPath: '0:21',
      showPreviousMoves: 5,
    }];
    var overrider = new gpub.spec.PositionOverrider(o);

    var proc = gpub.spec.processGameCommentary(mt, pos, idGen, overrider, specOpts);
    var gen = proc.generated;
    deepEqual(gen.positions.length, 1);
    deepEqual(gen.positions[0].id, id + '-0', 'gen-1 id');
    deepEqual(gen.positions[0].initialPosition, '16', 'gen-1 init pos');
    deepEqual(gen.positions[0].nextMovesPath, '0:5', 'gen-1 next moves');
  });
})();
