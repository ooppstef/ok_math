/* ============================================================
 * 换一组练习 · 参数化出题与薄弱点
 *  每个课号注册一个 make(rng, i)：返回一道带解析的四选一题。
 *  题目、答案由代码现算；点选项即判分，解析只讲这道题。
 *  可选：localStorage 记录薄弱点，同一知识点连对 2 次才消除。
 * ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(root);
  else root.MathPractice = factory(root);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  var SPECS = Object.create(null);
  var STORAGE_KEY = 'whyLab.practice.v1';
  var SET_SIZE = 5;
  var currentRng = Math.random;

  /* ---------------- 随机数与通用工具 ---------------- */

  function makeRng(seed) {
    var a = (seed >>> 0) || 0x9e3779b9;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function int(r, a, b) { return a + Math.floor(r() * (b - a + 1)); }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function shuffle(r, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function fmt(n) {
    if (typeof n !== 'number' || !isFinite(n)) return String(n);
    return (Math.round(n * 10000) / 10000).toString();
  }
  function frac(n, d) {
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(n, d);
    n /= g; d /= g;
    return d === 1 ? String(n) : n + '/' + d;
  }
  function money(n) { return (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1'); }

  function pct(n) { return fmt(n) + '%'; }

  /* 四选一：正确答案 + 干扰项，去重后打乱 */
  function mc(q, correct, wrongs, explain, point) {
    var ans = fmt(correct);
    var opts = [ans];
    var seen = {};
    seen[ans] = true;
    (wrongs || []).forEach(function (w) {
      var s = fmt(w);
      if (!seen[s] && opts.length < 4) { seen[s] = true; opts.push(s); }
    });
    var k = 1;
    var guard = 0;
    while (opts.length < 4 && guard < 20) {
      guard += 1;
      var base = Number(correct);
      if (!isFinite(base)) break;
      var cand = String(Math.round((base + k) * 10000) / 10000);
      if (!seen[cand]) { seen[cand] = true; opts.push(cand); }
      k = k > 0 ? -k : (-k + 1);
    }
    if (opts.length !== 4) throw new Error('干扰项不足: ' + q);
    var shuffled = shuffle(currentRng, opts);
    return { q: q, options: shuffled, answer: shuffled.indexOf(ans), explain: explain, point: point };
  }

  /* 选择题：选项已是固定文字 */
  function choice(q, options, answer, explain, point) {
    var opts = shuffle(currentRng, options.map(String));
    var ans = opts.indexOf(String(answer));
    if (ans < 0) throw new Error('答案不在选项里: ' + q);
    return { q: q, options: opts, answer: ans, explain: explain, point: point };
  }

  function register(id, points, make) {
    if (!Array.isArray(points) || !points.length) throw new Error(id + ' 缺少知识点');
    if (typeof make !== 'function') throw new Error(id + ' 缺少出题函数');
    SPECS[id] = { points: points.slice(), make: make };
  }

  function normalize(q, spec) {
    if (!q || !q.q) throw new Error('题目为空');
    var options = (q.options || []).map(String);
    if (options.length !== 4) throw new Error('选项不是 4 个: ' + q.q);
    if (new Set(options).size !== 4) throw new Error('选项重复: ' + q.q);
    var answer = Number(q.answer);
    if (!(answer >= 0 && answer < 4)) throw new Error('答案下标越界: ' + q.q);
    if (!q.explain) throw new Error('缺少解析: ' + q.q);
    if (!q.point || spec.points.indexOf(q.point) < 0) throw new Error('知识点不在本课: ' + q.point);
    return { q: String(q.q), options: options, answer: answer, explain: String(q.explain), point: q.point };
  }

  /* 按种子生成一组题；同组题干不重复 */
  function generate(id, count, seed, preferredPoints) {
    var spec = SPECS[id];
    if (!spec) throw new Error('没有出题器: ' + id);
    var size = count || SET_SIZE;
    var rng = makeRng(seed == null ? (Date.now() ^ Math.floor(Math.random() * 1e9)) : seed);
    currentRng = rng;
    var out = [];
    var review = [];
    var preferred = preferredPoints || [];
    var prioritySize = preferred.length ? Math.ceil(size / 2) : 0;
    // 420 是现有 2～7 种循环题型数量的公倍数，让每种题型都有机会起头。
    var offset = int(rng, 0, 419);
    var seen = Object.create(null);
    var guard = 0;
    try {
      while (out.length < size && guard < 500) {
        if (guard >= 60 && out.length + review.length >= size) break;
        guard += 1;
        var q;
        try { q = spec.make(rng, offset + guard - 1); } catch (e) { throw new Error(id + ' 出题出错: ' + e.message); }
        if (!q) continue;
        var item = normalize(q, spec);
        if (seen[item.q]) continue;
        seen[item.q] = true;
        if (out.length < prioritySize && preferred.indexOf(item.point) < 0) review.push(item);
        else out.push(item);
        if (out.length >= prioritySize) {
          while (out.length < size && review.length) out.push(review.shift());
        }
      }
      while (out.length < size && review.length) out.push(review.shift());
    } finally {
      currentRng = Math.random;
    }
    if (out.length < size) throw new Error(id + ' 题目不够: ' + out.length);
    return shuffle(rng, out);
  }

  function metadata(id) {
    var spec = SPECS[id];
    return spec ? { id: id, points: spec.points.slice() } : null;
  }

  /* ---------------- 薄弱点记录 ---------------- */

  function readStore() {
    try {
      var raw = root.localStorage && root.localStorage.getItem(STORAGE_KEY);
      var data = raw ? JSON.parse(raw) : {};
      return data && typeof data === 'object' ? data : {};
    } catch (e) { return {}; }
  }
  function writeStore(data) {
    try { root.localStorage && root.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }
  function record(lessonId, point, ok) {
    var data = readStore();
    var lesson = data[lessonId];
    var item = lesson && lesson[point];
    if (ok) {
      if (!item) return;
      item.passes += 1;
      item.fails = 0;
      item.cleared = item.passes >= 2;
    } else {
      if (!lesson) lesson = data[lessonId] = {};
      if (!item) item = lesson[point] = { fails: 0, passes: 0, cleared: false };
      item.fails += 1;
      item.passes = 0;
      item.cleared = false;
    }
    item.last = Date.now();
    writeStore(data);
  }
  function weakPoints(lessonId) {
    var lesson = readStore()[lessonId] || {};
    var spec = SPECS[lessonId];
    return Object.keys(lesson).filter(function (k) { return spec && spec.points.indexOf(k) >= 0 && !lesson[k].cleared; }).map(function (k) {
      return { point: k, fails: lesson[k].fails || 0 };
    });
  }
  function weakSummary() {
    var data = readStore();
    var out = [];
    Object.keys(data).forEach(function (id) {
      var spec = SPECS[id];
      if (!spec) return;
      Object.keys(data[id]).forEach(function (point) {
        if (spec.points.indexOf(point) >= 0 && !data[id][point].cleared) out.push({ lesson: id, point: point, fails: data[id][point].fails || 0 });
      });
    });
    return out;
  }
  function resetLesson(lessonId) {
    var data = readStore();
    delete data[lessonId];
    writeStore(data);
  }
  function clearAll() { writeStore({}); }

  /* ---------------- 页面：一组 5 题 ---------------- */

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function mountOne(section) {
    var id = section.getAttribute('data-practice');
    if (!id || !SPECS[id]) return;
    var body = section.querySelector('[data-practice-body]');
    if (!body) return;
    var state = { set: null, index: 0, right: 0 };

    function start() {
      try {
        state.set = generate(id, SET_SIZE, null, weakPoints(id).map(function (w) { return w.point; }));
      } catch (e) {
        body.innerHTML = '';
        body.appendChild(el('p', 'practice-error', '这组题暂时出不来，请刷新页面再试。'));
        return;
      }
      state.index = 0; state.right = 0;
      render();
      weakLine();
    }

    function weakLine() {
      var list = weakPoints(id);
      var box = section.querySelector('[data-practice-weak]');
      if (!box) return;
      box.textContent = list.length
        ? '本课薄弱点：' + list.map(function (w) { return w.point; }).join('、') + '（同类题连对 2 次后消除）'
        : '本课暂无薄弱点。做错的题会记在这里。';
      box.classList.toggle('has-weak', list.length > 0);
    }

    function render() {
      var q = state.set[state.index];
      body.innerHTML = '';
      var head = el('div', 'practice-meta');
      head.appendChild(el('span', 'practice-count', '第 ' + (state.index + 1) + ' / ' + state.set.length + ' 题'));
      head.appendChild(el('span', 'practice-point', q.point));
      body.appendChild(head);
      body.appendChild(el('p', 'practice-q', q.q));

      var opts = el('div', 'practice-options');
      var explain = el('div', 'practice-explain');
      explain.hidden = true;
      explain.setAttribute('aria-live', 'polite');
      var next = el('button', 'practice-next', state.index === state.set.length - 1 ? '看这一组的结果' : '下一题');
      next.type = 'button';
      next.hidden = true;

      q.options.forEach(function (text, i) {
        var btn = el('button', 'practice-option');
        btn.type = 'button';
        btn.appendChild(el('span', 'practice-key', String.fromCharCode(65 + i)));
        btn.appendChild(el('span', 'practice-text', text));
        btn.addEventListener('click', function () {
          if (opts.getAttribute('data-done')) return;
          opts.setAttribute('data-done', '1');
          var ok = i === q.answer;
          Array.prototype.forEach.call(opts.children, function (b, j) {
            b.disabled = true;
            if (j === q.answer) b.classList.add('is-right');
            if (j === i && !ok) b.classList.add('is-wrong');
          });
          if (ok) state.right += 1;
          record(id, q.point, ok);
          weakLine();
          explain.hidden = false;
          explain.innerHTML = '';
          explain.appendChild(el('strong', null, ok ? '对了。' : '再看一步。'));
          explain.appendChild(document.createTextNode(' ' + q.explain));
          next.hidden = false;
          next.focus();
        });
        opts.appendChild(btn);
      });
      body.appendChild(opts);
      body.appendChild(explain);
      body.appendChild(next);

      next.addEventListener('click', function () {
        if (state.index < state.set.length - 1) { state.index += 1; render(); }
        else finish();
      });
    }

    function finish() {
      body.innerHTML = '';
      var done = el('div', 'practice-done');
      done.appendChild(el('p', 'practice-score', '这一组答对 ' + state.right + ' / ' + state.set.length + ' 题。'));
      var tips = weakPoints(id);
      done.appendChild(el('p', 'practice-tip', tips.length
        ? '还没消掉：' + tips.map(function (w) { return w.point; }).join('、') + '。再来一组，优先练这些知识点。'
        : '本课薄弱点已清空，可以换一组继续巩固。'));
      var again = el('button', 'practice-again', '换一组');
      again.type = 'button';
      again.addEventListener('click', start);
      done.appendChild(again);
      body.appendChild(done);
      weakLine();
    }

    start();
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-practice]'), mountOne);
  }

  var api = {
    register: register,
    generate: generate,
    metadata: metadata,
    ids: function () { return Object.keys(SPECS); },
    weakPoints: weakPoints,
    weakSummary: weakSummary,
    resetLesson: resetLesson,
    clearAll: clearAll,
    makeRng: makeRng,
    // 供出题器使用的工具
    int: int,
    pick: pick,
    shuffle: shuffle,
    gcd: gcd,
    lcm: lcm,
    fmt: fmt,
    frac: frac,
    money: money,
    pct: pct,
    mc: mc,
    choice: choice
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else Promise.resolve().then(init);
  }

  return api;
});
