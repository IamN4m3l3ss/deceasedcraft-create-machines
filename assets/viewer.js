(function(){
  /* ---------- build data (2D grid + 3D) ----------
     .  empty   ~ keep clear      B> B< B^ Bv belt (+ * pulley, i in-funnel, o out-funnel, b brass exit funnel)
     Ci Co chest   G gearbox   S- S| shafts   So vertical shaft   Pw power in
     D#/S# deployer   H hopper   P press   X saw   c cogwheel                                  */
  var BUILDS = {
    ammo: {
      zs:[0,1], path:[[1,0],[5,0]], loop:false, item:'casing',
      layers:[
        {y:0, name:'y0 · belt', cap:'Belt level. Input chest at x0, output chest at x6. The first gearbox sits right behind the belt\'s first pulley.',
          rows:['Ci B>*i B> B> B> B>*o Co', '. G . . . . .']},
        {y:1, name:'y1 · gap', cap:'Keep the space above x2–x4 clear. The deployer hands reach through it. A vertical shaft rises behind x1.',
          rows:['. . ~ ~ ~ . .', '. So . . . . .']},
        {y:2, name:'y2 · deployers', cap:'D1–D3 facing down. The front gearbox at x1 passes the tower\'s rotation along the deployer row.',
          rows:['. G D1 D2 D3 . .', '. G . . . . .']},
        {y:3, name:'y3 · feed + power', cap:'Hoppers on the deployers (chests can go on y4). Power comes into the tower at x1 from above.',
          rows:['. . H H H . .', '. Pw . . . . .']}
      ]
    },
    ring: {
      zs:[-1,0,1,2,3], path:[[8,0],[0,0],[0,2],[8,2],[8,0]], loop:true, item:'box',
      layers:[
        {y:0, name:'y0 · belts', cap:'A (north) flows west, D (x0) south, C (south) east, B (x8) north. The gearbox at x1 drives all four: A and D directly, C through the added pulley at x1, B through the shaft row.',
          rows:['. . . . . . . . Ci', 'Bv* B<* B< B< B< B< B< B< B<*i', 'Bv* G S- S- S- S- S- S- B^*', 'B>* B>* B> B> B>b B> B> B>* B^*', '. . . . Co . . . .']},
        {y:1, name:'y1 · gap', cap:'Keep the space above belt A clear under the stations. A vertical shaft links the y0 and y2 gearboxes.',
          rows:['. . . . . . . . .', '. . ~ ~ ~ ~ ~ ~ .', '. So . . . . . . .', '. . . . . . . . .', '. . . . . . . . .']},
        {y:2, name:'y2 · stations', cap:'S1 sits over x7, right after items join belt A. S6 is over x2. The front gearbox at x1 feeds the row.',
          rows:['. . . . . . . . .', '. G S6 S5 S4 S3 S2 S1 .', '. G . . . . . . .', '. . . . . . . . .', '. . . . . . . . .']},
        {y:3, name:'y3 · feed + power', cap:'Hoppers over S2–S6. S1 only holds a blueprint. Power goes in from above at x1, and nowhere else.',
          rows:['. . . . . . . . .', '. . H H H H H . .', '. Pw . . . . . . .', '. . . . . . . . .', '. . . . . . . . .']}
      ]
    },
    metal: {
      zs:[0,1], path:[[1,0],[8,0]], loop:false, item:'plate',
      layers:[
        {y:0, name:'y0 · belt', cap:'Chest → short belt (x1–x2) → saw facing up (x3) → main belt (x4–x8) → output chest. The three cogwheels mesh in a row, so the saw spins opposite to both belts.',
          rows:['Ci B>*i B>* X B>* B> B> B> B>*o Co', '. . c c c . . . G .']},
        {y:1, name:'y1 · gap', cap:'Keep x5–x7 clear for the press heads. The tower shaft rises at x8.',
          rows:['. . . . . ~ ~ ~ . .', '. . . . . . . . So .']},
        {y:2, name:'y2 · presses', cap:'Three presses with their shafts along the row, powered from the gearbox at x8.',
          rows:['. . . . . P P P G .', '. . . . . . . . G .']},
        {y:3, name:'y3 · power', cap:'Power comes in from above at x8.',
          rows:['. . . . . . . . . .', '. . . . . . . . Pw .']}
      ]
    }
  };
  var DIRNAME = {'>':'east','<':'west','^':'north','v':'south'};
  var ARROW = {'>':'→','<':'←','^':'↑','v':'↓'};

  /* ---------- 2D grid ---------- */
  function cell2d(tok){
    if (tok === '.') return {cls:'', txt:'', tip:'Empty'};
    if (tok === '~') return {cls:'k-gap', txt:'·', tip:'Keep clear: the gap a deployer or press reaches through'};
    if (tok[0] === 'B'){
      var d = tok[1], f = tok.slice(2), b = '', b2 = '', tip = 'Belt moving ' + DIRNAME[d];
      if (f.indexOf('*') > -1){ b2 = '⊙'; tip += ', pulley'; }
      if (f.indexOf('i') > -1){ b = 'IN'; tip += ', funnel pulling from the chest'; }
      if (f.indexOf('o') > -1){ b = 'OUT'; tip += ', sneak-placed funnel into the chest'; }
      if (f.indexOf('b') > -1){ b = 'EXIT'; tip += ', sneak-placed brass funnel with kit filter'; }
      return {cls:'k-belt arrow', txt:ARROW[d], badge:b, badge2:b2, tip:tip};
    }
    var map = {
      'Ci':{cls:'k-chest', txt:'IN', tip:'Input chest'}, 'Co':{cls:'k-chest', txt:'OUT', tip:'Output chest'},
      'G':{cls:'k-kin', txt:'GB', tip:'Gearbox'}, 'S-':{cls:'k-kin', txt:'━', tip:'Shaft, east–west'},
      'S|':{cls:'k-kin', txt:'┃', tip:'Shaft, north–south'}, 'So':{cls:'k-kin', txt:'◉', tip:'Vertical shaft'},
      'Pw':{cls:'k-power', txt:'PWR', tip:'Power in from above'}, 'H':{cls:'k-feed', txt:'H', tip:'Hopper into the deployer below'},
      'P':{cls:'k-press', txt:'PR', tip:'Mechanical press, shaft along the row'},
      'X':{cls:'k-press', txt:'SAW', tip:'Saw facing up, shaft north–south, filter: Spring Wire'},
      'c':{cls:'k-kin', txt:'⚙', tip:'Cogwheel, north–south axis'}
    };
    if (map[tok]) return map[tok];
    if (/^[DS]\d$/.test(tok)) return {cls:'k-dep', txt:tok, tip:'Deployer ' + tok + ', facing down'};
    return {cls:'', txt:tok, tip:tok};
  }
  function render2d(grid, build, layerIdx){
    var L = build.layers[layerIdx], cols = L.rows[0].split(' ').length;
    grid.style.gridTemplateColumns = 'auto repeat(' + cols + ', max-content)';
    grid.innerHTML = '';
    var add = function(cls, txt){ var e = document.createElement('div'); e.className = 'cell ' + cls; e.textContent = txt; grid.appendChild(e); return e; };
    add('axis', 'N↑');
    for (var x = 0; x < cols; x++) add('axis', 'x' + x);
    L.rows.forEach(function(row, zi){
      add('axis', 'z' + build.zs[zi]);
      row.split(' ').forEach(function(tok){
        var c = cell2d(tok), el = add(c.cls, c.txt);
        el.title = c.tip; el.setAttribute('aria-label', c.tip);
        if (c.badge){ var b = document.createElement('span'); b.className = 'badge'; b.textContent = c.badge; el.appendChild(b); }
        if (c.badge2){ var b2 = document.createElement('span'); b2.className = 'badge2'; b2.textContent = c.badge2; el.appendChild(b2); }
      });
    });
  }

  /* ---------- 3D shared helpers ---------- */
  var HAS3D = typeof THREE !== 'undefined' && !!THREE.OrbitControls;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function cssVar(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888'; }

  function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var TEX = {}, MAT = {}, GEO = {};
  function px(g, x, y, c){ g.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; g.fillRect(x, y, 1, 1); }
  function noise(g, r, base, v){ for (var y = 0; y < 16; y++) for (var x = 0; x < 16; x++){ var k = (r() - 0.5) * 2 * v; px(g, x, y, [base[0] + k | 0, base[1] + k | 0, base[2] + k | 0]); } }
  function border(g, c){ for (var i = 0; i < 16; i++){ px(g, i, 0, c); px(g, i, 15, c); px(g, 0, i, c); px(g, 15, i, c); } }
  function mkTex(key, seed, draw, repeat){
    if (TEX[key]) return TEX[key];
    var c = document.createElement('canvas'); c.width = c.height = 16; var g = c.getContext('2d');
    draw(g, rng(seed));
    var t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.encoding = THREE.sRGBEncoding;
    if (repeat){ t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    TEX[key] = t; return t;
  }
  var T = {
    casing: function(){ return mkTex('casing', 11, function(g, r){ noise(g, r, [132,136,134], 12); border(g, [78,82,82]); for (var i = 1; i < 15; i++) px(g, i, 1, [158,162,160]); [[2,2],[13,2],[2,13],[13,13]].forEach(function(p){ px(g, p[0], p[1], [190,192,190]); }); }); },
    gear: function(){ return mkTex('gear', 12, function(g, r){ noise(g, r, [132,136,134], 12); border(g, [78,82,82]);
      for (var a = 0; a < 32; a++){ var t = a / 32 * Math.PI * 2, rr = (a % 4 < 2) ? 5.2 : 4.2; px(g, Math.round(7.5 + Math.cos(t) * rr), Math.round(7.5 + Math.sin(t) * rr), [176,128,52]); }
      [[7,7],[8,8],[7,8],[8,7]].forEach(function(p){ px(g, p[0], p[1], [60,60,60]); }); }); },
    brass: function(){ return mkTex('brass', 13, function(g, r){ noise(g, r, [204,158,62], 16); border(g, [140,98,30]); for (var i = 2; i < 14; i++) px(g, i, 2, [236,196,110]); }); },
    wood: function(){ return mkTex('wood', 14, function(g, r){ noise(g, r, [152,110,64], 10); for (var y = 0; y < 16; y += 4) for (var x = 0; x < 16; x++) px(g, x, y, [104,72,40]); border(g, [92,62,34]); }); },
    chestf: function(){ return mkTex('chestf', 15, function(g, r){ noise(g, r, [152,110,64], 10); for (var y = 0; y < 16; y += 4) for (var x = 0; x < 16; x++) px(g, x, y, [104,72,40]); border(g, [92,62,34]); for (var y2 = 5; y2 < 9; y2++) for (var x2 = 7; x2 < 9; x2++) px(g, x2, y2, [200,204,206]); }); },
    iron: function(){ return mkTex('iron', 16, function(g, r){ noise(g, r, [190,196,200], 9); border(g, [118,124,128]); }); },
    dark: function(){ return mkTex('dark', 17, function(g, r){ noise(g, r, [80,84,88], 8); border(g, [52,56,58]); }); },
    beltside: function(){ return mkTex('beltside', 18, function(g, r){ noise(g, r, [44,48,52], 6); }); },
    belttop: function(){ return mkTex('belttop', 19, function(g, r){ noise(g, r, [54,59,64], 6);
      for (var y = 0; y < 16; y++){ px(g, 0, y, [34,37,40]); px(g, 15, y, [34,37,40]); }
      for (var k = 0; k < 6; k++){ var c = [132,140,146]; px(g, 7 - k, 4 + k, c); px(g, 8 + k, 4 + k, c); px(g, 7 - k, 5 + k, c); px(g, 8 + k, 5 + k, c); } }, true); },
    shaft: function(){ return mkTex('shaft', 20, function(g, r){ noise(g, r, [164,168,170], 8); for (var x = 0; x < 16; x += 4) for (var y = 0; y < 16; y++) px(g, x, y, [120,124,126]); }); },
    green: function(){ return mkTex('green', 21, function(g, r){ noise(g, r, [78,156,92], 10); }); },
    blade: function(){ return mkTex('blade', 22, function(g, r){ noise(g, r, [212,216,220], 6); border(g, [90,94,98]); }); },
    copper: function(){ return mkTex('copper', 23, function(g, r){ noise(g, r, [186,108,64], 10); border(g, [118,64,36]); for (var i = 2; i < 14; i++) px(g, i, 2, [226,156,104]); for (var y = 5; y < 11; y++) for (var x = 5; x < 11; x++) if (x === 5 || x === 10 || y === 5 || y === 10) px(g, x, y, [140,80,46]); }); },
    stone: function(){ return mkTex('stone', 24, function(g, r){ noise(g, r, [124,124,122], 14); }); },
    cloth: function(){ return mkTex('cloth', 25, function(g, r){ noise(g, r, [236,234,226], 6); for (var i = 0; i < 16; i += 3) for (var j = 0; j < 16; j++) px(g, i, j, [214,212,204]); border(g, [150,120,80]); }); },
    log: function(){ return mkTex('log', 26, function(g, r){ noise(g, r, [104,78,48], 10); for (var x = 1; x < 16; x += 3) for (var y = 0; y < 16; y++) if (r() > 0.4) px(g, x, y, [74,54,32]); }); },
    burnLit: function(){ return mkTex('burnlit', 27, function(g, r){ noise(g, r, [236,128,36], 22); for (var x = 0; x < 16; x += 3) for (var y = 0; y < 16; y++) px(g, x, y, [48,42,40]); border(g, [40,36,34]); }); },
    burnCake: function(){ return mkTex('burncake', 28, function(g, r){ noise(g, r, [92,196,236], 20); for (var x = 0; x < 16; x += 3) for (var y = 0; y < 16; y++) px(g, x, y, [36,44,52]); border(g, [30,36,42]); }); }
  };
  function mat(key, opts){
    if (MAT[key]) return MAT[key];
    var o = Object.assign({}, opts || {}); if (!o.map && !o.color && T[key]) o.map = T[key]();
    return (MAT[key] = new THREE.MeshLambertMaterial(o));
  }
  function box(w, h, d){ var k = 'b' + w + '_' + h + '_' + d; return GEO[k] || (GEO[k] = new THREE.BoxGeometry(w, h, d)); }
  function cyl(r, h, s){ var k = 'c' + r + '_' + h + '_' + (s || 12); return GEO[k] || (GEO[k] = new THREE.CylinderGeometry(r, r, h, s || 12)); }
  function mesh(geo, m, x, y, z){ var o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); return o; }
  function label(text, bg, fg){
    var w = Math.max(128, Math.ceil((text.length * 18 + 36) / 32) * 32);
    var c = document.createElement('canvas'); c.width = w; c.height = 64; var g = c.getContext('2d');
    g.fillStyle = bg; g.beginPath(); if (g.roundRect) g.roundRect(4, 8, w - 8, 48, 10); else g.rect(4, 8, w - 8, 48); g.fill();
    g.fillStyle = fg; g.font = 'bold 28px ui-monospace, Menlo, Consolas, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, 33);
    var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
    var s = new THREE.Sprite(new THREE.SpriteMaterial({map:t, depthTest:false, transparent:true}));
    s.scale.set(0.9 * w / 128, 0.45, 1); s.renderOrder = 10; return s;
  }
  function shaftMesh(axis, len){
    var m = mesh(cyl(0.14, len || 1), mat('shaft'));
    if (axis === 'x') m.rotation.z = Math.PI / 2; if (axis === 'z') m.rotation.x = Math.PI / 2;
    return m;
  }
  function baseScene(){
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(cssVar('--viewer'));
    scene.add(new THREE.HemisphereLight(0xffffff, 0x556066, 0.75));
    var sun = new THREE.DirectionalLight(0xffffff, 0.65); sun.position.set(6, 12, 8); scene.add(sun);
    return scene;
  }
  function addGround(scene, minX, maxX, minZ, maxZ){
    var gw = Math.max(maxX - minX, maxZ - minZ) + 6;
    var grid = new THREE.GridHelper(gw, gw, 0x7d898e, 0x7d898e);
    grid.material.transparent = true; grid.material.opacity = 0.25;
    grid.position.set(Math.round((minX + maxX) / 2) + (gw % 2 ? 0 : 0.5), -0.5, Math.round((minZ + maxZ) / 2) + (gw % 2 ? 0 : 0.5));
    scene.add(grid);
  }

  /* ---------- production builds (from the token grids) ---------- */
  function neighborChest(L, zi, xi){
    var rows = L.rows.map(function(r){ return r.split(' '); });
    var dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    for (var i = 0; i < 4; i++){ var nz = zi + dirs[i][1], nx = xi + dirs[i][0];
      if (rows[nz] && rows[nz][nx] && rows[nz][nx][0] === 'C') return dirs[i]; }
    return null;
  }
  function tokenBlock(tok, L, zi, xi, anim){
    var grp = new THREE.Group(), m;
    if (tok === '.' || tok === '~') return null;
    if (tok[0] === 'B'){
      var d = tok[1], f = tok.slice(2);
      grp.add(mesh(box(1, 0.36, 1), mat('beltside'), 0, -0.32, 0));
      var top = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.98), mat('belttop'));
      top.rotation.x = -Math.PI / 2; top.position.y = -0.135;
      var holder = new THREE.Group(); holder.add(top);
      holder.rotation.y = ({'^':0,'<':Math.PI/2,'>':-Math.PI/2,'v':Math.PI})[d];
      grp.add(holder);
      var alongX = (d === '<' || d === '>');
      if (f.indexOf('*') > -1){ var p = mesh(cyl(0.18, 1.08), mat('shaft'), 0, -0.32, 0); if (alongX) p.rotation.x = Math.PI / 2; else p.rotation.z = Math.PI / 2; grp.add(p); }
      if (/[iob]/.test(f)){
        var nb = neighborChest(L, zi, xi);
        if (nb) grp.add(mesh(nb[0] ? box(0.22, 0.5, 0.86) : box(0.86, 0.5, 0.22), f.indexOf('b') > -1 ? mat('brass') : mat('iron'), nb[0] * 0.4, 0.02, nb[1] * 0.4));
      }
      return grp;
    }
    if (tok === 'Ci' || tok === 'Co'){ grp.add(chestMesh()); var lb = label(tok === 'Ci' ? 'IN' : 'OUT', '#8C6640', '#FFF4E6'); lb.position.set(0, 0.75, 0); grp.add(lb); return grp; }
    if (tok === 'G'){ grp.add(mesh(box(1, 1, 1), mat('gear'))); return grp; }
    if (tok === 'S-'){ grp.add(shaftMesh('x')); return grp; }
    if (tok === 'S|'){ grp.add(shaftMesh('z')); return grp; }
    if (tok === 'So'){ grp.add(shaftMesh('y')); return grp; }
    if (tok === 'Pw'){ grp.add(powerIn()); return grp; }
    if (/^[DS]\d$/.test(tok)){
      grp.add(mesh(box(1, 1, 1), mat('casing')));
      grp.add(mesh(box(1.02, 0.22, 1.02), mat('brass'), 0, -0.3, 0));
      grp.add(mesh(cyl(0.11, 0.55), mat('shaft'), 0, -0.72, 0));
      grp.add(mesh(box(0.38, 0.14, 0.38), mat('brass'), 0, -1.02, 0));
      var dl = label(tok, '#C99A3C', '#21180A'); dl.position.set(0, 0.1, -0.85); grp.add(dl);
      return grp;
    }
    if (tok === 'H'){
      grp.add(mesh(box(1, 0.42, 1), mat('dark'), 0, 0.29, 0));
      grp.add(mesh(box(0.5, 0.4, 0.5), mat('dark'), 0, -0.12, 0));
      grp.add(mesh(box(0.26, 0.3, 0.26), mat('dark'), 0, -0.45, 0));
      return grp;
    }
    if (tok === 'P'){
      grp.add(mesh(box(1, 0.72, 1), mat('casing'), 0, 0.14, 0));
      grp.add(mesh(box(0.82, 0.3, 0.82), mat('iron'), 0, -0.4, 0));
      var head = mesh(box(0.82, 0.18, 0.82), mat('iron'), 0, -0.68, 0); grp.add(head);
      anim.push(function(t){ head.position.y = -0.68 - Math.max(0, Math.sin(t * 3 + xi)) * 0.25; });
      return grp;
    }
    if (tok === 'X'){
      grp.add(mesh(box(1, 0.62, 1), mat('casing'), 0, -0.19, 0));
      var blade = mesh(cyl(0.44, 0.07, 16), mat('blade'), 0, 0.2, 0); blade.rotation.x = Math.PI / 2; grp.add(blade);
      anim.push(function(t, dt){ blade.rotation.y -= dt * 6; });
      var sl = label('SAW', '#6C7A86', '#F3F6F8'); sl.position.set(0, 0.9, -0.2); grp.add(sl);
      return grp;
    }
    if (tok === 'c'){ grp.add(cogMesh(xi % 2 ? 1 : -1, anim)); return grp; }
    return null;
  }
  function chestMesh(){ var w = mat('wood'), fr = mat('chestf'); var c = new THREE.Mesh(box(0.875, 0.875, 0.875), [w, w, w, w, fr, fr]); c.position.y = -0.0625; return c; }
  function powerIn(){
    var g = new THREE.Group();
    g.add(mesh(cyl(0.14, 1), mat('green')));
    var cone = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.45, 12), mat('green')); cone.rotation.x = Math.PI; cone.position.y = 0.85; g.add(cone);
    var pl = label('POWER', '#3F7F4C', '#F2FBF3'); pl.position.set(0, 1.45, 0); g.add(pl);
    return g;
  }
  function cogMesh(sign, anim){
    var cog = new THREE.Group(), wm = mat('wood');
    var disc = mesh(cyl(0.36, 0.22, 16), wm); disc.rotation.x = Math.PI / 2; cog.add(disc);
    for (var i = 0; i < 8; i++){ var a = i / 8 * Math.PI * 2; var tth = mesh(box(0.16, 0.16, 0.2), wm, Math.cos(a) * 0.43, Math.sin(a) * 0.43, 0); tth.rotation.z = a; cog.add(tth); }
    var ax = mesh(cyl(0.12, 1), mat('shaft')); ax.rotation.x = Math.PI / 2; cog.add(ax);
    anim.push(function(t, dt){ cog.rotation.z += dt * 2.2 * sign; });
    return cog;
  }
  function itemMesh(kind){
    var colors = {casing:'#C9A040', box:'#B08A58', plate:'#B8BEC2'};
    return new THREE.Mesh(box(0.32, 0.18, 0.32), new THREE.MeshLambertMaterial({color:colors[kind] || '#ccc'}));
  }
  function buildTokenScene(key){
    var B = BUILDS[key], scene = baseScene(), anim = [], layerGroups = [];
    var minX = 99, maxX = -99, minZ = 99, maxZ = -99;
    B.layers.forEach(function(L){
      var lg = new THREE.Group(); lg.userData.y = L.y;
      L.rows.forEach(function(row, zi){
        row.split(' ').forEach(function(tok, xi){
          var blk = tokenBlock(tok, L, zi, xi, anim);
          if (!blk) return;
          var z = B.zs[zi];
          blk.position.set(xi, L.y, z); lg.add(blk);
          minX = Math.min(minX, xi); maxX = Math.max(maxX, xi); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
        });
      });
      scene.add(lg); layerGroups.push(lg);
    });
    addGround(scene, minX, maxX, minZ, maxZ);
    var pts = B.path.map(function(p){ return new THREE.Vector3(p[0], -0.02, p[1]); });
    var segs = [], total = 0;
    for (var i = 0; i < pts.length - 1; i++){ var len = pts[i].distanceTo(pts[i + 1]); segs.push({a:pts[i], b:pts[i + 1], len:len, start:total}); total += len; }
    var n = B.loop ? 5 : 3, items = [];
    for (var j = 0; j < n; j++){ var it = itemMesh(B.item); scene.add(it); items.push(it); }
    var speed = 1.4;
    var place = function(t){
      items.forEach(function(it, k){
        var s = ((t * speed + k * total / n) % total + total) % total;
        for (var q = 0; q < segs.length; q++){ var sg = segs[q]; if (s <= sg.start + sg.len){ it.position.copy(sg.a).lerp(sg.b, (s - sg.start) / sg.len); break; } }
        if (!B.loop){ var fade = s / total; it.visible = fade > 0.02 && fade < 0.98; }
      });
    };
    anim.push(function(t){ place(t); if (TEX.belttop) TEX.belttop.offset.y = -((t * speed) % 1); });
    place(0);
    return {scene:scene, anim:anim, layers:layerGroups, center:new THREE.Vector3((minX + maxX) / 2, 1, (minZ + maxZ) / 2), span:Math.max(maxX - minX + 1, (maxZ - minZ + 1) * 1.4)};
  }

  /* ---------- power builds (placed in code) ---------- */
  function waterMat(){ return MAT.water || (MAT.water = new THREE.MeshLambertMaterial({color:0x3f86d8, transparent:true, opacity:0.42, depthWrite:false})); }
  function put(scene, obj, x, y, z){ obj.position.set(x, y, z); scene.add(obj); return obj; }
  function block(m){ return new THREE.Mesh(box(1, 1, 1), m); }
  function water(scene, x, y, z){ put(scene, new THREE.Mesh(box(1, 1, 1), waterMat()), x, y, z); }
  function tag(scene, text, x, y, z, bg, fg){ put(scene, label(text, bg || '#C99A3C', fg || '#21180A'), x, y, z); }
  function largeWheel(anim){
    var g = new THREE.Group(), spin = new THREE.Group(), wm = mat('wood');
    var hub = mesh(cyl(1.0, 0.7, 20), wm); hub.rotation.z = Math.PI / 2; spin.add(hub);
    for (var i = 0; i < 12; i++){ var a = i / 12 * Math.PI * 2; var pd = mesh(box(0.85, 0.12, 0.62), wm, 0, Math.cos(a) * 1.18, Math.sin(a) * 1.18); pd.rotation.x = a - Math.PI / 2; spin.add(pd); }
    spin.add(shaftMesh('x', 1.0));
    g.add(spin);
    anim.push(function(t, dt){ spin.rotation.x -= dt * 0.9; });
    return g;
  }
  function burner(cake){
    var g = new THREE.Group();
    var m = cake ? mat('burnCake', {map:T.burnCake(), emissive:0x0d3a4a}) : mat('burnLit', {map:T.burnLit(), emissive:0x4a2205});
    g.add(mesh(box(0.92, 0.92, 0.92), m, 0, -0.04, 0));
    return g;
  }
  function engine(dirZ, anim, phase){
    // dirZ: -1 = engine on north face (shaft further north), +1 = south face
    var g = new THREE.Group();
    g.add(mesh(box(0.8, 0.8, 0.55), mat('copper'), 0, 0, -dirZ * 0.2));
    g.add(mesh(box(0.86, 0.2, 0.6), mat('brass'), 0, 0.32, -dirZ * 0.2));
    var rod = mesh(cyl(0.08, 1.5), mat('iron')); rod.rotation.x = Math.PI / 2; rod.position.set(0, 0, dirZ * 0.85); g.add(rod);
    anim.push(function(t){ rod.position.y = Math.sin(t * 6 + phase) * 0.15; });
    return g;
  }
  function pump(){ var g = new THREE.Group(); g.add(mesh(box(0.7, 0.7, 0.7), mat('copper'))); var c = mesh(cyl(0.42, 0.16, 12), mat('wood')); c.rotation.z = Math.PI / 2; g.add(c); return g; }
  function pipe(axis){ var m = mesh(cyl(0.2, 1), mat('copper')); if (axis === 'x') m.rotation.z = Math.PI / 2; if (axis === 'z') m.rotation.x = Math.PI / 2; return m; }
  function hosePulley(depth){ var g = new THREE.Group(); g.add(mesh(box(1, 1, 1), mat('copper'))); var rope = mesh(cyl(0.06, depth), mat('dark'), 0, -0.5 - depth / 2, 0); g.add(rope); return g; }
  function arm(){ var g = new THREE.Group(); g.add(mesh(box(0.9, 0.5, 0.9), mat('brass'), 0, -0.25, 0)); var a1 = mesh(box(0.18, 1.1, 0.18), mat('brass'), 0, 0.4, 0); a1.rotation.z = 0.5; g.add(a1); var a2 = mesh(box(0.18, 0.9, 0.18), mat('brass'), -0.55, 0.85, 0); a2.rotation.z = -1.1; g.add(a2); return g; }

  function boilerScene(opts){
    var scene = baseScene(), anim = [], W = opts.w, H = opts.h;
    for (var x = 0; x < W; x++) for (var z = 0; z < W; z++){
      put(scene, burner(opts.cake), x, 0, z);
      for (var y = 1; y <= H; y++) put(scene, block(mat('copper')), x, y, z);
    }
    var faces = opts.faces, rows = opts.rows, ph = 0;
    faces.forEach(function(fz){
      var ez = fz < 0 ? -1 : W, sz = fz < 0 ? -3 : W + 2;
      rows.forEach(function(y){
        for (var x = 0; x < W; x++){ put(scene, engine(fz, anim, ph += 0.9), x, y, ez); put(scene, shaftMesh('x'), x, y, sz); }
        put(scene, block(mat('gear')), W, y, sz);
      });
    });
    if (faces.length > 1){ for (var z2 = -2; z2 <= W + 1; z2++) put(scene, shaftMesh('z'), W, rows[0], z2); }
    var outY = rows[0], outZ = faces[0] < 0 ? -3 : W + 2;
    for (var xo = W + 1; xo <= W + 2; xo++) put(scene, shaftMesh('x'), xo, outY, outZ);
    tag(scene, opts.out, W + 2, outY + 1.1, outZ, '#3F7F4C', '#F2FBF3');
    // water: each pump pulls from its own 2x2 pool through an open pipe end (vanilla refills the source)
    opts.pumps.forEach(function(pz){
      var py = 2;
      put(scene, pipe('x'), -1, py, pz); put(scene, pipe('x'), -2, py, pz); put(scene, pump(), -3, py, pz); put(scene, pipe('x'), -4, py, pz);
      put(scene, pipe('y'), -5, py, pz); put(scene, pipe('y'), -5, py - 1, pz);
      for (var wx = -6; wx <= -5; wx++) for (var wz = pz; wz <= pz + 1; wz++) water(scene, wx, 0, wz);
      tag(scene, '2x2 POOL', -5.5, py + 1.3, pz + 0.5, '#2F5E96', '#EEF4FB');
    });
    var zmin = Math.min.apply(null, opts.pumps) - 1, zmax = Math.max.apply(null, opts.pumps) + 2;
    put(scene, arm(), opts.arm[0], 0, opts.arm[1]);
    put(scene, chestMesh(), opts.arm[0] + 1, 0, opts.arm[1]);
    tag(scene, 'ARM + COAL', opts.arm[0] + 0.5, 1.5, opts.arm[1] - 0.6, '#6C7A86', '#F3F6F8');
    tag(scene, 'LEVEL ' + opts.level, (W - 1) / 2, H + 1.2, (W - 1) / 2);
    anim.push(function(t){ var k = 0.75 + Math.sin(t * 7) * 0.25; ['burnLit','burnCake'].forEach(function(n){ if (MAT[n]) MAT[n].emissiveIntensity = k; }); });
    addGround(scene, -6, W + 2, Math.min(-3, zmin), Math.max(W + 2, zmax));
    return {scene:scene, anim:anim, layers:[], center:new THREE.Vector3(W / 2 - 1.5, H / 2, W / 2 - 0.5), span:W + 10};
  }

  var SCENES = {
    wheels: function(){
      var scene = baseScene(), anim = [];
      [0, 2, 4].forEach(function(x){
        put(scene, largeWheel(anim), x, 1, 0);
        for (var z = -1; z <= 1; z++) water(scene, x, 3, z);
        for (var y = 2; y >= 0; y--) water(scene, x, y, 2);
        tag(scene, '512 SU', x, 4.3, 0);
      });
      [1, 3, 5].forEach(function(x){ put(scene, shaftMesh('x'), x, 1, 0); });
      put(scene, block(mat('gear')), 6, 1, 0);
      put(scene, block(mat('stone')), 6, 0, 0);
      tag(scene, '1,536 SU @ 4 RPM', 6.5, 2.4, 0, '#3F7F4C', '#F2FBF3');
      addGround(scene, -1, 7, -2, 3);
      return {scene:scene, anim:anim, layers:[], center:new THREE.Vector3(3, 1.5, 0.5), span:9};
    },
    windmill: function(){
      var scene = baseScene(), anim = [];
      var hy = 9;
      for (var y = 0; y < hy; y++) put(scene, block(mat('stone')), 0, y, 0);
      put(scene, block(mat('casing')), 0, hy, 0);
      var plate = mesh(cyl(0.45, 0.12, 16), mat('wood'), 0, hy, -0.52); plate.rotation.x = Math.PI / 2; scene.add(plate);
      put(scene, shaftMesh('z'), 0, hy, 1);
      put(scene, block(mat('gear')), 0, hy, 2);
      for (var y2 = hy - 1; y2 >= 1; y2--) put(scene, shaftMesh('y'), 0, y2, 2);
      put(scene, block(mat('gear')), 0, 0, 2);
      put(scene, shaftMesh('x'), 1, 0, 2); put(scene, shaftMesh('x'), 2, 0, 2);
      tag(scene, '4,096 SU @ 8 RPM', 2.6, 1.3, 2, '#3F7F4C', '#F2FBF3');
      var rotor = new THREE.Group(); rotor.position.set(0, hy, -1); scene.add(rotor);
      rotor.add(mesh(box(1, 1, 1), mat('log')));
      var cells = [];
      for (var dx = 0; dx <= 1; dx++) for (var dy = 1; dy <= 8; dy++) cells.push([dx, dy]);
      var all = [];
      cells.forEach(function(c){ var p = c; for (var r = 0; r < 4; r++){ all.push(p); p = [p[1], -p[0]]; } });
      all.forEach(function(c){ rotor.add(mesh(box(0.98, 0.98, 0.14), mat('cloth'), c[0], c[1], 0)); });
      anim.push(function(t, dt){ rotor.rotation.z -= dt * 0.35; });
      tag(scene, '64 SAILS', 0, hy + 9.6, -1.2);
      addGround(scene, -9, 9, -3, 4);
      return {scene:scene, anim:anim, layers:[], center:new THREE.Vector3(0, hy - 1, 0), span:20};
    },
    boiler4: function(){ return boilerScene({w:2, h:4, cake:false, faces:[1], rows:[2,3], level:4, out:'65,536 SU @ 64 RPM', pumps:[0], arm:[2,-1]}); },
    boiler18: function(){ return boilerScene({w:3, h:8, cake:true, faces:[-1, 1], rows:[2,3,4], level:18, out:'294,912 SU @ 64 RPM', pumps:[0, 2], arm:[-1,-1]}); }
  };

  /* ---------- viewer factory ---------- */
  function createViewer(host, resetBtn){
    var V = {scenes:{}, current:null, visible:true, last:performance.now(), clock:0};
    function fail(msg){
      var d = document.createElement('div'); d.className = 'fallback'; d.textContent = msg; host.appendChild(d);
      if (resetBtn) resetBtn.hidden = true; V.dead = true; return V;
    }
    if (!HAS3D) return fail('The 3D view could not load its library. The text and grids on this page show the same layout.');
    var renderer;
    try { renderer = new THREE.WebGLRenderer({antialias:true}); } catch(e){ return fail('The 3D view needs WebGL, which this browser has turned off. The text and grids on this page show the same layout.'); }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    host.insertBefore(renderer.domElement, host.firstChild);
    var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 300);
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.12;
    controls.maxPolarAngle = Math.PI * 0.495; controls.minDistance = 4; controls.maxDistance = 70;
    function resize(){ var w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    new ResizeObserver(resize).observe(host); resize();
    if ('IntersectionObserver' in window) new IntersectionObserver(function(es){ V.visible = es[0].isIntersecting; }).observe(host);
    var updBg = function(){ Object.keys(V.scenes).forEach(function(k){ V.scenes[k].scene.background = new THREE.Color(cssVar('--viewer')); }); };
    var mq = window.matchMedia('(prefers-color-scheme: dark)'); if (mq.addEventListener) mq.addEventListener('change', updBg);
    new MutationObserver(updBg).observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']});
    function frame(sc){
      var d = (sc.span * 1.1 + 4) * Math.min(1.5, Math.max(1, 1.3 / (camera.aspect || 2)));
      camera.position.set(sc.center.x + d * 0.55, sc.center.y + d * 0.55, sc.center.z + d * 0.8);
      controls.target.copy(sc.center); controls.update();
    }
    if (resetBtn) resetBtn.addEventListener('click', function(){ if (V.current) frame(V.current); });
    V.show = function(key, builder){
      if (!V.scenes[key]) V.scenes[key] = builder(key);
      var sc = V.scenes[key], changed = V.current !== sc; V.current = sc;
      if (changed) frame(sc);
      if (!V.visible || reduceMotion) renderOnce();
    };
    V.setLayer = function(maxY){ if (!V.current) return; V.current.layers.forEach(function(g){ g.visible = maxY == null || g.userData.y <= maxY; }); renderOnce(); };
    function renderOnce(){ if (V.current){ controls.update(); renderer.render(V.current.scene, camera); } }
    controls.addEventListener('change', function(){ if (reduceMotion) renderOnce(); });
    function loop(now){
      requestAnimationFrame(loop);
      var dt = Math.min(0.05, (now - V.last) / 1000); V.last = now;
      if (!V.visible || document.hidden || !V.current) return;
      if (!reduceMotion){ V.clock += dt; V.current.anim.forEach(function(f){ f(V.clock, dt); }); }
      controls.update(); renderer.render(V.current.scene, camera);
    }
    requestAnimationFrame(loop);
    return V;
  }


  /* ---------- more scenes: diesel plant, thermoelectric sandwich, alternator bank ---------- */
  function hugeEngine(dirZ, anim, phase){
    // engine sits 2 blocks from its shaft; dirZ points from engine toward the shaft
    var g = new THREE.Group();
    g.add(mesh(box(0.95, 0.95, 0.95), mat('dark')));
    g.add(mesh(box(1.0, 0.25, 1.0), mat('brass'), 0, 0.3, 0));
    var ex = mesh(cyl(0.12, 0.6), mat('iron'), 0.25, 0.75, 0); g.add(ex);
    var rod = mesh(cyl(0.09, 1.6), mat('iron')); rod.rotation.x = Math.PI / 2; rod.position.set(0, 0, dirZ * 1.0); g.add(rod);
    anim.push(function(t){ rod.position.y = Math.sin(t * 9 + phase) * 0.18; });
    return g;
  }
  function glass(){ return MAT.glass || (MAT.glass = new THREE.MeshLambertMaterial({color:0xcfe6ee, transparent:true, opacity:0.18, depthWrite:false})); }
  function lavaMat(){ return MAT.lava || (MAT.lava = new THREE.MeshLambertMaterial({color:0xff7a1a, emissive:0x7a2a00})); }
  function thermoGen(){
    var g = new THREE.Group();
    g.add(mesh(box(1, 1, 1), mat('iron')));
    g.add(mesh(box(1.02, 0.3, 1.02), mat('copper'), 0, 0, 0));
    return g;
  }
  function alternator(){
    var g = new THREE.Group();
    var body = mesh(cyl(0.42, 0.9, 16), mat('copper')); body.rotation.x = Math.PI / 2; g.add(body);
    g.add(mesh(box(0.9, 0.18, 0.9), mat('brass'), 0, -0.4, 0));
    return g;
  }
  SCENES.diesel20 = function(){
    var scene = baseScene(), anim = [], ph = 0;
    for (var x = 0; x < 20; x++){
      put(scene, shaftMesh('x'), x, 1, 0);
      var side = x % 2 ? 1 : -1;
      put(scene, hugeEngine(-side, anim, ph += 0.7), x, 1, side * 2);
      put(scene, pipe('x'), x, 1, side * 3);
    }
    put(scene, block(mat('gear')), 20, 1, 0);
    put(scene, shaftMesh('x'), 21, 1, 0);
    for (var y = 0; y < 3; y++) for (var z = -3; z <= 3; z += 6) put(scene, block(mat('copper')), -1, y, z);
    tag(scene, 'DIESEL', -1, 3.4, -3, '#3B3F2A', '#F2EED8'); tag(scene, 'DIESEL', -1, 3.4, 3, '#3B3F2A', '#F2EED8');
    tag(scene, '20 HUGE ENGINES', 9.5, 3.2, 0);
    tag(scene, '327,680 SU', 21, 2.4, 0, '#3F7F4C', '#F2FBF3');
    addGround(scene, -2, 22, -4, 4);
    return {scene:scene, anim:anim, layers:[], center:new THREE.Vector3(10, 1, 0), span:21};
  };
  SCENES.thermo = function(){
    var scene = baseScene(), anim = [], n = 8;
    // line along x at y=1: W G L G W G L G W ...; above/below each generator a hot/cold pair; stone spacers; glass keeps fluids in
    for (var x = 0; x <= n * 2; x++){
      var isGen = x % 2 === 1;
      if (isGen){
        put(scene, thermoGen(), x, 1, 0);
        var hotAbove = ((x - 1) / 2) % 2 === 0;
        put(scene, new THREE.Mesh(box(1, 1, 1), hotAbove ? lavaMat() : waterMat()), x, 2, 0);
        put(scene, new THREE.Mesh(box(1, 1, 1), hotAbove ? waterMat() : lavaMat()), x, 0, 0);
        [0, 2].forEach(function(y){ put(scene, new THREE.Mesh(box(1, 1, 1), glass()), x, y, -1); put(scene, new THREE.Mesh(box(1, 1, 1), glass()), x, y, 1); });
      } else {
        var hot = (x / 2) % 2 === 1;
        put(scene, new THREE.Mesh(box(1, 1, 1), hot ? lavaMat() : waterMat()), x, 1, 0);
        put(scene, block(mat('stone')), x, 0, 0); put(scene, block(mat('stone')), x, 2, 0);
        put(scene, new THREE.Mesh(box(1, 1, 1), glass()), x, 1, -1); put(scene, new THREE.Mesh(box(1, 1, 1), glass()), x, 1, 1);
      }
    }
    anim.push(function(t){ MAT.lava.emissiveIntensity = 0.8 + Math.sin(t * 2) * 0.2; });
    tag(scene, '8 GENERATORS · 496 FE/t', n, 3.6, 0);
    addGround(scene, 0, n * 2, -2, 2);
    return {scene:scene, anim:anim, layers:[], center:new THREE.Vector3(n, 1, 0), span:n * 2 + 1};
  };
  SCENES.altbank = function(){
    var scene = baseScene(), anim = [];
    // input shaft from the boiler at 64 RPM, two large->small steps to 256 RPM, then 4 gearboxes with alternators north and south
    put(scene, shaftMesh('x'), -4, 1, 0);
    var big = mesh(cyl(0.9, 0.25, 20), mat('wood'), -3, 1, 0); big.rotation.z = Math.PI / 2; scene.add(big);
    var small = mesh(cyl(0.45, 0.25, 14), mat('wood'), -3, 1, 1.35); small.rotation.z = Math.PI / 2; scene.add(small);
    tag(scene, '64 → 256 RPM', -3, 2.6, 0.6, '#6C7A86', '#F3F6F8');
    put(scene, shaftMesh('x'), -2, 1, 1.35); put(scene, shaftMesh('x'), -1, 1, 1.35);
    for (var x = 0; x < 4; x++){
      put(scene, block(mat('gear')), x, 1, 1.35);
      var a1 = alternator(); put(scene, a1, x, 1, 0.35);
      var a2 = alternator(); put(scene, a2, x, 1, 2.35);
    }
    for (var i = 0; i < 3; i++) put(scene, block(mat('copper')), i, 0, 4);
    tag(scene, 'ACCUMULATOR', 1, 1.2, 4, '#2F5E96', '#EEF4FB');
    tag(scene, '8 × 180 = 1,440 FE/t', 1.5, 2.6, 1.35);
    addGround(scene, -5, 4, -1, 5);
    return {scene:scene, anim:anim, layers:[], center:new THREE.Vector3(0, 1, 1.5), span:9};
  };

  /* ---------- page mounting ---------- */
  function mountBuildStage(o){
    var viewer = createViewer(o.host, o.reset);
    var state = {build:o.start || 'ammo', layer:-1};
    function renderLayerbar(){
      var B = BUILDS[state.build];
      o.layerbar.innerHTML = '<span class="lbl">Layer</span>';
      [{i:-1, name:'Whole build'}].concat(B.layers.map(function(L, i){ return {i:i, name:L.name}; })).forEach(function(it){
        var b = document.createElement('button'); b.type = 'button'; b.id = 'layer-' + state.build + '-' + it.i; b.textContent = it.name;
        b.addEventListener('click', function(){ setLayer(it.i); });
        o.layerbar.appendChild(b);
      });
    }
    function setLayer(i){
      state.layer = i;
      var B = BUILDS[state.build];
      render2d(o.grid, B, i < 0 ? 0 : i);
      o.cap.textContent = i < 0 ? 'The 3D view shows the whole build. The grid shows layer y0. Pick a layer to cut the 3D view down to it.' : B.layers[i].cap;
      if (!viewer.dead) viewer.setLayer(i < 0 ? null : B.layers[i].y);
      o.layerbar.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed', b.id === 'layer-' + state.build + '-' + i ? 'true' : 'false'); });
    }
    function setBuild(key, scroll){
      state.build = key;
      document.querySelectorAll('[data-build]').forEach(function(b){ b.setAttribute('aria-selected', b.getAttribute('data-build') === key ? 'true' : 'false'); });
      document.querySelectorAll('[data-panel]').forEach(function(p){ p.hidden = p.getAttribute('data-panel') !== key; });
      if (!viewer.dead) viewer.show(key, buildTokenScene);
      renderLayerbar(); setLayer(-1);
      try { localStorage.setItem('dc-build', key); } catch(e){}
      if (scroll && o.scrollTo) o.scrollTo.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth'});
    }
    document.querySelectorAll('[data-build]').forEach(function(b){ b.addEventListener('click', function(){ setBuild(b.getAttribute('data-build')); }); });
    document.querySelectorAll('[data-goto]').forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault(); setBuild(a.getAttribute('data-goto'), true); }); });
    var start = state.build, h = (location.hash || '').slice(1);
    if (BUILDS[h]) start = h; else { try { var s = localStorage.getItem('dc-build'); if (BUILDS[s]) start = s; } catch(e){} }
    setBuild(start);
  }
  function mountSceneStage(o){
    var viewer = createViewer(o.host, o.reset);
    var keys = [];
    function set(key){
      document.querySelectorAll('[' + o.tabAttr + ']').forEach(function(b){ b.setAttribute('aria-selected', b.getAttribute(o.tabAttr) === key ? 'true' : 'false'); });
      document.querySelectorAll('[' + o.panelAttr + ']').forEach(function(p){ p.hidden = p.getAttribute(o.panelAttr) !== key; });
      if (!viewer.dead) viewer.show(key, function(k){ return SCENES[k](); });
      try { localStorage.setItem(o.storeKey, key); } catch(e){}
    }
    document.querySelectorAll('[' + o.tabAttr + ']').forEach(function(b){ keys.push(b.getAttribute(o.tabAttr)); b.addEventListener('click', function(){ set(b.getAttribute(o.tabAttr)); }); });
    var start = keys[0], h = (location.hash || '').slice(1);
    if (keys.indexOf(h) > -1) start = h; else { try { var s = localStorage.getItem(o.storeKey); if (keys.indexOf(s) > -1) start = s; } catch(e){} }
    set(start);
  }

  /* ---------- site chrome: theme toggle ---------- */
  function initTheme(){
    var btn = document.getElementById('themeToggle'); if (!btn) return;
    var root = document.documentElement;
    try { var saved = localStorage.getItem('dc-theme'); if (saved) root.setAttribute('data-theme', saved); } catch(e){}
    function label(){ var dark = root.getAttribute('data-theme') === 'dark' || (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches); btn.textContent = dark ? 'Light mode' : 'Dark mode'; return dark; }
    label();
    btn.addEventListener('click', function(){ var dark = label(); var next = dark ? 'light' : 'dark'; root.setAttribute('data-theme', next); try { localStorage.setItem('dc-theme', next); } catch(e){} label(); });
  }

  window.DC = {mountBuildStage:mountBuildStage, mountSceneStage:mountSceneStage, initTheme:initTheme};
  initTheme();
})();
