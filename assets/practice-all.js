/* 自动生成：npm run build 会覆盖本文件。源文件为 assets/practice*.js */
/* practice.js */
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

/* practice-g3.js */
/* 三年级 · 参数化练习（每一题都由代码现算） */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./practice.js'));
  else factory(root.MathPractice);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (MP) {
  'use strict';
  var int = MP.int, pick = MP.pick, shuffle = MP.shuffle, mc = MP.mc, choice = MP.choice, fmt = MP.fmt, frac = MP.frac;

  var POINTS = {
    '三上-L03': ['乘法意义', '乘法交换律', '面积模型'],
    '三上-L04': ['平均分', '包含除', '有余数除法'],
    '三上-L05': ['倍的认识', '差与倍', '年龄问题'],
    '三上-L13': ['运算顺序', '小括号', '脱式计算'],
    '三上-L07': ['估算', '近似数', '够不够判断'],
    '三上-L08': ['长度单位', '单位换算', '测量标准'],
    '三上-L14': ['质量单位', '单位换算', '吨的认识'],
    '三上-L18': ['里程表', '三位数加减', '起点与终点'],
    '三上-L09': ['周长', '封闭图形', '线段累加'],
    '三上-L10': ['分数意义', '几分之一', '平均分'],
    '三上-L11': ['集合', '重叠', '容斥'],
    '三上-L12': ['时间单位', '经过时间', '钟面'],
    '三上-L15': ['角', '直角', '角的大小比较'],
    '三上-L16': ['调查', '记录', '统计表'],
    '三上-L17': ['观察物体', '视图', '遮挡'],
    '三上-L19': ['测量', '路线', '估测'],
    '三下-L01': ['除法竖式', '高位起算', '余数'],
    '三下-L02': ['两位数乘法', '拆分', '位值'],
    '三下-L03': ['面积意义', '面积单位', '长方形面积'],
    '三下-L04': ['周长与面积', '等周长变形', '单位区分'],
    '三下-L05': ['面积单位', '平方厘米', '估测面积'],
    '三下-L06': ['小数意义', '十分之几', '小数与分数'],
    '三下-L07': ['年月日', '平年闰年', '日期计算'],
    '三下-L08': ['方向', '相对位置', '路线图'],
    '三下-L09': ['搭配', '乘法原理', '有序枚举'],
    '三下-L10': ['统计表', '行列', '数据整理'],
    '三下-L11': ['周期', '余数', '规律'],
    '三下-L12': ['植树问题', '间隔', '点段关系'],
    '三下-L13': ['轴对称', '平移', '旋转'],
    '三下-L14': ['展开图', '长方体', '面与棱'],
    '三下-L15': ['规律', '小棒摆图', '算式变化'],
    '三下-L16': ['条形统计图', '读图', '数据推断']
  };

  function reg(id, make) { MP.register(id, POINTS[id], make); }

  /* ---------------- 三上 ---------------- */

  reg('三上-L03', function (r, i) {
    var a = int(r, 2, 9), b = int(r, 2, 8);
    if (b === a) b = b === 9 ? 8 : b + 1;
    var mode = (i || 0) % 4;
    if (mode === 0) return mc(a + ' 排，每排 ' + b + ' 个，一共有多少个？', a * b, [a + b, a * b - 1, a * b + 1],
      '求 ' + a + ' 个 ' + b + '，用乘法：' + a + '×' + b + '=' + (a * b) + '（个）。', '乘法意义');
    if (mode === 1) return choice('下面哪个算式表示“' + a + ' 个 ' + b + ' 相加”？',
      shuffle(r, [a + '×' + b, a + '+' + b, a + '-' + b, b + '÷' + a]), a + '×' + b,
      '相同加数连加，可以写成乘法：' + a + '×' + b + '。', '乘法意义');
    if (mode === 2) return choice(a + '×' + b + ' 和 ' + b + '×' + a + ' 的结果一样吗？',
      ['一样', '不一样', '有时一样', '无法判断'], '一样', '交换两个因数的位置，积不变。', '乘法交换律');
    return mc('一个长方形，每排摆 ' + a + ' 个小正方形，摆了 ' + b + ' 排。一共摆了多少个小正方形？', a * b, [a + b, a * b - a, a * b + b],
      '每排 ' + a + ' 个，' + b + ' 排就是 ' + a + '×' + b + '=' + (a * b) + '（个），面积模型也是乘法。', '面积模型');
  });

  reg('三上-L04', function (r, i) {
    var g = int(r, 2, 8), e = int(r, 2, 9), total = g * e, mode = (i || 0) % 3;
    if (mode === 0) return mc('把 ' + total + ' 个苹果平均放进 ' + g + ' 个盘子，每盘放几个？', e, [total - g, e + 1, g],
      '平均分：' + total + '÷' + g + '=' + e + '（个）。', '平均分');
    if (mode === 1) return mc(total + ' 个苹果，每 ' + e + ' 个装一袋，可以装几袋？', g, [e, total - e, g + 1],
      '求 ' + total + ' 里有几个 ' + e + '，用包含除：' + total + '÷' + e + '=' + g + '（袋）。', '包含除');
    var q = int(r, 2, 7), rem = int(r, 1, e - 1), all = e * q + rem;
    return mc(all + ' 个苹果，每 ' + e + ' 个装一袋，最多装满几袋，还剩几个？', q + ' 袋，剩 ' + rem + ' 个',
      [(q + 1) + ' 袋，剩 ' + rem + ' 个', q + ' 袋，剩 ' + (rem + 1) + ' 个', (q - 1) + ' 袋，剩 ' + (rem + e) + ' 个'],
      all + '÷' + e + '=' + q + '……' + rem + '，余数要比除数小。', '有余数除法');
  });

  reg('三上-L05', function (r, i) {
    var b = int(r, 2, 9), k = int(r, 2, 6), a = b * k, mode = (i || 0) % 3;
    if (mode === 0) return mc(a + ' 是 ' + b + ' 的几倍？', k, [a - b, k + 1, b],
      a + '÷' + b + '=' + k + '，所以 ' + a + ' 是 ' + b + ' 的 ' + k + ' 倍。', '倍的认识');
    if (mode === 1) return mc(a + ' 比 ' + b + ' 多多少？', a - b, [k, a + b, b],
      '求多多少用减法：' + a + '−' + b + '=' + (a - b) + '。几倍是除法，多多少是减法，别混。', '差与倍');
    var years = int(r, 2, 4), kid = int(r, 10, 14), k = int(r, 3, 5);
    var dad = kid * k;
    return mc('今年小明 ' + (kid - years) + ' 岁，爸爸 ' + (dad - years) + ' 岁。' + years + ' 年后，爸爸的年龄是小明的几倍？', k,
      [dad - kid, k + 1, years],
      years + ' 年后小明 ' + kid + ' 岁，爸爸 ' + dad + ' 岁，' + dad + '÷' + kid + '=' + k + '。', '年龄问题');
  });

  reg('三上-L13', function (r, i) {
    var a = int(r, 2, 9), b = int(r, 2, 9), c = int(r, 2, 9), mode = (i || 0) % 3;
    if (mode === 0) return mc(a + ' + ' + b + ' × ' + c + ' = ？', a + b * c, [a + b, (a + b) * c, a * b + c],
      '先算乘法：' + b + '×' + c + '=' + (b * c) + '，再加 ' + a + '，得 ' + (a + b * c) + '。', '运算顺序');
    if (mode === 1) return mc('(' + a + ' + ' + b + ') × ' + c + ' = ？', (a + b) * c, [a + b * c, a + b, a * c + b],
      '小括号先算：' + a + '+' + b + '=' + (a + b) + '，再乘 ' + c + '，得 ' + ((a + b) * c) + '。', '小括号');
    var e = int(r, 2, Math.min(5, a * b));
    return mc(a + ' × ' + b + ' − ' + (b * e) + ' ÷ ' + b + ' = ？', a * b - e, [a * b + e, (a * b - b) * e, a - e],
      '先算乘除：' + a + '×' + b + '=' + (a * b) + '，' + (b * e) + '÷' + b + '=' + e + '，再相减得 ' + (a * b - e) + '。', '脱式计算');
  });

  reg('三上-L07', function (r, i) {
    var a = int(r, 12, 29), b = int(r, 3, 8), cost = a * b, c = cost + pick(r, [-5, 5, 10]), mode = (i || 0) % 3;
    if (mode === 0) return choice('每张票 ' + a + ' 元，买 ' + b + ' 张，带 ' + c + ' 元够吗？',
      ['够', '不够', '正好用完', '无法判断'], c >= cost ? '够' : '不够',
      b + ' 张要 ' + a + '×' + b + '=' + cost + ' 元，带 ' + c + ' 元，' + (c >= cost ? '够' : '不够') + '。', '够不够判断');
    if (mode === 1) { var n = int(r, 2, 9) * 100 + int(r, 0, 4) * 10; return mc(n + ' 最接近哪个整百数？', Math.round(n / 100) * 100, [Math.floor(n / 100) * 100, Math.ceil(n / 100) * 100, n - 10],
      '看十位，' + n + ' 约等于 ' + (Math.round(n / 100) * 100) + '。', '近似数'); }
    var x = int(r, 11, 49);
    return mc('先把 ' + x + ' 四舍五入到整十数，再乘 ' + b + '，约是多少？', Math.round(x / 10) * 10 * b, [x * b + 10, Math.round(x / 10) * b, x * b - 10],
      '把 ' + x + ' 看成 ' + (Math.round(x / 10) * 10) + '，' + (Math.round(x / 10) * 10) + '×' + b + '=' + (Math.round(x / 10) * 10 * b) + '。', '估算');
  });

  reg('三上-L08', function (r, i) {
    var a = int(r, 2, 9), mode = (i || 0) % 4;
    if (mode === 0) return mc(a + ' 米 = 多少厘米？', a * 100, [a * 10, a * 1000, a + 100],
      '1 米 = 100 厘米，' + a + ' 米 = ' + a + '×100=' + (a * 100) + ' 厘米。', '单位换算');
    if (mode === 1) { var m = int(r, 1, 5), cm = int(r, 10, 90); return mc(m + ' 米 ' + cm + ' 厘米 = 多少厘米？', m * 100 + cm, [m * 10 + cm, m + cm, m * 100 + cm + 10],
      '1 米 = 100 厘米，' + m + ' 米 = ' + (m * 100) + ' 厘米，再加 ' + cm + '，得 ' + (m * 100 + cm) + ' 厘米。', '单位换算'); }
    if (mode === 3) return mc(a + ' 分米是多少厘米？', a * 10, [a * 100, a + 10, a], '1 分米是 10 厘米，' + a + ' 分米就是 ' + (a * 10) + ' 厘米。', '长度单位');
    return choice('教室的长大约是 8（ ）。', ['米', '厘米', '毫米', '千米'], '米', '教室长约 8 米，用米作单位合适。', '测量标准');
  });

  reg('三上-L14', function (r, i) {
    var a = int(r, 2, 9), b = int(r, 2, 5), mode = (i || 0) % 3;
    if (mode === 0) return mc(a + ' 吨 = 多少千克？', a * 1000, [a * 100, a * 10, a + 1000],
      '1 吨 = 1000 千克，' + a + ' 吨 = ' + a + '×1000=' + (a * 1000) + ' 千克。', '吨的认识');
    if (mode === 1) return mc(b + ' 千克 = 多少克？', b * 1000, [b * 100, b * 10, b + 1000],
      '1 千克 = 1000 克，' + b + ' 千克 = ' + b + '×1000=' + (b * 1000) + ' 克。', '单位换算');
    return choice('一头牛大约重 500（ ）。', ['千克', '克', '吨', '米'], '千克', '500 克太轻，500 吨太重，一头牛约 500 千克。', '质量单位');
  });

  reg('三上-L18', function (r, i) {
    var s = int(r, 100, 800), d = int(r, 20, 300), mode = (i || 0) % 4;
    if (mode === 0) return mc('里程表出发时读数是 ' + s + ' 千米，到达时是 ' + (s + d) + ' 千米。这段路有多长？', d, [s + d, s, d + 10],
      '两次读数相减：' + (s + d) + '−' + s + '=' + d + '（千米）。', '里程表');
    var a = int(r, 120, 680), b = int(r, 120, 310);
    if (mode === 1) return mc(a + ' + ' + b + ' = ？', a + b, [a + b - 10, a + b + 10, a + b - 100],
      '相同数位对齐，从个位加起，满十进一：' + a + '+' + b + '=' + (a + b) + '。', '三位数加减');
    if (mode === 3) return mc('出发时里程表是 ' + s + ' 千米，行驶了 ' + d + ' 千米。到达时读数是多少千米？', s + d, [d, s, s + d + 10], '到达读数 = 出发读数 + 行驶路程：' + s + '+' + d + '=' + (s + d) + '。', '起点与终点');
    var big = a + b;
    return mc(big + ' − ' + a + ' = ？', b, [b + 10, b - 10, a],
      '相同数位对齐，从个位减起：' + big + '−' + a + '=' + b + '。', '三位数加减');
  });

  reg('三上-L09', function (r, i) {
    var a = int(r, 3, 12), b = int(r, 2, 9), mode = (i || 0) % 3;
    if (mode === 0) return mc('长 ' + a + ' 厘米、宽 ' + b + ' 厘米的长方形，周长是多少？', 2 * (a + b), [a + b, a * b, 2 * a + b],
      '长方形周长 =（长+宽）×2 =（' + a + '+' + b + '）×2=' + (2 * (a + b)) + ' 厘米。', '周长');
    if (mode === 1) return mc('边长 ' + a + ' 厘米的正方形，周长是多少？', 4 * a, [a * a, 2 * a, a + 4],
      '正方形周长 = 边长×4 = ' + a + '×4=' + (4 * a) + ' 厘米。', '封闭图形');
    var w = int(r, 2, 8), p = 2 * (a + w);
    return mc('长方形周长 ' + p + ' 厘米，长 ' + a + ' 厘米，宽是多少？', w, [p - a, p / 2, w + 1],
      '长+宽 = ' + p + '÷2=' + (p / 2) + ' 厘米，宽 = ' + (p / 2) + '−' + a + '=' + w + ' 厘米。', '线段累加');
  });

  reg('三上-L10', function (r, i) {
    var d = int(r, 2, 10), n = int(r, 1, d - 1), mode = (i || 0) % 3;
    if (mode === 0) return choice('把一个蛋糕平均分成 ' + d + ' 份，其中 1 份是整个蛋糕的几分之几？',
      [frac(1, d), frac(1, d + 1), frac(d, 1), frac(2, d)], frac(1, d), '平均分成 ' + d + ' 份，1 份就是 ' + frac(1, d) + '。', '几分之一');
    if (mode === 1) return mc(n + '/' + d + ' 表示把整体平均分成几份？', d, [n, n + d, d - n],
      '分母 ' + d + ' 表示平均分成 ' + d + ' 份，分子 ' + n + ' 表示取 ' + n + ' 份。', '分数意义');
    return mc('一个整体平均分成 ' + d + ' 份，涂了 ' + n + ' 份，涂色部分是几分之几？', n + '/' + d, [d + '/' + n, n + '/' + (d + 1), (n + 1) + '/' + d],
      '分母写平均分成的 ' + d + ' 份，分子写涂色的 ' + n + ' 份，就是 ' + n + '/' + d + '。', '平均分');
  });

  reg('三上-L11', function (r, i) {
    var a = int(r, 8, 20), b = int(r, 8, 20), both = int(r, 2, Math.min(a, b) - 1), mode = (i || 0) % 3;
    if (mode === 0) return mc('喜欢苹果的有 ' + a + ' 人，喜欢香蕉的有 ' + b + ' 人，两种都喜欢的有 ' + both + ' 人。至少喜欢其中一种水果的有多少人？', a + b - both,
      [a + b, a + b + both, a - b], '两种都喜欢的人被数了两次，要减去一次：' + a + '+' + b + '−' + both + '=' + (a + b - both) + '（人）。', '容斥');
    if (mode === 2) return mc('喜欢苹果的有 ' + a + ' 人，其中 ' + both + ' 人也喜欢香蕉。只喜欢苹果、不喜欢香蕉的有多少人？', a - both, [a, a + both, both], '从喜欢苹果的人中去掉两种都喜欢的人：' + a + '−' + both + '=' + (a - both) + ' 人。', '集合');
    var total = a + b - both;
    return mc('班里共 ' + total + ' 人，喜欢苹果的 ' + a + ' 人，喜欢香蕉的 ' + b + ' 人，每人至少喜欢一种。两种都喜欢的有几人？', both,
      [a + b - total + 1, total - a, total - b], '两种都喜欢 = ' + a + '+' + b + '−' + total + '=' + both + '（人）。', '重叠');
  });

  reg('三上-L12', function (r, i) {
    function hm(h, m) { return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }
    function after(h, m, add) { var t = h * 60 + m + add; return hm(Math.floor(t / 60), t % 60); }
    var h = int(r, 7, 10), m = pick(r, [0, 5, 10, 15, 20, 30]), dur = pick(r, [15, 20, 25, 30, 40, 45]), mode = (i || 0) % 3;
    var end = after(h, m, dur);
    if (mode === 0) return mc('从 ' + hm(h, m) + ' 开始，过了 ' + dur + ' 分钟是几点？', end,
      [after(h, m, dur + 10), after(h, m, dur - 10), after(h, m, dur + 60)],
      dur + ' 分钟 = ' + Math.floor(dur / 60) + ' 小时 ' + (dur % 60) + ' 分，' + hm(h, m) + ' 加 ' + dur + ' 分是 ' + end + '。', '经过时间');
    if (mode === 2) return mc('钟面上的分针从 12 顺时针走到 3，经过多少分钟？', 15, [3, 30, 5], '每个大格是 5 分钟，走 3 个大格就是 15 分钟。', '钟面');
    var dur2 = pick(r, [20, 30, 40, 50]);
    return mc(hm(h, m) + ' 到 ' + after(h, m, dur2) + '，经过了多长时间？', dur2 + ' 分钟',
      [dur2 + 10 + ' 分钟', dur2 - 10 + ' 分钟', dur2 + ' 小时'], '结束时刻减开始时刻：' + dur2 + ' 分钟。', '时间单位');
  });

  reg('三上-L15', function (r, i) {
    var mode = (i || 0) % 6;
    if (mode === 0) return mc('一个长方形有几个直角？', 4, [1, 2, 3], '长方形的四个角都是直角。', '直角');
    if (mode === 1) return choice('角的大小与两条边画得长短有关吗？', ['无关', '有关', '边越长角越大', '边越短角越大'], '无关',
      '角的大小看两条边张开的程度，与边的长短无关。', '角的大小比较');
    if (mode === 2) return choice('一个角有（ ）。', ['1 个顶点、2 条边', '2 个顶点、1 条边', '2 个顶点、2 条边', '1 个顶点、1 条边'], '1 个顶点、2 条边',
      '角由一个顶点和两条边组成。', '角');
    if (mode === 3) return choice('用三角尺检验一个角是不是直角，要怎样放？', ['顶点重合，一条边对齐，再看另一条边', '只把两条边画长', '只比较边的长短', '随便放上去'], '顶点重合，一条边对齐，再看另一条边', '让三角尺的直角和待测角对齐，看看另一条边能否重合。', '直角');
    if (mode === 4) return choice('锐角、直角、钝角按从小到大排列，正确的是（ ）。', ['锐角＜直角＜钝角', '直角＜锐角＜钝角', '钝角＜直角＜锐角', '锐角＜钝角＜直角'], '锐角＜直角＜钝角',
      '锐角比直角小，钝角比直角大。', '角的大小比较');
    return choice('三角尺上最大的角是（ ）。', ['直角', '锐角', '钝角', '平角'], '直角', '三角尺上有 1 个直角和 2 个锐角。', '直角');
  });

  reg('三上-L16', function (r, i) {
    var n = int(r, 1, 6), extra = int(r, 0, 4), mode = (i || 0) % 3;
    if (mode === 0) { var n0 = int(r, 1, 4); return mc(n0 + ' 个“正”字表示几个人？', n0 * 5, [n0 * 4, n0 * 6, n0 + 5], '“正”字 5 画，一画代表 1 人，' + n0 + ' 个“正”字表示 ' + (n0 * 5) + ' 人。', '记录'); }
    if (mode === 1) return mc(n + ' 个“正”字再多 ' + extra + ' 画，一共记录了多少人？', n * 5 + extra, [n + extra, n * 5, n * 5 + extra + 1],
      '每个“正”字 5 人，' + n + '×5=' + (n * 5) + '，再加 ' + extra + '，得 ' + (n * 5 + extra) + ' 人。', '统计表');
    return choice('调查全班同学最喜欢的运动，第一步应该（ ）。', ['先明确调查的问题', '先画统计图', '先算平均数', '先写答案'], '先明确调查的问题',
      '调查前先把问题说清楚，才知道要记录什么。', '调查');
  });

  reg('三上-L17', function (r, i) {
    var mode = (i || 0) % 6;
    if (mode === 0) return choice('正对一个正方体的前面看，能看到它的（ ）。', ['1 个面', '2 个面', '3 个面', '6 个面'], '1 个面',
      '正对正方体的前面看，其他面被遮住或只露出边线，所以看到 1 个面。', '视图');
    if (mode === 1) return choice('两个物体从正面看形状相同，它们一定完全一样吗？', ['不一定', '一定', '一定不一样', '无法比较'], '不一定',
      '一个方向只能看到一部分，后面或侧面可能不同。', '遮挡');
    if (mode === 2) return choice('人换了位置，看到的物体形状（ ）。', ['可能改变', '一定不变', '一定相同', '与位置无关'], '可能改变',
      '观察位置变了，看到的面和遮挡关系也会变。', '观察物体');
    if (mode === 3) return mc('从一个方向观察长方体，最多能看到几个面？', 3, [1, 2, 6],
      '最多同时看到正面、上面、侧面，共 3 个面。', '观察物体');
    if (mode === 4) return choice('从上面看一个竖放的圆柱，看到的形状是（ ）。', ['圆', '长方形', '三角形', '正方形'], '圆',
      '圆柱的上面是圆形。', '视图');
    return mc('4 个同样的小正方体从左到右摆成一排，从正面能看到几个正方形？', 4, [3, 5, 8],
      '排成一排时，正面看到 4 个正方形并排。', '遮挡');
  });

  reg('三上-L19', function (r, i) {
    var s = int(r, 1, 5), e = s + int(r, 2, 8), mode = (i || 0) % 3;
    if (mode === 0) return mc('尺子的 0 刻度断了，从 ' + s + ' 厘米量到 ' + e + ' 厘米，物体长多少？', e - s, [e, e + s, s],
      '长度 = 末端读数 − 起点读数 = ' + e + '−' + s + '=' + (e - s) + ' 厘米。', '测量');
    if (mode === 1) { var steps = int(r, 5, 20) * 2; return mc('一步约 50 厘米，走 ' + steps + ' 步大约多少米？', steps * 50 / 100, [steps * 50, steps * 5, steps / 2],
      steps + '×50=' + (steps * 50) + ' 厘米 = ' + (steps * 50 / 100) + ' 米。', '估测'); }
    var a = int(r, 20, 80), b = int(r, 20, 80);
    return mc('从教室向东走 ' + a + ' 米，再向北走 ' + b + ' 米，一共走了多少米？', a + b, [Math.abs(a - b), a * b, a + b + 10],
      '路线分两段，总路程 = ' + a + '+' + b + '=' + (a + b) + ' 米。', '路线');
  });

  /* ---------------- 三下 ---------------- */

  reg('三下-L01', function (r, i) {
    var d = int(r, 3, 9), q = int(r, 12, 98), rem = int(r, 0, d - 1), n = d * q + rem, mode = (i || 0) % 3;
    if (mode === 0) return mc(n + ' ÷ ' + d + ' = ？', q + (rem ? '……' + rem : ''), [q + 1 + (rem ? '……' + rem : ''), q + '……' + d, q - 1 + (rem ? '……' + rem : '')],
      n + '÷' + d + '=' + q + (rem ? '……' + rem : '') + '，余数要比除数 ' + d + ' 小。', '除法竖式');
    if (mode === 1) { var x = int(r, 10, 99); return mc('列竖式计算 ' + x + ' ÷ ' + d + '，应从被除数的哪一端开始分？', '高位一端', ['个位一端', '两端同时', '哪一端都行'],
      '从高位开始分。十位不够分，就把前两位合起来分；分完后有余数，再和下一位合起来继续分。', '高位起算'); }
    return mc(n + ' 个苹果，每 ' + d + ' 个装一盘，最多装满几盘，还剩几个？', q + ' 盘，剩 ' + rem + ' 个',
      [(q + 1) + ' 盘，剩 ' + rem + ' 个', q + ' 盘，剩 ' + (rem + 1) + ' 个', (q - 1) + ' 盘，剩 ' + (rem + d) + ' 个'],
      n + '÷' + d + '=' + q + '……' + rem + '。', '余数');
  });

  reg('三下-L02', function (r, i) {
    var a = int(r, 11, 49), b = int(r, 11, 29), ones = b % 10, tens = Math.floor(b / 10) * 10, mode = (i || 0) % 3;
    if (mode === 0) return mc(a + ' × ' + b + ' = ？', a * b, [a * ones + a * tens / 10, a * (b + 1), a * b - a],
      '把 ' + b + ' 拆成 ' + tens + '+' + ones + '：' + a + '×' + tens + '=' + (a * tens) + '，' + a + '×' + ones + '=' + (a * ones) + '，合起来 ' + (a * b) + '。', '拆分');
    if (mode === 1) return mc('计算 ' + a + '×' + b + ' 时，用十位上的数去乘 ' + a + '，得到的积的末位要和哪一位对齐？', '十位', ['个位', '百位', '最高位'],
      '用十位上的数去乘，得到的积表示多少个十，末位要和十位对齐。', '位值');
    return mc('计算 ' + a + '×' + b + ' 时，先算 ' + a + '×' + ones + '=' + (a * ones) + '，再算 ' + a + '×' + tens + '=' + (a * tens) + '。总和是多少？', a * b,
      [a * ones + a * Math.floor(b / 10), a * b + a, a * ones + tens],
      '两部分积相加：' + (a * ones) + '+' + (a * tens) + '=' + (a * b) + '。', '两位数乘法');
  });

  reg('三下-L03', function (r, i) {
    var a = int(r, 3, 12), b = int(r, 2, 9), mode = (i || 0) % 3;
    if (mode === 0) return mc('每排 ' + a + ' 个小正方形，摆了 ' + b + ' 排，面积是多少个小正方形？', a * b, [a + b, 2 * (a + b), a * b + a],
      '一排 ' + a + ' 个，' + b + ' 排就是 ' + a + '×' + b + '=' + (a * b) + ' 个。', '面积意义');
    if (mode === 1) return mc('长 ' + a + ' 厘米、宽 ' + b + ' 厘米的长方形，面积是多少平方厘米？', a * b, [2 * (a + b), a + b, a * b + 1],
      '长方形面积 = 长×宽 = ' + a + '×' + b + '=' + (a * b) + ' 平方厘米。', '长方形面积');
    var area = a * b;
    return mc('长方形面积 ' + area + ' 平方厘米，长 ' + a + ' 厘米，宽是多少？', b, [area - a, area / a + 1, a],
      '宽 = 面积÷长 = ' + area + '÷' + a + '=' + b + ' 厘米。', '面积单位');
  });

  reg('三下-L04', function (r, i) {
    var mode = (i || 0) % 3;
    if (mode === 0) { var p0 = 4 * int(r, 3, 8); return choice('周长都是 ' + p0 + ' 厘米的长方形（长宽不相等）和正方形，谁的面积大？', ['正方形', '长方形', '一样大', '无法比较'], '正方形',
      '周长相同时，越接近正方形面积越大；周长 ' + p0 + ' 的正方形面积是 ' + (p0 * p0 / 16) + ' 平方厘米。', '等周长变形'); }
    var a = int(r, 3, 9), b = int(r, 2, a - 1), p = 2 * (a + b);
    if (mode === 1) return mc('长方形周长 ' + p + ' 厘米，长 ' + a + ' 厘米，面积是多少？', a * b, [p * a, a * b + a, (a + b) * 2],
      '宽 = ' + p + '÷2−' + a + '=' + b + ' 厘米，面积 = ' + a + '×' + b + '=' + (a * b) + ' 平方厘米。', '周长与面积');
    return mc('长 ' + a + ' 厘米、宽 ' + b + ' 厘米的长方形，周长和面积分别是多少？', p + ' 厘米，' + a * b + ' 平方厘米',
      [p + ' 平方厘米，' + a * b + ' 厘米', (a + b) + ' 厘米，' + a * b + ' 平方厘米', p + ' 厘米，' + (a + b) + ' 平方厘米'],
      '周长 =（' + a + '+' + b + '）×2=' + p + ' 厘米；面积 = ' + a + '×' + b + '=' + (a * b) + ' 平方厘米。周长用长度单位，面积用面积单位。', '单位区分');
  });

  reg('三下-L05', function (r, i) {
    var a = int(r, 2, 9), b = int(r, 2, 9), mode = (i || 0) % 3;
    if (mode === 0) { var n = int(r, 2, 9); return mc(n + ' 平方分米 = 多少平方厘米？', n * 100, [n * 10, n * 1000, n + 100], '边长 1 分米 = 10 厘米，1 平方分米 = 100 平方厘米，' + n + ' 平方分米 = ' + (n * 100) + ' 平方厘米。', '面积单位'); }
    if (mode === 1) return mc('长 ' + a + ' 厘米、宽 ' + b + ' 厘米的长方形，面积是多少平方厘米？', a * b, [a + b, 2 * (a + b), a * b + 10],
      a + '×' + b + '=' + (a * b) + ' 平方厘米。', '平方厘米');
    var objs = [['一块橡皮上面的面积', 4, '平方厘米'], ['课桌桌面的面积', 40, '平方分米'], ['教室地面的面积', 50, '平方米'], ['一枚邮票的面积', 4, '平方厘米']];
    var o = pick(r, objs);
    return choice(o[0] + '大约是 ' + o[1] + '（ ）。', ['平方厘米', '平方分米', '平方米', '厘米'], o[2],
      '根据物体大小选择面积单位，' + o[0] + '约 ' + o[1] + o[2] + '。', '估测面积');
  });

  reg('三下-L06', function (r, i) {
    var n = int(r, 1, 9), mode = (i || 0) % 3;
    if (mode === 0) return mc('把 1 米平均分成 10 份，其中 ' + n + ' 份是多少米？', fmt(n / 10), [fmt(n), fmt(n / 100), fmt(n / 10 + 0.1)],
      n + ' 分米 = ' + fmt(n / 10) + ' 米，十分之几可以写成一位小数。', '十分之几');
    if (mode === 1) return mc(n + '/10 写成小数是多少？', fmt(n / 10), [fmt(n), fmt(n / 100), fmt(n + 0.1)],
      n + '/10 = ' + fmt(n / 10) + '。', '小数与分数');
    return choice('0.7 表示（ ）。', ['7 个十分之一', '7 个一', '7 个百分之一', '70 个一'], '7 个十分之一',
      '0.7 的计数单位是十分之一，表示 7 个 0.1。', '小数意义');
  });

  reg('三下-L07', function (r, i) {
    var y = pick(r, [2019, 2020, 2021, 2023, 2024, 2025, 2026]), mode = (i || 0) % 3;
    function leap(x) { return (x % 4 === 0 && x % 100 !== 0) || x % 400 === 0; }
    if (mode === 0) {
      return choice(y + ' 年是平年还是闰年？', ['闰年', '平年', '无法判断', '以上都不对'], leap(y) ? '闰年' : '平年',
        leap(y) ? y + ' 能被 4 整除，是闰年，2 月有 29 天。' : y + ' 不能被 4 整除，是平年，2 月有 28 天。', '平年闰年');
    }
    if (mode === 1) { var m = pick(r, [1, 3, 4, 6, 7, 9, 10, 11, 12]); var days = [4, 6, 9, 11].indexOf(m) >= 0 ? 30 : 31; return mc(m + ' 月有多少天？', days, [days - 1, days + 1, 28], m + ' 月是' + (days === 31 ? '大月，31 天' : '小月，30 天') + '。', '年月日'); }
    var start = int(r, 1, 20), end = start + int(r, 1, 8);
    return mc('从 5 月 ' + start + ' 日到 5 月 ' + end + ' 日，经过了多少天？', end - start, [end - start + 1, end, end - start - 1],
      '同一个月内，日期相减：' + end + '−' + start + '=' + (end - start) + ' 天。', '日期计算');
  });

  reg('三下-L08', function (r, i) {
    var mode = (i || 0) % 6;
    if (mode === 0) return choice('面朝北站立，右手边是（ ）。', ['东', '西', '南', '北'], '东', '面朝北，右手边是东，左手边是西。', '方向');
    if (mode === 1) return choice('A 在 B 的东面，那么 B 在 A 的（ ）。', ['西面', '东面', '南面', '北面'], '西面', '方向相反：东的反方向是西。', '相对位置');
    if (mode === 2) return choice('地图通常按“上北下南、左西右东”绘制，右边是（ ）。', ['东', '西', '南', '北'], '东', '地图右边是东。', '路线图');
    if (mode === 3) return choice('面朝南站立，背后是（ ）。', ['北', '南', '东', '西'], '北', '南的反方向是北。', '方向');
    if (mode === 4) return choice('面朝东站立，左手边是（ ）。', ['北', '南', '东', '西'], '北', '面朝东时，左手边是北。', '方向');
    return choice('早晨太阳从（ ）边升起。', ['东', '西', '南', '北'], '东', '太阳东升西落，可以帮我们辨认方向。', '方向');
  });

  reg('三下-L09', function (r, i) {
    var a = int(r, 2, 5), b = int(r, 2, 5), mode = (i || 0) % 3;
    if (mode === 0) return mc(a + ' 件上衣和 ' + b + ' 条裤子，一共有多少种搭配？', a * b, [a + b, a * b - 1, a * b + 1],
      '每件上衣都能配 ' + b + ' 条裤子，' + a + '×' + b + '=' + (a * b) + ' 种。', '乘法原理');
    if (mode === 1) return mc(a + ' 件上衣和 ' + b + ' 条裤子，其中一套不能搭配，一共有多少种搭配？', a * b - 1, [a * b, a + b - 1, a * b - 2],
      '先算全部 ' + a + '×' + b + '=' + (a * b) + ' 种，再去掉不能搭配的 1 种，得 ' + (a * b - 1) + ' 种。', '搭配');
    return mc('用 1、2、3 三张数字卡片，每次取两张组成两位数，能组成多少个不同的两位数？', 6, [3, 9, 12],
      '十位有 3 种选法，个位有 2 种，3×2=6 个。', '有序枚举');
  });

  reg('三下-L10', function (r, i) {
    var a = int(r, 5, 20), b = int(r, 5, 20), c = int(r, 5, 20), mode = (i || 0) % 3;
    if (a === b && b === c) c += 1;
    var table = '每人只参加一项。统计表：跳绳 ' + a + ' 人，踢毽 ' + b + ' 人，跑步 ' + c + ' 人。';
    if (mode === 0) return mc(table + ' 一共有多少人？', a + b + c, [a + b, a + b + c + 1, Math.max(a, b, c)], '把三行数据相加：' + a + '+' + b + '+' + c + '=' + (a + b + c) + ' 人。', '数据整理');
    if (mode === 1) return mc(table + ' 参加人数最多的项目比最少的多多少人？', Math.max(a, b, c) - Math.min(a, b, c), [Math.max(a, b, c), Math.min(a, b, c), a + b - c],
      '最多 ' + Math.max(a, b, c) + ' 人，最少 ' + Math.min(a, b, c) + ' 人，相差 ' + (Math.max(a, b, c) - Math.min(a, b, c)) + ' 人。', '统计表');
    return choice('从统计表里横着看一行，能知道（ ）。', ['一个项目的人数', '所有项目的总人数', '两个项目的差', '平均数'], '一个项目的人数',
      '横着看一行是一个项目的数据；竖着看一列是同一类数据。', '行列');
  });

  reg('三下-L11', function (r, i) {
    var k = pick(r, [4, 5, 6]), arr = ['红', '黄', '蓝', '绿', '紫', '橙'].slice(0, k), n = int(r, 20, 99), mode = (i || 0) % 3;
    if (mode === 0) { var idx = (n - 1) % k; return mc('按“' + arr.join('、') + '”的顺序重复排列，第 ' + n + ' 个是什么颜色？', arr[idx], [arr[(idx + 1) % k], arr[(idx + 2) % k], arr[(idx + k - 1) % k]], n + '÷' + k + '=' + Math.floor(n / k) + '……' + (n % k) + '。' + (n % k ? '余数是几，就找这一组的第几个。' : '余数是 0，正好排到一组的最后一个。'), '周期'); }
    var days = ['一', '二', '三', '四', '五', '六', '日'], d0 = int(r, 0, 6), add = int(r, 10, 60);
    var d1 = (d0 + add) % 7;
    if (mode === 1) return mc('今天是星期' + days[d0] + '，' + add + ' 天后是星期几？', '星期' + days[d1], ['星期' + days[(d1 + 1) % 7], '星期' + days[(d1 + 6) % 7], '星期' + days[(d1 + 2) % 7]],
      add + '÷7=' + Math.floor(add / 7) + '……' + (add % 7) + '，从星期' + days[d0] + '往后数 ' + (add % 7) + ' 天。', '规律');
    var rem = (n - 1) % k + 1;
    return mc('每 ' + k + ' 个一组，第 ' + n + ' 个是这一组的第几个？', rem, [rem + 1, k, rem - 1],
      '第 ' + n + ' 个前面有 ' + (n - 1) + ' 个，' + (n - 1) + '÷' + k + '=' + Math.floor((n - 1) / k) + '……' + ((n - 1) % k) + '，所以它在这一组的第 ' + rem + ' 个。', '余数');
  });

  reg('三下-L12', function (r, i) {
    var d = pick(r, [2, 4, 5, 10]), seg = int(r, 4, 12), L = d * seg, mode = (i || 0) % 4;
    if (mode === 0) return mc('一条 ' + L + ' 米的路，每隔 ' + d + ' 米栽一棵树（两端都栽），共需多少棵？', seg + 1, [seg, seg + 2, seg - 1],
      '间隔数 = ' + L + '÷' + d + '=' + seg + '；两端都栽，棵数 = 间隔数+1 = ' + (seg + 1) + '。', '植树问题');
    if (mode === 1) return mc('一条 ' + L + ' 米的路，每隔 ' + d + ' 米栽一棵树（只栽一端），共需多少棵？', seg, [seg + 1, seg - 1, seg + 2],
      '只栽一端，棵数 = 间隔数 = ' + seg + '。', '间隔');
    if (mode === 2) return mc('一条 ' + L + ' 米的路，每隔 ' + d + ' 米栽一棵树（两端都不栽），共需多少棵？', seg - 1, [seg, seg + 1, seg - 2],
      '两端都不栽，棵数 = 间隔数−1 = ' + (seg - 1) + '。', '点段关系');
    return mc('一个周长 ' + L + ' 米的圆形花坛，每隔 ' + d + ' 米栽一棵，共需多少棵？', seg, [seg + 1, seg - 1, seg + 2],
      '封闭图形首尾相接，棵数 = 间隔数 = ' + seg + '。', '植树问题');
  });

  reg('三下-L13', function (r, i) {
    var x = int(r, 1, 6), y = int(r, 1, 6), mode = (i || 0) % 3;
    if (mode === 0) { var shapes = [['正方形', 4], ['长宽不相等的长方形', 2], ['等边三角形', 3]]; var s = pick(r, shapes); return choice(s[0] + '有几条对称轴？', ['1 条', '2 条', '3 条', '4 条'], s[1] + ' 条', s[0] + '有 ' + s[1] + ' 条对称轴。', '轴对称'); }
    if (mode === 1) return mc('一张方格纸上的小旗先向右平移 ' + x + ' 格，再向右平移 ' + y + ' 格。一共向右平移几格？', x + y, [Math.abs(x - y), x * y + 1, x + y + 1], '两次都向右，把移动的格数相加：' + x + '+' + y + '=' + (x + y) + ' 格。', '平移');
    var ex = pick(r, ['钟表指针走动', '风车转动', '方向盘转动']);
    return choice('下面哪种运动是旋转？', [ex, '电梯上下', '推拉窗移动', '平移的抽屉'], ex, '绕一个固定点转动是旋转；其余是平移。', '旋转');
  });

  reg('三下-L14', function (r, i) {
    var mode = (i || 0) % 7;
    if (mode === 0) return mc('一个正方体有几个面？', 6, [4, 8, 12], '正方体有上、下、前、后、左、右 6 个面。', '长方体');
    if (mode === 1) return mc('一个正方体有几条棱？', 12, [6, 8, 4], '正方体有 12 条棱、8 个顶点。', '面与棱');
    if (mode === 2) return mc('把正方体沿棱剪开摊平，展开图一共有几个正方形？', 6, [4, 8, 5], '展开前后面的数量不变，仍是 6 个面。', '展开图');
    if (mode === 3) return mc('一个长方体有几个顶点？', 8, [6, 12, 4], '长方体有 8 个顶点。', '长方体');
    if (mode === 4) return choice('正方体的每个面都是（ ）。', ['正方形', '梯形', '三角形', '圆'], '正方形', '正方体六个面都是完全相同的正方形。', '面与棱');
    if (mode === 5) return mc('一个不是正方体的长方体，最多有几个面是正方形？', 2, [1, 4, 6], '长方体可能有两个相对的面是正方形，其余四个面是长方形。', '长方体');
    return choice('正方体的展开图可以只有 5 个正方形吗？', ['不可以', '可以', '有时可以', '看大小'], '不可以', '展开图必须包含全部 6 个面。', '展开图');
  });

  reg('三下-L15', function (r, i) {
    var n = int(r, 3, 12), mode = (i || 0) % 3;
    if (mode === 0) return mc('用小棒摆 ' + n + ' 个正方形（一字排开，相邻两个共用一条边），需要多少根小棒？', 3 * n + 1, [4 * n, 3 * n, 3 * n + 2],
      '第 1 个用 4 根，以后每个增加 3 根：4+3×(' + n + '−1)=' + (3 * n + 1) + ' 根。', '小棒摆图');
    if (mode === 1) return mc('用小棒摆 ' + n + ' 个三角形（一字排开，相邻两个共用一条边），需要多少根小棒？', 2 * n + 1, [3 * n, 2 * n, 3 * n - 1],
      '第 1 个用 3 根，以后每个增加 2 根：3+2×(' + n + '−1)=' + (2 * n + 1) + ' 根。', '规律');
    var start = int(r, 1, 5), step = int(r, 2, 5);
    return mc('找规律：' + start + '、' + (start + step) + '、' + (start + 2 * step) + '、' + (start + 3 * step) + '，下一个数是？', start + 4 * step,
      [start + 3 * step + 1, start + 5 * step, start + 3 * step], '每次加 ' + step + '，所以下一个是 ' + (start + 4 * step) + '。', '算式变化');
  });

  reg('三下-L16', function (r, i) {
    var a = int(r, 5, 25), b = int(r, 5, 25), c = int(r, 5, 25), mode = (i || 0) % 3;
    var desc = '条形统计图：周一 ' + a + ' 人，周二 ' + b + ' 人，周三 ' + c + ' 人。';
    if (mode === 0) {
      var days = ['周一', '周二', '周三'];
      var values = [a, b, c];
      var best = days.filter(function (_, j) { return values[j] === Math.max(a, b, c); }).join('、');
      return mc(desc + ' 哪一天或哪几天的人数最多？', best,
        ['周一', '周二', '周三', '周一、周二', '周一、周三', '周二、周三', '周一、周二、周三'].filter(function (day) { return day !== best; }),
        '最多是 ' + Math.max(a, b, c) + ' 人，对应的是' + best + '。', '读图');
    }
    if (mode === 1) return mc(desc + ' 三天一共有多少人？', a + b + c, [a + b, a + b + c + 5, Math.max(a, b, c)], '把三天的数据相加：' + a + '+' + b + '+' + c + '=' + (a + b + c) + ' 人。', '数据推断');
    return mc(desc + ' 周二和周一相差多少人？', Math.abs(b - a), [a + b, Math.abs(b - a) + 1, b], '周二 ' + b + ' 人，周一 ' + a + ' 人，相差 ' + Math.abs(b - a) + ' 人。', '条形统计图');
  });

  return MP;
});

/* practice-g4a.js */
/* 四年级 · 参数化练习（每一题都由代码现算） */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./practice.js'));
  else factory(root.MathPractice);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (MP) {
  'use strict';
  var int = MP.int, mc = MP.mc, choice = MP.choice;

  var POINTS = {
    '四上-L01': ['大数', '数位', '分级读数'],
    '四上-L02': ['十进制', '进位制', '位值'],
    '四上-L03': ['角的度量', '度', '量角器'],
    '四上-L04': ['平行', '垂直', '同一平面'],
    '四上-L05': ['三位数乘两位数', '部分积', '位值'],
    '四上-L06': ['积的变化规律', '因数', '倍数'],
    '四上-L07': ['除法竖式', '试商', '有余数除法'],
    '四上-L08': ['商不变规律', '被除数与除数', '余数'],
    '四上-L09': ['三角形稳定性', '四边形易变形', '结构'],
    '四上-L10': ['统筹安排', '同时进行', '最短时间'],
    '四上-L11': ['容斥', '重叠', '集合'],
    '四上-L12': ['竖式谜', '位值', '进位退位'],
    '四上-L13': ['数量关系', '单价数量总价', '速度时间路程'],
    '四上-L14': ['量角', '内外圈刻度', '角的加减'],
    '四上-L15': ['估算', '计算器', '验算']
  };

  function reg(id, make) { MP.register(id, POINTS[id], make); }

  /* ---------------- 四上 ---------------- */

  reg('四上-L01', function (r, i) {
    var mode = (i || 0) % 6;
    if (mode === 0) return mc('10 个一千万是多少？', '一亿', ['一千万', '十万', '十亿'], '10 个一千万是一亿。', '大数');
    if (mode === 1) return mc('1 亿 = 多少万？', 10000, [1000, 100, 100000], '1 亿 = 10000 万。', '数位');
    if (mode === 2) return mc('1 亿里面有几个 100 万？', 100, [10, 1000, 10000], '1 亿 = 10000 万 = 100 个 100 万。', '数位');
    if (mode === 3) { var p = int(r, 1, 9); return mc(p + ' 在千万位上，表示多少？', p + ' 千万', [p + ' 百万', p + ' 亿', p + ' 万'], '千万位的计数单位是千万，' + p + ' 表示 ' + p + ' 个千万。', '数位'); }
    if (mode === 4) return choice('读多位数时，先做什么比较不容易错？', ['先分级', '先看个位', '先算加法', '先写答案'], '先分级', '从右往左四位一级，先分级再读数。', '分级读数');
    return mc('比 9999 万多 1 万的数是多少？', '1 亿', ['1 千万', '10 亿', '1000 万'], '9999 万再加 1 万就是 1 亿。', '大数');
  });

  reg('四上-L02', function (r, i) {
    var mode = (i || 0) % 6, n = int(r, 1, 7);
    if (mode === 0) return mc('“满八进一”的计数方法中，一个数位最大能写几？', 7, [8, 9, 10], '满八就进位，所以每位最大是 7。', '进位制');
    if (mode === 1) return mc('八进制数 10 表示十进制的多少？', 8, [10, 9, 16], '八进制 10 = 1×8+0 = 8。', '位值');
    if (mode === 2) return mc('八进制数 17 表示十进制的多少？', 15, [17, 14, 16], '1×8+7=15。', '位值');
    if (mode === 3) return mc('十进制数 ' + (n + 8) + ' 写成八进制是多少？', '1' + n, ['2' + n, '1' + (n + 1), n + '1'], (n + 8) + ' = 1×8 + ' + n + '，所以是 1' + n + '。', '十进制');
    if (mode === 4) return mc('八进制数 100 表示十进制的多少？', 64, [100, 80, 32], '1×8×8=64。', '位值');
    return choice('八进制里为什么没有数字 8？', ['满八就要进一位', '8 不吉利', '8 太大', '8 是偶数'], '满八就要进一位', '每一位只能写 0 到 7，到 8 就向高位进 1。', '进位制');
  });

  reg('四上-L03', function (r, i) {
    var mode = (i || 0) % 6;
    if (mode === 0) return mc('1 个平角是多少度？', 180, [90, 360, 45], '平角的两条边成一条直线，是 180°。', '度');
    if (mode === 1) return mc('1 个周角是多少度？', 360, [180, 90, 270], '周角转一整圈，是 360°。', '度');
    if (mode === 2) return mc('量角器把半圆平均分成 180 份，1 份是多少度？', 1, [2, 10, 180], '半圆 180 份，每份 1°。', '量角器');
    if (mode === 3) return choice('度量角的大小，常用的单位是（ ）。', ['度', '厘米', '千克', '秒'], '度', '角的大小用“度”作单位，记作 °。', '角的度量');
    if (mode === 4) return mc('3 个直角一共多少度？', 270, [180, 90, 360], '3×90°=270°。', '度');
    return choice('量角器上的 0 刻度线对准角的一条边，另一条边落在 50° 刻度上，这个角是（ ）。', ['50°', '130°', '40°', '180°'], '50°', '从 0 刻度读到 50 刻度，就是 50°。', '量角器');
  });

  reg('四上-L04', function (r, i) {
    var mode = (i || 0) % 5;
    if (mode === 0) return choice('在同一平面内，两条永不相交的直线叫做（ ）。', ['平行线', '垂线', '射线', '线段'], '平行线', '同一平面内不相交的两条直线互相平行。', '平行');
    if (mode === 1) return choice('两条直线相交成直角，这两条直线互相（ ）。', ['垂直', '平行', '重合', '倾斜'], '垂直', '相交成直角就是互相垂直。', '垂直');
    if (mode === 2) return mc('过直线外一点，能画几条与已知直线平行的线？', 1, [2, 0, '无数条'], '过直线外一点，有且只有 1 条平行线。', '同一平面');
    if (mode === 3) return choice('长方形的对边互相（ ），邻边互相（ ）。', ['平行，垂直', '垂直，平行', '平行，平行', '垂直，垂直'], '平行，垂直', '长方形对边平行，邻边相交成直角。', '平行');
    return mc('两条直线互相垂直，它们的夹角是多少度？', 90, [180, 45, 60], '垂直的定义就是相交成 90°。', '垂直');
  });

  reg('四上-L05', function (r, i) {
    var a = int(r, 112, 448), b = int(r, 12, 29), ones = b % 10, tens = Math.floor(b / 10) * 10, mode = (i || 0) % 5;
    if (ones === 0) { b += 1; ones = b % 10; tens = Math.floor(b / 10) * 10; }
    if (mode === 0) return mc(a + ' × ' + b + ' = ？', a * b, [a * ones + a * Math.floor(b / 10), a * (b + 1), a * b - a], '把 ' + b + ' 拆成 ' + tens + '+' + ones + '，两部分积相加得 ' + (a * b) + '。', '三位数乘两位数');
    if (mode === 1) return mc(a + ' × ' + ones + ' = ？', a * ones, [a * b, a * tens, a * ones + a], '先算个位：' + a + '×' + ones + '=' + (a * ones) + '。', '部分积');
    if (mode === 2) return mc(a + ' × ' + tens + ' = ？', a * tens, [a * ones, a * b, a * tens / 10], '再算十位：' + a + '×' + tens + '=' + (a * tens) + '。', '部分积');
    if (mode === 3) return mc('计算 ' + a + '×' + b + ' 时，第二层积的末位要和哪一位对齐？', '十位', ['个位', '百位', '千位'], '第二层是 ' + a + '×' + tens + '，表示多少个十，末位对齐十位。', '位值');
    return mc('把两个因数四舍五入到整十数，再估算 ' + a + '×' + b + '，大约是多少？', Math.round(a / 10) * 10 * Math.round(b / 10) * 10, [a * b, Math.round(a / 10) * 10 * Math.round(b / 10) * 10 + 100, Math.round(a / 10) * 10 * Math.round(b / 10) * 10 - 100], '把 ' + a + ' 看成 ' + (Math.round(a / 10) * 10) + '，' + b + ' 看成 ' + (Math.round(b / 10) * 10) + '，估算约 ' + (Math.round(a / 10) * 10 * Math.round(b / 10) * 10) + '。', '三位数乘两位数');
  });

  reg('四上-L06', function (r, i) {
    var a = int(r, 2, 9), b = int(r, 2, 9), k = int(r, 2, 5), mode = (i || 0) % 5;
    if (mode === 0) return mc(a + '×' + b + '=' + (a * b) + '。如果 ' + a + ' 乘 ' + k + '，积变成多少？', a * b * k, [a * b + k, a * k + b, a * b / k], '一个因数乘 ' + k + '，另一个因数不变，积也乘 ' + k + '：' + (a * b) + '×' + k + '=' + (a * b * k) + '。', '积的变化规律');
    if (mode === 1) return mc(a + '×' + b + '=' + (a * b) + '。如果两个因数都乘 ' + k + '，积变成多少？', a * b * k * k, [a * b * k, a * b + k, a * b * 2], '两个因数都乘 ' + k + '，积乘 ' + k + '×' + k + '=' + (k * k) + '，得 ' + (a * b * k * k) + '。', '因数');
    if (mode === 2) return mc(a + '×' + b + '=' + (a * b) + '。如果一个因数乘 10，另一个因数除以 2，积变成多少？', a * b * 5, [a * b * 10, a * b / 2, a * b * 20], '积先乘 10 再除以 2，相当于乘 5，得 ' + (a * b * 5) + '。', '倍数');
    if (mode === 3) return mc(a + '×' + b + '=' + (a * b) + '。如果一个因数乘 ' + k + '，另一个因数除以 ' + k + '，积是多少？', a * b, [a * b * k, a * b / k, a * b + k], '一个乘 ' + k + '、一个除以 ' + k + '，积不变。', '积的变化规律');
    return mc(a + '×' + b + '=' + (a * b) + '。如果 ' + a + ' 增加 ' + k + '，积增加多少？', b * k, [a * k, k, b + k], '增加的积 = 另一个因数×增加的量 = ' + b + '×' + k + '=' + (b * k) + '。', '积的变化规律');
  });

  reg('四上-L07', function (r, i) {
    var d = int(r, 21, 39), q = int(r, 3, 9), rem = int(r, 0, d - 1), n = d * q + rem, mode = (i || 0) % 5;
    if (mode === 0) return mc(n + ' ÷ ' + d + ' = ？', q + (rem ? '……' + rem : ''), [q + 1 + (rem ? '……' + rem : ''), q + '……' + d, q - 1 + (rem ? '……' + rem : '')], n + '÷' + d + '=' + q + (rem ? '……' + rem : '') + '。', '除法竖式');
    if (mode === 1) return choice('试商时，如果用试出的商乘原来的除数，积比被除数大，说明（ ）。', ['商大了，要调小', '商小了，要调大', '商正好', '无法判断'], '商大了，要调小', '乘出的积超过被除数，说明商取大了，要往小调。', '试商');
    if (mode === 2) return mc('把除数 ' + d + ' 四舍五入到十位，得到多少？', Math.round(d / 10) * 10, [Math.floor(d / 10) * 10, Math.ceil(d / 10) * 10, d], '试商时把 ' + d + ' 看作 ' + (Math.round(d / 10) * 10) + '。', '试商');
    if (mode === 3) return mc(n + ' ÷ ' + d + ' 的余数是多少？', rem, [q, d - rem, rem + 1], n + '=' + d + '×' + q + '+' + rem + '，余数是 ' + rem + '。', '有余数除法');
    return mc(n + ' ÷ ' + d + ' 的商是多少？', q, [q + 1, q - 1, d], n + '÷' + d + '=' + q + '……' + rem + '。', '除法竖式');
  });

  reg('四上-L08', function (r, i) {
    var a = int(r, 2, 9), b = int(r, 2, 9), q = int(r, 2, 12), rem = int(r, 0, b - 1), k = int(r, 2, 5), mode = (i || 0) % 5;
    if (mode === 0) return mc(a + '×' + b + '=' + (a * b) + '，' + (a * b) + ' ÷ ' + b + '=' + a + '。如果被除数和除数都乘 ' + k + '，商是多少？', a, [a * k, a + k, a / k], '被除数和除数同时乘 ' + k + '，商不变，仍是 ' + a + '。', '商不变规律');
    if (mode === 1) return mc((a * b * k) + ' ÷ ' + (b * k) + '=' + a + '。如果被除数和除数都除以 ' + k + '，商是多少？', a, [a / k, a * k, a + k], '同时除以同一个数，商不变。', '商不变规律');
    if (mode === 2) { var n = b * q + rem; return mc(n + ' ÷ ' + b + '=' + q + '……' + rem + '。如果被除数和除数都乘 ' + k + '，余数是多少？', rem * k, [rem, rem + k, q * k], '商不变，但余数也要乘 ' + k + '，变成 ' + (rem * k) + '。', '余数'); }
    if (mode === 3) return mc((a * b * k) + ' ÷ ' + (b * k) + ' = ？', a, [a * k, a + k, a / k], '被除数和除数都乘了 ' + k + '，可以同时约去，商是 ' + a + '。', '被除数与除数');
    return choice('商不变的规律中，被除数和除数要（ ）。', ['同时乘或除以相同的数（0 除外）', '同时加相同的数', '只变被除数', '只变除数'], '同时乘或除以相同的数（0 除外）', '必须同时、相同，且不能除以 0。', '商不变规律');
  });

  reg('四上-L09', function (r, i) {
    var mode = (i || 0) % 5;
    if (mode === 0) return choice('三角形具有（ ）。', ['稳定性', '易变形性', '对称性', '旋转性'], '稳定性', '三角形三条边确定后形状就固定了。', '三角形稳定性');
    if (mode === 1) return choice('四边形具有（ ）。', ['易变形性', '稳定性', '不会变形', '只有一条边'], '易变形性', '四边形受压容易变形，所以门框要加斜撑。', '四边形易变形');
    if (mode === 2) return mc('在四边形中加一条对角线，可以把它分成几个三角形？', 2, [1, 3, 4], '一条对角线把四边形分成 2 个三角形。', '结构');
    if (mode === 3) return mc('四边形有几条对角线？', 2, [1, 4, 3], '连接不相邻的两个顶点，四边形共有 2 条对角线。', '结构');
    return choice('门框加一根斜撑后不变形，是利用了（ ）。', ['三角形的稳定性', '四边形的易变形性', '圆的旋转性', '平行线'], '三角形的稳定性', '斜撑和门框组成三角形，形状被固定。', '三角形稳定性');
  });

  reg('四上-L10', function (r, i) {
    var wash = int(r, 8, 12), cup = int(r, 2, 4), tea = int(r, 1, 3), mode = (i || 0) % 5;
    if (mode === 0) return mc('烧水要 ' + wash + ' 分钟，洗茶杯 ' + cup + ' 分钟，找茶叶 ' + tea + ' 分钟。先烧水，烧水时做后面两件事，最少要多少分钟？', wash, [wash + cup + tea, cup + tea, wash + cup], '烧水时同时洗茶杯、找茶叶，总时间就是烧水时间 ' + wash + ' 分钟。', '同时进行');
    if (mode === 1) { var a = int(r, 3, 8), b = int(r, 3, 8); return mc('两件事分别要 ' + a + ' 分钟和 ' + b + ' 分钟，可以同时做，最少要多少分钟？', Math.max(a, b), [a + b, Math.min(a, b), a + b - 1], '同时做，总时间取较长的那件：' + Math.max(a, b) + ' 分钟。', '统筹安排'); }
    if (mode === 2) { var x = int(r, 4, 9), y = int(r, 4, 9), z = int(r, 2, 5); return mc('必须先做 ' + x + ' 分钟的准备，再做 ' + y + ' 分钟的加工，最后 ' + z + ' 分钟检查。最少要多少分钟？', x + y + z, [Math.max(x, y, z), x + y, y + z], '有先后顺序的事不能同时做，时间相加：' + x + '+' + y + '+' + z + '=' + (x + y + z) + ' 分钟。', '最短时间'); }
    if (mode === 3) return choice('下面哪件事适合同时做？', ['烧水时洗茶杯', '穿鞋时穿袜子', '吃饭时睡觉', '先写答案再读题'], '烧水时洗茶杯', '烧水不用人一直看着，可以同时做别的准备工作。', '同时进行');
    return choice('安排做事的顺序时，先要弄清（ ）。', ['哪些事必须先做、哪些能同时做', '哪件事最有趣', '哪件事最难', '谁来做'], '哪些事必须先做、哪些能同时做', '先理清先后和并行关系，才能省时间。', '统筹安排');
  });

  reg('四上-L11', function (r, i) {
    var a = int(r, 10, 25), b = int(r, 10, 25), both = int(r, 2, Math.min(a, b) - 1), mode = (i || 0) % 5;
    if (mode === 0) return mc('参加美术组的有 ' + a + ' 人，参加音乐组的有 ' + b + ' 人，两个组都参加的有 ' + both + ' 人。参加活动的共有多少人？', a + b - both, [a + b, a + b + both, Math.abs(a - b)], '重叠的 ' + both + ' 人被数了两次，要减去：' + a + '+' + b + '−' + both + '=' + (a + b - both) + '。', '重叠');
    if (mode === 1) { var total = a + b - both; return mc('参加活动的共 ' + total + ' 人，美术组 ' + a + ' 人，音乐组 ' + b + ' 人，每人至少参加一个组。两个组都参加的有多少人？', both, [a + b - total + 1, total - a, total - b], '都参加 = ' + a + '+' + b + '−' + total + '=' + both + ' 人。', '容斥'); }
    if (mode === 2) return mc('美术组 ' + a + ' 人，音乐组 ' + b + ' 人，两个组都参加的 ' + both + ' 人。只参加美术组的有多少人？', a - both, [a, a + both, a - b], '只参加美术 = 美术组人数 − 两组都参加 = ' + a + '−' + both + '=' + (a - both) + '。', '集合');
    if (mode === 3) return mc('只参加美术组的 ' + (a - both) + ' 人，只参加音乐组的 ' + (b - both) + ' 人，两组都参加的 ' + both + ' 人。一共有多少人？', a + b - both, [a + b, a + b + both, a + b - 2 * both], '三部分相加：' + (a - both) + '+' + (b - both) + '+' + both + '=' + (a + b - both) + '。', '集合');
    return choice('用两个圈表示两个组，中间重叠的部分表示（ ）。', ['两个组都参加的人', '只参加美术组的人', '只参加音乐组的人', '没有参加的人'], '两个组都参加的人', '重叠部分被两个圈同时包含。', '重叠');
  });

  reg('四上-L12', function (r, i) {
    var d = int(r, 1, 9), mode = (i || 0) % 5;
    if (mode === 0) { var a = int(r, 2, 8), b = int(r, 10, 60), res = a * 10 + d + b; return mc(a + '□ + ' + b + ' = ' + res + '，□ 里填几？', d, [(d + 1) % 10, (d + 9) % 10, (d + 2) % 10], '先算 ' + (a * 10 + d) + '+' + b + '=' + res + '，所以 □=' + d + '。', '竖式谜'); }
    if (mode === 1) { var c = int(r, 3, 8), sub = int(r, 10, Math.min(40, c * 10 + d - 1)), top = c * 10 + d, res2 = top - sub; return mc(c + '□ − ' + sub + ' = ' + res2 + '，□ 里填几？', d, [(d + 1) % 10, (d + 8) % 10, (d + 3) % 10], '被减数是 ' + top + '，' + top + '−' + sub + '=' + res2 + '，所以 □=' + d + '。', '竖式谜'); }
    if (mode === 2) { var m = int(r, 2, 9), q = int(r, 2, 9), prod = (m * 10 + d) * q; return mc(m + '□ × ' + q + ' = ' + prod + '，□ 里填几？', d, [(d + 1) % 10, (d + 2) % 10, (d + 7) % 10], (m * 10 + d) + '×' + q + '=' + prod + '，所以 □=' + d + '。', '竖式谜'); }
    if (mode === 3) { var x = int(r, 1, 8), y = int(r, 2, 8), sum = x + y; return mc('□ + ' + y + ' = ' + sum + '，□ 里填几？', x, [x + 1, x - 1, y], '□ = ' + sum + '−' + y + '=' + x + '。', '位值'); }
    return choice('做竖式谜时，通常先看哪一位？', ['个位', '最高位', '中间一位', '任意一位'], '个位', '个位往往受进位、退位影响最少，先确定个位。', '进位退位');
  });

  reg('四上-L13', function (r, i) {
    var price = int(r, 3, 25), qty = int(r, 3, 12), speed = int(r, 40, 90), time = int(r, 2, 6), mode = (i || 0) % 5;
    if (mode === 0) return mc('每支笔 ' + price + ' 元，买 ' + qty + ' 支，一共要多少元？', price * qty, [price + qty, price * qty + price, price * (qty + 1)], '总价 = 单价×数量 = ' + price + '×' + qty + '=' + (price * qty) + ' 元。', '单价数量总价');
    if (mode === 1) return mc('一共花 ' + (price * qty) + ' 元，买了 ' + qty + ' 支笔，每支多少元？', price, [price * qty, price + qty, price - 1], '单价 = 总价÷数量 = ' + (price * qty) + '÷' + qty + '=' + price + ' 元。', '单价数量总价');
    if (mode === 2) return mc('汽车每小时行 ' + speed + ' 千米，行 ' + time + ' 小时，一共行多少千米？', speed * time, [speed + time, speed * time + speed, speed * (time + 1)], '路程 = 速度×时间 = ' + speed + '×' + time + '=' + (speed * time) + ' 千米。', '速度时间路程');
    if (mode === 3) return mc('汽车 ' + time + ' 小时行 ' + (speed * time) + ' 千米，平均每小时行多少千米？', speed, [speed * time, speed + time, speed - 10], '速度 = 路程÷时间 = ' + (speed * time) + '÷' + time + '=' + speed + ' 千米/时。', '速度时间路程');
    return mc('每秒走 ' + speed + ' 厘米，走 ' + time + ' 秒，一共走多少厘米？', speed * time, [speed + time, speed * time / 10, speed * (time + 1)], '路程 = 速度×时间 = ' + speed + '×' + time + '=' + (speed * time) + ' 厘米。', '数量关系');
  });

  reg('四上-L14', function (r, i) {
    var a = int(r, 20, 80), b = int(r, 20, 80), mode = (i || 0) % 5;
    if (mode === 0) return mc('角的一边对准量角器的 0 刻度，另一边落在 ' + a + '° 刻度上，这个角是多少度？', a + '°', [(180 - a) + '°', (a + 10) + '°', (a - 10) + '°'], '从 0 刻度读到 ' + a + ' 刻度，就是 ' + a + '°。', '量角');
    if (mode === 1) return mc('两个角拼在一起，分别是 ' + a + '° 和 ' + b + '°，拼成的大角是多少度？', (a + b) + '°', [(a + b + 10) + '°', (a + b - 10) + '°', Math.abs(a - b) + '°'], '拼角相加：' + a + '+' + b + '=' + (a + b) + '°。', '角的加减');
    if (mode === 2) { var c = int(r, 30, 89); return mc('一个平角减去 ' + c + '° 的角，剩下多少度？', (180 - c) + '°', [(190 - c) + '°', (170 - c) + '°', (90 - c) + '°'], '平角 180°，180−' + c + '=' + (180 - c) + '°。', '内外圈刻度'); }
    if (mode === 3) return choice('量角时，量角器的中心和角的什么对齐？', ['顶点', '一条边', '另一条边', '任意位置'], '顶点', '中心对顶点，0 刻度线对一条边。', '量角');
    return choice('量角器有内外两圈刻度，读数时要（ ）。', ['从 0 刻度的同一圈读', '内外圈都读', '读外圈就行', '读较大的数'], '从 0 刻度的同一圈读', '角的一边对着哪一圈的 0，就沿那一圈读。', '内外圈刻度');
  });

  reg('四上-L15', function (r, i) {
    var a = int(r, 101, 299), b = int(r, 3, 9), mode = (i || 0) % 5;
    if (mode === 0) return mc('先把 ' + a + ' 四舍五入到整百数，再估算它乘 ' + b + '，结果大约是多少？', Math.round(a / 100) * 100 * b, [a * b, Math.round(a / 10) * 10 * b, Math.round(a / 100) * 100 + b], '把 ' + a + ' 看成 ' + (Math.round(a / 100) * 100) + '，乘 ' + b + ' 约等于 ' + (Math.round(a / 100) * 100 * b) + '。', '估算');
    if (mode === 1) { var x = int(r, 120, 480), y = int(r, 120, 480); return mc('先把两个加数分别四舍五入到整百数，再估算 ' + x + '+' + y + '，大约是多少？', (Math.round(x / 100) + Math.round(y / 100)) * 100, [Math.round(x / 100) * 100 + Math.round(y / 100) * 100, x + y + 100, Math.round((x + y) / 10) * 10], '把两个数分别看成整百数再相加，约等于 ' + ((Math.round(x / 100) + Math.round(y / 100)) * 100) + '。', '估算'); }
    if (mode === 2) return mc('计算器显示 ' + a + '×' + b + '=' + (a * b) + '，用估算检查，结果合理吗？', '合理', ['不合理，差太多', '无法判断', '应该再乘 10'], a + ' 约 ' + (Math.round(a / 100) * 100) + '，乘 ' + b + ' 约 ' + (Math.round(a / 100) * 100 * b) + '，显示结果接近，合理。', '验算');
    if (mode === 3) return choice('用计算器算混合运算时，要特别留心（ ）。', ['运算顺序', '按键颜色', '屏幕大小', '电池'], '运算顺序', '普通计算器按输入顺序算，不一定先乘除后加减。', '计算器');
    return mc('计算 ' + a + '×' + b + ' 时，先估一估，积是几位数？', String(a * b).length + ' 位', [(String(a * b).length + 1) + ' 位', (String(a * b).length - 1) + ' 位', '无法确定'], a + '×' + b + '=' + (a * b) + '，是 ' + String(a * b).length + ' 位数。', '估算');
  });

  return MP;
});

/* practice-g4b.js */
/* 四下 · 参数化练习（每一题都由代码现算） */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./practice.js'));
  else factory(root.MathPractice);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (MP) {
  'use strict';
  var int = MP.int, pick = MP.pick, mc = MP.mc, choice = MP.choice, fmt = MP.fmt;

  var POINTS = {
    '四下-L01': ['运算顺序', '括号', '脱式'],
    '四下-L02': ['加法运算律', '乘法运算律', '简便计算'],
    '四下-L03': ['简便计算', '凑整', '运算律'],
    '四下-L04': ['小数意义', '小数的性质', '数位'],
    '四下-L05': ['小数点移动', '小数乘法', '单位换算'],
    '四下-L06': ['三角形三边关系', '两点之间线段最短', '范围'],
    '四下-L07': ['三角形内角和', '平角', '拼角'],
    '四下-L08': ['平移', '旋转', '轴对称'],
    '四下-L09': ['平均数', '总数与份数', '移多补少'],
    '四下-L10': ['鸡兔同笼', '假设法', '替换'],
    '四下-L11': ['行程问题', '相遇', '追及'],
    '四下-L12': ['数量关系', '单价数量总价', '建模'],
    '四下-L13': ['小数加减', '小数点对齐', '凑整'],
    '四下-L14': ['图形分类', '平行四边形', '梯形'],
    '四下-L15': ['平均数', '总数', '分组比较']
  };
  function reg(id, make) { MP.register(id, POINTS[id], make); }
  function y2(cents) { return (cents / 100).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1'); }

  reg('四下-L01', function (r, i) {
    var a = int(r, 2, 9), b = int(r, 2, 9), c = int(r, 2, 9), mode = (i || 0) % 5;
    if (mode === 0) return mc(a + ' + ' + b + ' × ' + c + ' = ？', a + b * c, [a + b, (a + b) * c, a * b + c], '先乘后加：' + b + '×' + c + '=' + (b * c) + '，再加 ' + a + ' 得 ' + (a + b * c) + '。', '运算顺序');
    if (mode === 1) return mc('(' + a + ' + ' + b + ') × ' + c + ' = ？', (a + b) * c, [a + b * c, a + b, a * c + b], '括号先算：' + a + '+' + b + '=' + (a + b) + '，再乘 ' + c + ' 得 ' + ((a + b) * c) + '。', '括号');
    if (mode === 2) { var d = pick(r, [2, 3, 4]); var cc = d * int(r, 2, 9); return mc(a + ' × ' + b + ' + ' + cc + ' ÷ ' + d + ' = ？', a * b + cc / d, [a * b + cc, a * b + cc * d, (a * b + cc) / d], '先算乘除：' + a + '×' + b + '=' + (a * b) + '，' + cc + '÷' + d + '=' + (cc / d) + '，再相加得 ' + (a * b + cc / d) + '。', '脱式'); }
    if (mode === 3) return mc(a + ' × (' + b + ' + ' + c + ') = ？', a * (b + c), [a * b + c, a * b + a * c + 1, a + b + c], '先算括号：' + b + '+' + c + '=' + (b + c) + '，再乘 ' + a + ' 得 ' + (a * (b + c)) + '。', '括号');
    var c4 = int(r, 1, a * b);
    return mc(a + ' × ' + b + ' − ' + c4 + ' = ？', a * b - c4, [a * (b - c4), a * b + c4, a - b * c4], '先算乘法，再减：' + a + '×' + b + '=' + (a * b) + '，减 ' + c4 + ' 得 ' + (a * b - c4) + '。', '运算顺序');
  });

  reg('四下-L02', function (r, i) {
    var a = int(r, 2, 9), b = int(r, 2, 9), c = int(r, 2, 9), mode = (i || 0) % 5;
    if (mode === 0) return mc(a + ' + ' + b + ' + ' + c + ' = ？', a + b + c, [a + b, a * b + c, a + b * c], '加法结合：先算 ' + a + '+' + b + '=' + (a + b) + '，再加 ' + c + ' 得 ' + (a + b + c) + '。', '加法运算律');
    if (mode === 1) return mc(a + ' × ' + b + ' × ' + c + ' = ？', a * b * c, [a * b + c, a * (b + c), a + b * c], '乘法结合：先算 ' + a + '×' + b + '=' + (a * b) + '，再乘 ' + c + ' 得 ' + (a * b * c) + '。', '乘法运算律');
    if (mode === 2) return mc(a + ' × (' + b + ' + ' + c + ') = ？', a * (b + c), [a * b + c, a * b + a * c + 1, a + b + c], '分配律：' + a + '×' + b + '+' + a + '×' + c + '=' + (a * b) + '+' + (a * c) + '=' + (a * (b + c)) + '。', '乘法运算律');
    if (mode === 3) return mc(a + ' × ' + b + ' + ' + a + ' × ' + c + ' = ？', a * (b + c), [a * b + c, a * (b * c), a + b + c], '提取公因数 ' + a + '：' + a + '×(' + b + '+' + c + ')=' + (a * (b + c)) + '。', '简便计算');
    return choice('a×b=b×a 表示（ ）。', ['乘法交换律', '乘法结合律', '分配律', '加法交换律'], '乘法交换律', '交换两个因数的位置，积不变，是乘法交换律。', '乘法运算律');
  });

  reg('四下-L03', function (r, i) {
    var a = int(r, 3, 19), mode = (i || 0) % 5;
    if (mode === 0) return mc('99 × ' + a + ' = ？', 100 * a - a, [100 * a, 100 * a + a, 99 * a + 1], '99 看成 100−1：100×' + a + '−' + a + '=' + (100 * a - a) + '。', '凑整');
    if (mode === 1) return mc('101 × ' + a + ' = ？', 101 * a, [100 * a - a, 100 * a, 101 * a - a], '101 看成 100+1：100×' + a + '+' + a + '=' + (101 * a) + '。', '简便计算');
    if (mode === 2) return mc('25 × ' + a + ' × 4 = ？', 100 * a, [25 * a + 4, 25 * a, 100 + a], '25×4=100，再乘 ' + a + ' 得 ' + (100 * a) + '。', '运算律');
    if (mode === 3) { var k = int(r, 2, 9); return mc('125 × 8 × ' + k + ' = ？', 1000 * k, [125 * 8 + k, 1000 + k, 125 * k], '125×8=1000，再乘 ' + k + ' 得 ' + (1000 * k) + '。', '凑整'); }
    var b = int(r, 2, 9), c = int(r, 2, 9);
    return mc(a + ' × ' + b + ' + ' + a + ' × ' + c + ' = ？', a * (b + c), [a * b + c, a + b + c, a * (b * c)], '提取 ' + a + '：' + a + '×(' + b + '+' + c + ')=' + (a * (b + c)) + '。', '简便计算');
  });

  reg('四下-L04', function (r, i) {
    var d = int(r, 1, 9), mode = (i || 0) % 5;
    if (mode === 0) return mc('0.' + d + ' 表示（ ）。', d + ' 个十分之一', [d + ' 个一', d + ' 个百分之一', '10 个' + d], '小数点后一位是十分位，0.' + d + ' 表示 ' + d + ' 个 0.1。', '小数意义');
    if (mode === 1) return choice('0.' + d + '0 和 0.' + d + ' 相比，（ ）。', ['大小相等', '0.' + d + '0 大', '0.' + d + ' 大', '无法比较'], '大小相等', '小数末尾添 0，大小不变。', '小数的性质');
    if (mode === 2) { var tens = int(r, 1, 9), ones = int(r, 0, 9); return mc('小数 ' + tens + '.' + ones + d + ' 中，末尾的数字 ' + d + ' 在（ ）位上。', '百分', ['十分', '个', '千分'], '小数点后第一位是十分位，第二位是百分位，' + d + ' 在百分位。', '数位'); }
    if (mode === 3) { var a = int(r, 1, 8), b = int(r, 1, 9); if (a === b) b = b === 9 ? 8 : b + 1; return choice('0.' + a + ' 和 0.' + b + ' 哪个大？', ['0.' + Math.max(a, b), '0.' + Math.min(a, b), '一样大', '无法比较'], '0.' + Math.max(a, b), '十分位上的数大的那个小数大。', '小数意义'); }
    return mc('0.' + d + ' 写成分数是多少？', d + '/10', [d + '/100', '10/' + d, String(d)], '0.' + d + ' 表示 ' + d + ' 个十分之一，写成分数就是 ' + d + '/10。', '小数意义');
  });

  reg('四下-L05', function (r, i) {
    var a = int(r, 11, 99), b = int(r, 1, 9), scale = pick(r, [10, 100]), mode = (i || 0) % 5;
    var base = a / 10;
    if (mode === 0) return mc(fmt(base) + ' × ' + scale + ' = ？', fmt(base * scale), [fmt(base * scale / 10), fmt(base + scale), fmt(base * scale / 100)], '小数点向右移动' + (scale === 10 ? '一' : '两') + '位，得 ' + fmt(base * scale) + '。', '小数点移动');
    if (mode === 1) return mc(fmt(base * scale) + ' ÷ ' + scale + ' = ？', fmt(base), [fmt(base * 10), fmt(base / 10), fmt(base + scale)], '小数点向左移动' + (scale === 10 ? '一' : '两') + '位，得 ' + fmt(base) + '。', '小数点移动');
    if (mode === 2) { var m = int(r, 1, 9); return mc(m + ' 米 = 多少厘米？', m * 100, [m * 10, m * 1000, m + 100], '1 米 = 100 厘米，' + m + ' 米 = ' + (m * 100) + ' 厘米。', '单位换算'); }
    if (mode === 3) return mc('0.0' + b + ' × 1000 = ？', b * 10, [b, b * 100, b / 10], '小数点向右移动三位，0.0' + b + ' 变成 ' + (b * 10) + '。', '小数乘法');
    return mc(fmt(base) + ' × 10 和 ' + fmt(base) + ' ÷ 10 的结果分别是？', fmt(base * 10) + ' 和 ' + fmt(base / 10), [fmt(base / 10) + ' 和 ' + fmt(base * 10), fmt(base * 10) + ' 和 ' + fmt(base * 100), fmt(base) + ' 和 ' + fmt(base)], '乘 10 小数点右移一位，除以 10 左移一位。', '小数点移动');
  });

  reg('四下-L06', function (r, i) {
    var a = int(r, 3, 9), b = int(r, 3, 9), mode = (i || 0) % 5;
    var lo = Math.abs(a - b) + 1, hi = a + b - 1;
    if (mode === 0) return choice('下面哪组线段能围成三角形？', [a + '、' + b + '、' + (lo), a + '、' + b + '、' + (a + b), a + '、' + b + '、' + Math.abs(a - b), a + '、' + b + '、' + (a + b + 1)], a + '、' + b + '、' + lo, '三角形任意两边之和大于第三边，' + lo + ' 在 ' + Math.abs(a - b) + ' 和 ' + (a + b) + ' 之间。', '三角形三边关系');
    if (mode === 1) return mc('三角形两边分别是 ' + a + ' 厘米和 ' + b + ' 厘米，第三边最短是多少厘米（整厘米）？', lo, [Math.abs(a - b), hi, a + b], '第三边要大于 ' + Math.abs(a - b) + '，所以最短是 ' + lo + ' 厘米。', '范围');
    if (mode === 2) return mc('三角形两边分别是 ' + a + ' 厘米和 ' + b + ' 厘米，第三边最长是多少厘米（整厘米）？', hi, [a + b, lo, a + b + 1], '第三边要小于 ' + (a + b) + '，所以最长是 ' + hi + ' 厘米。', '范围');
    if (mode === 3) return choice('从 A 点到 B 点，走哪条路最近？', ['线段 AB', '绕一个大圈', '先向东再向西', '三条路一样'], '线段 AB', '两点之间线段最短。', '两点之间线段最短');
    return choice('三角形任意两边之和（ ）第三边。', ['大于', '小于', '等于', '不确定'], '大于', '这是围成三角形的条件。', '三角形三边关系');
  });

  reg('四下-L07', function (r, i) {
    var a = int(r, 30, 80), b = int(r, 30, 80), mode = (i || 0) % 5;
    if (mode === 0) { var c = 180 - a - b; while (c <= 0 || c === 90) { a = int(r, 30, 70); b = int(r, 30, 70); c = 180 - a - b; } return mc('三角形两个角分别是 ' + a + '° 和 ' + b + '°，第三个角是多少度？', c + '°', [(c + 10) + '°', (c - 10) + '°', (c + 20) + '°'], '三角形内角和 180°，180−' + a + '−' + b + '=' + c + '°。', '三角形内角和'); }
    if (mode === 1) return mc('四边形的内角和是多少度？', 360, [180, 270, 540], '四边形可以分成两个三角形，180°×2=360°。', '拼角');
    if (mode === 2) { var x = int(r, 30, 80), y = int(r, 30, 80); return mc('三角形的一个外角等于与它不相邻的两个内角之和。两个内角是 ' + x + '° 和 ' + y + '°，外角是多少度？', (x + y) + '°', [(x + y + 10) + '°', (x + y - 10) + '°', (x + y + 20) + '°'], '外角 = ' + x + '+' + y + '=' + (x + y) + '°。', '平角'); }
    if (mode === 3) { var z = int(r, 20, 70); return mc('直角三角形的一个锐角是 ' + z + '°，另一个锐角是多少度？', (90 - z) + '°', [(90 - z + 10) + '°', (90 - z - 10) + '°', (90 + z) + '°'], '直角三角形两个锐角之和是 90°，另一个是 ' + (90 - z) + '°。', '三角形内角和'); }
    return choice('把三角形的三个角撕下来拼在一起，会得到一个（ ）。', ['平角', '直角', '周角', '钝角'], '平角', '三个内角拼成一个平角，所以内角和是 180°。', '拼角');
  });

  reg('四下-L08', function (r, i) {
    var x = int(r, 1, 6), y = int(r, 1, 6), mode = (i || 0) % 5;
    if (mode === 0) return mc('把小旗向右平移 ' + x + ' 格，再向右平移 ' + y + ' 格，一共向右平移几格？', x + y, [Math.abs(x - y), x + y + 1, x + y + 2], '方向相同，把格数相加：' + x + '+' + y + '=' + (x + y) + ' 格。', '平移');
    if (mode === 1) return choice('钟面上的指针绕中心从 12 顺时针转到 3，这是哪种运动？', ['旋转', '平移', '轴对称', '放大'], '旋转', '指针绕着钟面中心转动，是旋转。', '旋转');
    if (mode === 2) return mc('长宽不相等的长方形有几条对称轴？', 2, [4, 1, 3], '长方形有 2 条对称轴，是两组对边的中线。', '轴对称');
    if (mode === 3) return mc('正方形有几条对称轴？', 4, [2, 1, 3], '正方形有 4 条对称轴。', '轴对称');
    return choice('平移和旋转的共同点是（ ）。', ['图形的形状和大小都不变', '方向都不变', '位置都不变', '都会变大'], '图形的形状和大小都不变', '平移、旋转只改变位置或方向，不改变形状和大小。', '平移');
  });

  reg('四下-L09', function (r, i) {
    var avg = int(r, 60, 90), d = int(r, 2, 10), e = int(r, 2, 10), mode = (i || 0) % 5;
    var nums = [avg + d, avg - d, avg + e, avg - e];
    if (mode === 0) return mc('四次成绩分别是 ' + nums.join('、') + ' 分，平均分是多少？', avg, [avg + 1, avg - 1, nums[0]], '四个数相加再除以 4，平均分是 ' + avg + '。', '平均数');
    if (mode === 1) return mc('四次测验的平均分是 ' + avg + ' 分，总分是多少？', avg * 4, [avg + 4, avg * 3, avg * 4 + 4], '总分 = 平均数×份数 = ' + avg + '×4=' + (avg * 4) + ' 分。', '总数与份数');
    if (mode === 2) { var a = avg, b = avg + d, c = avg - d; return mc('四个人平均 ' + avg + ' 分，其中三人共 ' + (a + b + c) + ' 分，第四人多少分？', avg, [avg + 1, avg - 1, a + b + c], '总分 ' + avg * 4 + ' 分，减去三人总分 ' + (a + b + c) + '，第四人 ' + avg + ' 分。', '移多补少'); }
    if (mode === 3) return mc('小明 ' + (avg + d) + ' 分，平均分 ' + avg + ' 分。小明比平均分高多少分？', d, [avg, d + 1, avg + d], (avg + d) + '−' + avg + '=' + d + ' 分。', '移多补少');
    return choice('两个班的平均分分别是 80 分和 90 分，能直接把 (80+90)÷2 当作两个班合起来的平均分吗？', ['不能，要看人数', '能，总是对的', '能，因为都是平均分', '不能，因为平均分不能相加'], '不能，要看人数', '人数不同时，两个平均数不能直接再平均，要用总分÷总人数。', '平均数');
  });

  reg('四下-L10', function (r, i) {
    var H = int(r, 8, 20), R = int(r, 2, H - 2), C = H - R, F = 2 * C + 4 * R, mode = (i || 0) % 5;
    if (mode === 0) return mc('鸡兔同笼：共 ' + H + ' 个头，' + F + ' 只脚。兔有几只？', R, [C, R + 1, R - 1], '假设全是鸡，脚少 ' + (F - 2 * H) + ' 只；每换一只兔多 2 只脚，兔 = ' + (F - 2 * H) + '÷2=' + R + ' 只。', '鸡兔同笼');
    if (mode === 1) return mc('鸡兔同笼：共 ' + H + ' 个头，' + F + ' 只脚。鸡有几只？', C, [R, C + 1, C - 1], '兔 ' + R + ' 只，鸡 = ' + H + '−' + R + '=' + C + ' 只。', '假设法');
    if (mode === 2) { var tri = int(r, 2, 9), bike = int(r, 2, 10), wheels = 2 * bike + 3 * tri; return mc('自行车和三轮车共 ' + (bike + tri) + ' 辆，轮子 ' + wheels + ' 个。三轮车有几辆？', tri, [bike, tri + 1, tri - 1], '假设全是自行车，轮子少 ' + (wheels - 2 * (bike + tri)) + ' 个；每换一辆三轮车多 1 个轮子，三轮车 ' + tri + ' 辆。', '替换'); }
    if (mode === 3) return mc('鸡兔共 ' + H + ' 个头。假设全是鸡，一共有多少只脚？', 2 * H, [4 * H, F, 2 * H + 2], '每只鸡 2 只脚，' + H + '×2=' + (2 * H) + ' 只。', '假设法');
    return mc('鸡兔共 ' + H + ' 个头，' + F + ' 只脚。假设全是鸡，比实际少多少只脚？', F - 2 * H, [2 * H, F, 4 * H - F], '实际 ' + F + ' 只，假设全是鸡 ' + (2 * H) + ' 只，少 ' + (F - 2 * H) + ' 只。', '鸡兔同笼');
  });

  reg('四下-L11', function (r, i) {
    var v1 = int(r, 50, 90), v2 = int(r, 30, 60), t = int(r, 2, 5), mode = (i || 0) % 5;
    if (v1 === v2) v2 += 1;
    var D = (v1 + v2) * t;
    if (mode === 0) return mc('两地相距 ' + D + ' 米，两人分别以 ' + v1 + ' 米/分和 ' + v2 + ' 米/分同时从两地出发，相向而行，几分钟相遇？', t, [D / v1, D / v2, t + 1], '相遇时间 = 路程÷速度和 = ' + D + '÷(' + v1 + '+' + v2 + ')=' + t + ' 分钟。', '相遇');
    if (mode === 1) { var a = int(r, 60, 90), b = int(r, 30, 50), tt = int(r, 2, 5), gap = (a - b) * tt; return mc('甲以 ' + a + ' 米/分追乙，乙以 ' + b + ' 米/分先走，两人相距 ' + gap + ' 米，几分钟追上？', tt, [gap / a, gap / b, tt + 1], '追及时间 = 路程差÷速度差 = ' + gap + '÷(' + a + '−' + b + ')=' + tt + ' 分钟。', '追及'); }
    if (mode === 2) return mc('两人速度分别是 ' + v1 + ' 米/分和 ' + v2 + ' 米/分，同时从两地出发，相向而行 ' + t + ' 分钟相遇。两地相距多少米？', D, [v1 * t, v2 * t, (v1 - v2) * t], '路程 = 速度和×时间 = (' + v1 + '+' + v2 + ')×' + t + '=' + D + ' 米。', '行程问题');
    if (mode === 3) { var v = D / t; return mc('两地相距 ' + D + ' 米，两人同时从两地出发，相向而行 ' + t + ' 分钟相遇，一人每分钟走 ' + v2 + ' 米，另一人每分钟走多少米？', v - v2, [v, v + v2, v2], '速度和 = ' + D + '÷' + t + '=' + v + ' 米/分，另一人 ' + v + '−' + v2 + '=' + (v - v2) + ' 米/分。', '相遇'); }
    return mc('甲每分钟走 ' + v1 + ' 米，乙每分钟走 ' + v2 + ' 米，两人同时从同一地点出发，同向而行 ' + t + ' 分钟，两人相差多少米？', Math.abs(v1 - v2) * t, [v1 * t, (v1 + v2) * t, v2 * t], '每分钟相差 ' + Math.abs(v1 - v2) + ' 米，' + t + ' 分钟相差 ' + (Math.abs(v1 - v2) * t) + ' 米。', '追及');
  });

  reg('四下-L12', function (r, i) {
    var price = int(r, 3, 20), qty = int(r, 2, 10), mode = (i || 0) % 5;
    if (mode === 0) return mc('每个笔记本 ' + price + ' 元，买 ' + qty + ' 个，一共多少元？', price * qty, [price + qty, price * qty + price, price * (qty + 1)], '总价 = 单价×数量 = ' + price + '×' + qty + '=' + (price * qty) + ' 元。', '单价数量总价');
    if (mode === 1) { var pay = price * qty + int(r, 5, 50); return mc('买 ' + qty + ' 个笔记本共 ' + (price * qty) + ' 元，付了 ' + pay + ' 元，找回多少元？', pay - price * qty, [pay - price, pay + price * qty, price * qty], '找回 = 付出的钱−总价 = ' + pay + '−' + (price * qty) + '=' + (pay - price * qty) + ' 元。', '建模'); }
    if (mode === 2) { var cost = int(r, 2, 10), sell = cost + int(r, 1, 5), n = int(r, 2, 9); return mc('每件进价 ' + cost + ' 元，售价 ' + sell + ' 元，卖 ' + n + ' 件共赚多少元？', (sell - cost) * n, [sell * n, cost * n, sell - cost], '每件赚 ' + (sell - cost) + ' 元，' + n + ' 件赚 ' + ((sell - cost) * n) + ' 元。', '数量关系'); }
    if (mode === 3) { var fee = int(r, 5, 15), p = int(r, 2, 8), n = int(r, 2, 8); return mc('入场费 ' + fee + ' 元，每个项目 ' + p + ' 元，玩 ' + n + ' 个项目，一共要多少元？', fee + p * n, [fee * n + p, p * n, fee + p + n], '总费用 = 入场费 + 项目费 = ' + fee + '+' + p + '×' + n + '=' + (fee + p * n) + ' 元。', '建模'); }
    return mc('买 ' + qty + ' 支笔共 ' + (price * qty) + ' 元，每支多少元？', price, [price * qty, price + qty, price - 1], '单价 = 总价÷数量 = ' + (price * qty) + '÷' + qty + '=' + price + ' 元。', '单价数量总价');
  });

  reg('四下-L13', function (r, i) {
    var A = int(r, 100, 900), B = int(r, 100, 900), mode = (i || 0) % 5;
    if (mode === 0) return mc(y2(A) + ' + ' + y2(B) + ' = ？', y2(A + B), [y2(A + B + 10), y2(A + B - 10), y2(A + B + 100)], '小数点对齐，按整数加法算，再点小数点：' + y2(A) + '+' + y2(B) + '=' + y2(A + B) + '。', '小数加减');
    if (mode === 1) { var big = Math.max(A, B), small = Math.min(A, B); return mc(y2(big) + ' − ' + y2(small) + ' = ？', y2(big - small), [y2(big + small), y2(big - small + 10), y2(big - small - 10)], '小数点对齐再相减，得 ' + y2(big - small) + '。', '小数点对齐'); }
    if (mode === 2) return mc('10 − ' + y2(A) + ' = ？', y2(1000 - A), [y2(1000 + A), y2(100 - A), y2(1000 - A + 10)], '把 10 看成 10.00，对齐小数点相减，得 ' + y2(1000 - A) + '。', '凑整');
    if (mode === 3) return mc(y2(A) + ' + ' + y2(1000 - A) + ' = ？', 10, [10.1, 9.9, 100], '两个数凑成 10：' + y2(A) + '+' + y2(1000 - A) + '=10。', '凑整');
    return choice('计算小数加减法时，最重要的是（ ）。', ['小数点对齐', '末位对齐', '从高位算起', '把小数去掉'], '小数点对齐', '小数点对齐，相同数位才对齐。', '小数加减');
  });

  reg('四下-L14', function (r, i) {
    var mode = (i || 0) % 5;
    if (mode === 0) return choice('正方形是长方形吗？', ['是', '不是', '有时是', '无法判断'], '是', '正方形是长和宽相等的长方形，具有长方形的全部特征。', '图形分类');
    if (mode === 1) return choice('只有一组对边平行的四边形叫做（ ）。', ['梯形', '平行四边形', '长方形', '正方形'], '梯形', '梯形只有一组对边平行。', '梯形');
    if (mode === 2) return choice('平行四边形的两组对边（ ）。', ['分别平行且相等', '只有一组平行', '都不平行', '都垂直'], '分别平行且相等', '平行四边形两组对边分别平行且相等。', '平行四边形');
    if (mode === 3) return choice('下面哪个图形不是平行四边形？', ['梯形', '长方形', '正方形', '菱形'], '梯形', '梯形只有一组对边平行，不是平行四边形。', '图形分类');
    return choice('把图形分类前，首先要确定（ ）。', ['按什么标准分', '哪个图形最大', '哪个图形最好看', '一共有几个'], '按什么标准分', '标准不同，分类结果也不同。', '图形分类');
  });

  reg('四下-L15', function (r, i) {
    var avg = int(r, 60, 90), n = int(r, 4, 6), mode = (i || 0) % 5;
    if (mode === 0) return mc('四个人平均 ' + avg + ' 分，总分是多少？', avg * 4, [avg + 4, avg * 3, avg * 4 + 4], '总分 = 平均数×人数 = ' + avg + '×4=' + (avg * 4) + ' 分。', '总数');
    if (mode === 1) { var n1 = int(r, 3, 6), n2 = int(r, 3, 6), a1 = int(r, 60, 90), a2 = int(r, 60, 90); return mc('一班 ' + n1 + ' 人平均 ' + a1 + ' 分，二班 ' + n2 + ' 人平均 ' + a2 + ' 分。两班总分是多少？', n1 * a1 + n2 * a2, [a1 + a2, (a1 + a2) * (n1 + n2) / 2, n1 * a1], '总分 = 各班平均分×人数再相加 = ' + (n1 * a1) + '+' + (n2 * a2) + '=' + (n1 * a1 + n2 * a2) + ' 分。', '分组比较'); }
    if (mode === 2) { var count = n, a = avg, known = (count - 1) * a; return mc(count + ' 人平均 ' + a + ' 分，其中 ' + (count - 1) + ' 人共 ' + known + ' 分，剩下的人多少分？', a, [a + 1, a - 1, known], '总分 ' + (count * a) + ' 分，减去 ' + known + ' 分，剩下 ' + a + ' 分。', '平均数'); }
    if (mode === 3) return mc('平均数 ' + avg + ' 分，人数 ' + n + ' 人。总数是多少？', avg * n, [avg + n, avg * (n - 1), avg * n + n], '总数 = 平均数×人数 = ' + avg + '×' + n + '=' + (avg * n) + '。', '总数');
    return choice('两个小组人数不同，要求合起来的平均数，应该（ ）。', ['先求总数量再除以总人数', '把两个平均数相加除以 2', '取较大的平均数', '取较小的平均数'], '先求总数量再除以总人数', '人数不同时，平均数不能直接再平均，要用总数÷总人数。', '分组比较');
  });

  return MP;
});

/* practice-g5a.js */
/* 五年级上 · 参数化练习（每一题都由代码现算） */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./practice.js'));
  else factory(root.MathPractice);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (MP) {
  'use strict';
  var int = MP.int, pick = MP.pick, mc = MP.mc, choice = MP.choice, fmt = MP.fmt, money = MP.money;

  var POINTS = {
    '五上-L01': ['小数乘法', '积的小数位数', '运算律'],
    '五上-L02': ['小数除法', '商不变', '竖式'],
    '五上-L03': ['循环小数', '余数重复', '记法'],
    '五上-L04': ['数对', '行列', '位置'],
    '五上-L05': ['可能性', '随机', '机会大小'],
    '五上-L06': ['用字母表示数', '数量关系', '式子'],
    '五上-L07': ['等式性质', '未知数', '代入检查'],
    '五上-L08': ['线段图', '等量关系', '应用题'],
    '五上-L09': ['平行四边形面积', '剪拼', '底和高'],
    '五上-L10': ['三角形面积', '除以2', '底和高'],
    '五上-L11': ['梯形面积', '拼合', '上底下底'],
    '五上-L12': ['植树问题', '间隔', '封闭图形'],
    '五上-L13': ['组合图形', '分割', '添补'],
    '五上-L14': ['近似数', '四舍五入', '进一法去尾法'],
    '五上-L15': ['分段计费', '时间分段', '反推']
  };
  function reg(id, make) { MP.register(id, POINTS[id], make); }
  function y1(n) { return (n / 10).toFixed(1).replace(/\.0$/, ''); }
  function y2(n) { return (n / 100).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1'); }

  reg('五上-L01', function (r, i) {
    var a = int(r, 12, 99), b = int(r, 2, 9), mode = (i || 0) % 5;
    if (mode === 0) return mc(y1(a) + ' × ' + b + ' = ？', y1(a * b), [y1(a * b * 10), y1(a * b / 10), fmt(a * b)], '先按整数算 ' + a + '×' + b + '=' + (a * b) + '，一位小数，点上小数点得 ' + y1(a * b) + '。', '小数乘法');
    if (mode === 1) return mc('0.' + b + ' × 0.' + (a % 9 + 1) + ' = ？', y2(b * (a % 9 + 1)), [y1(b * (a % 9 + 1)), y2(b * (a % 9 + 1) * 10), fmt(b * (a % 9 + 1))], '两个因数一共有两位小数。先按整数相乘，再把积的小数点向左移两位，得 ' + y2(b * (a % 9 + 1)) + '。', '积的小数位数');
    if (mode === 2) return mc('12.5 × 8 = ？', 100, [10, 1000, 1], '12.5×8=100，125×8=1000，再把小数点向左移一位。', '运算律');
    if (mode === 3) return mc('2.4 × 3 的积是几位小数？', '一位', ['两位', '三位', '整数'], '两个因数一共有 1 位小数，积就有 1 位小数：7.2。', '积的小数位数');
    return mc(y1(a) + ' × 10 = ？', y1(a * 10), [y1(a), y1(a * 100), fmt(a * 10)], '乘 10，小数点向右移一位，得 ' + y1(a * 10) + '。', '小数乘法');
  });

  reg('五上-L02', function (r, i) {
    var b = int(r, 2, 9), q = int(r, 2, 9), a = b * q, mode = (i || 0) % 5;
    if (mode === 0) return mc(y1(a) + ' ÷ ' + b + ' = ？', y1(q), [y2(q), q * 10, q], '按整数除法算 ' + a + '÷' + b + '=' + q + '，再点上小数点，得 ' + y1(q) + '。', '小数除法');
    if (mode === 1) { var d = int(r, 2, 9), k = int(r, 2, 9); return mc(y1(d * k) + ' ÷ ' + y1(d) + ' = ？', k, [d * k, k * 10, k / 10], '除数变成整数：同时乘 10，变成 ' + (d * k) + '÷' + d + '=' + k + '。', '商不变'); }
    if (mode === 2) return mc('7.2 ÷ 0.3 可以转化成（ ）。', '72 ÷ 3', ['7.2 ÷ 3', '72 ÷ 30', '0.72 ÷ 3'], '被除数和除数同时乘 10，商不变：72÷3。', '竖式');
    if (mode === 3) return mc(y1(a) + ' ÷ 10 = ？', y2(a), [y1(a * 10), y2(a * 10), fmt(a)], '除以 10，小数点向左移一位，得 ' + y2(a) + '。', '小数除法');
    return mc('计算 1.2 ÷ 0.4 时，先把除数 0.4 变成（ ）。', '4', ['0.04', '40', '0.4'], '除数小数点右移一位变成 4，被除数也右移一位变成 12，12÷4=3。', '商不变');
  });

  reg('五上-L03', function (r, i) {
    var bank = [
      ['1 ÷ 3 的商是（ ）。', ['0.333…', '0.3', '3.33…', '0.033…'], '0.333…', '余数 1 反复出现，商 3 反复出现。', '循环小数'],
      ['1 ÷ 6 的商是（ ）。', ['0.1666…', '0.16', '1.66…', '0.016…'], '0.1666…', '商的小数部分从第二位起 6 反复出现。', '余数重复'],
      ['5 ÷ 11 的商是（ ）。', ['0.4545…', '0.45', '4.545…', '0.045…'], '0.4545…', '余数 5、6 交替出现，商 45 循环。', '循环小数'],
      ['下面哪个是循环小数？', ['0.333…', '0.25', '1.2', '0.5'], '0.333…', '小数部分有一个数字不断重复，是循环小数。', '记法'],
      ['0.7272… 的循环节是（ ）。', ['72', '7', '2', '727'], '72', '小数部分“72”不断重复，循环节是 72。', '记法'],
      ['2 ÷ 9 的商保留两位小数约是（ ）。', ['0.22', '0.23', '0.2', '0.222'], '0.22', '2÷9=0.222…，保留两位小数看第三位 2，约是 0.22。', '循环小数']
    ];
    var it = pick(r, bank);
    return choice(it[0], it[1], it[2], it[3], it[4]);
  });

  reg('五上-L04', function (r, i) {
    var c = int(r, 1, 8), row = int(r, 1, 8), mode = (i || 0) % 5;
    if (c === row) row = row % 8 + 1;
    if (mode === 0) return choice('数对 (' + c + ',' + row + ') 表示（ ）。', ['第' + c + '列第' + row + '行', '第' + row + '列第' + c + '行', '第' + c + '行第' + row + '列', '第' + (c + 1) + '列'], '第' + c + '列第' + row + '行', '数对先写列，再写行。', '数对');
    if (mode === 1) return mc('点 (' + c + ',' + row + ') 向右平移 2 格，新位置是？', '(' + (c + 2) + ',' + row + ')', ['(' + c + ',' + (row + 2) + ')', '(' + (c - 2) + ',' + row + ')', '(' + (c + 2) + ',' + (row + 2) + ')'], '向右平移列数加 2，行数不变。', '位置');
    if (mode === 2) return mc('点 (' + c + ',' + row + ') 向上平移 3 格，新位置是？', '(' + c + ',' + (row + 3) + ')', ['(' + (c + 3) + ',' + row + ')', '(' + c + ',' + (row - 3) + ')', '(' + (c + 3) + ',' + (row + 3) + ')'], '向上平移行数加 3，列数不变。', '位置');
    if (mode === 3) return mc('和点 (' + c + ',' + row + ') 在同一列的点是（ ）。', '(' + c + ',' + (row + 1) + ')', ['(' + (c + 1) + ',' + row + ')', '(' + row + ',' + c + ')', '(' + (c + 1) + ',' + (row + 1) + ')'], '同一列，第一个数相同。', '行列');
    return choice('数对 (4,2) 和 (2,4) 表示的位置（ ）。', ['不同', '相同', '同一行', '同一列'], '不同', '第一个数表示列，第二个数表示行，顺序不能换。', '数对');
  });

  reg('五上-L05', function (r, i) {
    var red = int(r, 2, 9), blue = int(r, 2, 9), mode = (i || 0) % 5;
    if (red === blue) blue += 1;
    if (mode === 0) return choice('球除颜色外完全相同，搅匀后闭眼摸一个。袋子里有 ' + red + ' 个红球、' + blue + ' 个蓝球，任意摸一个，摸到哪种球的可能性大？', [red > blue ? '红球' : '蓝球', red > blue ? '蓝球' : '红球', '一样大', '无法判断'], red > blue ? '红球' : '蓝球', '哪种球多，摸到哪种球的可能性就大。', '机会大小');
    if (mode === 1) return choice('球除颜色外完全相同，搅匀后闭眼摸一个。袋子里有 ' + red + ' 个红球、' + red + ' 个蓝球，摸到红球和蓝球的可能性（ ）。', ['一样大', '红球大', '蓝球大', '无法判断'], '一样大', '两种球数量相同，可能性相同。', '可能性');
    if (mode === 2) return choice('袋子里全是红球，任意摸一个，摸到蓝球是（ ）。', ['不可能', '可能', '一定', '可能性很小'], '不可能', '没有蓝球，就不可能摸到蓝球。', '随机');
    if (mode === 3) return choice('袋子里全是红球，任意摸一个，用哪个词描述摸到红球最准确？', ['一定', '可能', '不可能', '可能性很小'], '一定', '全是红球，摸到红球是必然事件。', '随机');
    return choice('下面哪件事是可能发生的？', ['明天会下雨', '太阳从西边升起', '三角形内角和是 100°', '1 加 1 等于 3'], '明天会下雨', '天气可能变化，是可能事件；其余都不可能。', '可能性');
  });

  reg('五上-L06', function (r, i) {
    var a = 'a', b = int(r, 2, 9), mode = (i || 0) % 5;
    if (mode === 0) return choice('每盒有 ' + b + ' 个苹果，' + a + ' 盒一共有多少个？用式子表示是（ ）。', [a + '×' + b, a + '+' + b, a + '÷' + b, b + '−' + a], a + '×' + b, '总数 = 每盒个数×盒数 = ' + a + '×' + b + '。', '用字母表示数');
    if (mode === 1) return choice('小明今年 a 岁，爸爸比小明大 26 岁，爸爸今年（ ）岁。', ['a+26', 'a−26', '26a', 'a÷26'], 'a+26', '爸爸的年龄 = 小明的年龄 + 26。', '数量关系');
    if (mode === 2) return choice('长方形长 a 厘米、宽 b 厘米，周长是（ ）厘米。', ['2(a+b)', 'ab', 'a+b', '2ab'], '2(a+b)', '长方形周长 =（长+宽）×2。', '式子');
    if (mode === 3) return choice('一本书共 a 页，每天看 b 页，刚好看完，需要（ ）天。', ['a÷b', 'ab', 'a−b', 'a+b'], 'a÷b', '天数 = 总页数÷每天看的页数。', '数量关系');
    return choice('下面哪个式子表示“a 的 3 倍多 2”？', ['3a+2', '3(a+2)', 'a÷3+2', '3a−2'], '3a+2', 'a 的 3 倍是 3a，再多 2 就是 3a+2。', '用字母表示数');
  });

  reg('五上-L07', function (r, i) {
    var a = int(r, 2, 20), x = int(r, 2, 20), mode = (i || 0) % 5;
    if (mode === 0) return mc('□ + ' + a + ' = ' + (x + a) + '，□ 里填几？', x, [x + a, x - 1, a], '从总数里减去已知的一部分：' + (x + a) + '−' + a + '=' + x + '。', '未知数');
    if (mode === 1) return mc(a + ' 个一样重的小袋共重 ' + (a * x) + ' 克，每袋重多少克？', x, [a * x, x + a, x - 1], '平均分成 ' + a + ' 份：' + (a * x) + '÷' + a + '=' + x + ' 克。', '未知数');
    if (mode === 2) return choice('天平两边原本一样重，各拿走同样重的一块砝码后，会怎样？', ['仍然平衡', '左边一定重', '右边一定重', '一定不平衡'], '仍然平衡', '两边减少的质量相同，剩下的仍然一样重。', '等式性质');
    if (mode === 3) return mc('要检查 □=' + x + ' 能否填入 □+' + a + '=' + (x + a) + '，把它代入后，左边算出多少？', x + a, [x, a, x + a + 1], '把方框换成 ' + x + '：' + x + '+' + a + '=' + (x + a) + '，与右边相同，填对了。', '代入检查');
    return choice('5+4=9 与 x+4=9，哪一个含有还不知道的数？', ['x+4=9', '5+4=9', '两个都有', '两个都没有'], 'x+4=9', 'x 用来表示还不知道的数；另一个算式里的数都已经给出了。', '未知数');
  });
  reg('五上-L08', function (r, i) {
    var small = int(r, 3, 15), extra = int(r, 2, 9), times = int(r, 2, 5), mode = (i || 0) % 5;
    if (mode === 0) return mc('甲比乙多 ' + extra + ' 张卡片，两人共 ' + (2 * small + extra) + ' 张。乙有多少张？', small, [small + extra, 2 * small, small - 1], '先去掉甲多出来的 ' + extra + ' 张，再把剩下的 ' + (2 * small) + ' 张平分：' + (2 * small) + '÷2=' + small + ' 张。', '线段图');
    if (mode === 1) return mc('甲的卡片是乙的 ' + times + ' 倍，合起来有 ' + ((times + 1) * small) + ' 张。乙有多少张？', small, [small * times, times + 1, small + 1], '乙画 1 份，甲画 ' + times + ' 份，一共 ' + (times + 1) + ' 份。一份是 ' + ((times + 1) * small) + '÷' + (times + 1) + '=' + small + ' 张。', '线段图');
    if (mode === 2) return mc('甲、乙两个书架共 ' + (2 * (small + extra)) + ' 本书，从甲架搬 ' + extra + ' 本到乙架后一样多。甲架原来有多少本？', small + 2 * extra, [small, small + extra, 2 * (small + extra)], '搬完每架 ' + (small + extra) + ' 本。甲原来还多出搬走的 ' + extra + ' 本，所以是 ' + (small + 2 * extra) + ' 本。', '应用题');
    if (mode === 3) return mc('甲比乙多 ' + (2 * extra) + ' 个球，要从甲拿几个给乙，两人才一样多？', extra, [2 * extra, extra + 1, extra - 1], '每拿 1 个，甲少 1 个，乙多 1 个，两人的差缩小 2 个。要拿 ' + (2 * extra) + '÷2=' + extra + ' 个。', '等量关系');
    return choice('甲是乙的 3 倍。画线段图时，把乙画成 1 份，甲应该画几份？', ['3 份', '2 份', '4 份', '1 份'], '3 份', '3 倍是完整的 3 份；比乙多的部分才是 2 份。', '等量关系');
  });
  reg('五上-L09', function (r, i) {
    var base = int(r, 4, 15), h = int(r, 3, 12), mode = (i || 0) % 5;
    if (mode === 0) return mc('平行四边形的底是 ' + base + ' 厘米，高是 ' + h + ' 厘米，面积是多少？', base * h, [base * h / 2, 2 * (base + h), base + h], '平行四边形面积 = 底×高 = ' + base + '×' + h + '=' + (base * h) + ' 平方厘米。', '平行四边形面积');
    if (mode === 1) return mc('平行四边形面积 ' + (base * h) + ' 平方厘米，底 ' + base + ' 厘米，高是多少？', h, [base * h, base, h + 1], '高 = 面积÷底 = ' + (base * h) + '÷' + base + '=' + h + ' 厘米。', '底和高');
    if (mode === 2) return mc('平行四边形面积 ' + (base * h) + ' 平方厘米，高 ' + h + ' 厘米，底是多少？', base, [base * h, h, base + 1], '底 = 面积÷高 = ' + (base * h) + '÷' + h + '=' + base + ' 厘米。', '底和高');
    if (mode === 3) return choice('沿平行四边形的一条高剪下三角形，平移到另一边，拼成长方形。面积会怎样？', ['不变', '变成原来的一半', '变成原来的 2 倍', '要看底有多长'], '不变', '只是把剪下的部分搬了位置，没有重叠，也没有缺口，总面积不变。', '剪拼');
    return mc('平行四边形和长方形等底等高，它们的面积相比（ ）。', '相等', ['平行四边形是一半', '平行四边形是 2 倍', '无法比较'], '剪拼后面积不变，等底等高时面积相等。', '剪拼');
  });

  reg('五上-L10', function (r, i) {
    var base = int(r, 3, 14), h = int(r, 2, 12), mode = (i || 0) % 5;
    if (mode === 0) return mc('三角形底 ' + base + ' 厘米，高 ' + h + ' 厘米，面积是多少？', base * h / 2, [base * h, base + h, 2 * (base + h)], '三角形面积 = 底×高÷2 = ' + base + '×' + h + '÷2=' + (base * h / 2) + ' 平方厘米。', '三角形面积');
    if (mode === 1) return mc('三角形面积 ' + (base * h / 2) + ' 平方厘米，底 ' + base + ' 厘米，高是多少？', h, [base * h, h + 1, base], '高 = 面积×2÷底 = ' + (base * h / 2) + '×2÷' + base + '=' + h + ' 厘米。', '底和高');
    if (mode === 2) return mc('三角形面积 ' + (base * h / 2) + ' 平方厘米，高 ' + h + ' 厘米，底是多少？', base, [base * h, h, base + 1], '底 = 面积×2÷高 = ' + (base * h / 2) + '×2÷' + h + '=' + base + ' 厘米。', '底和高');
    if (mode === 3) return choice('三角形面积公式里为什么要除以 2？', ['两个完全一样的三角形能拼成一个平行四边形', '因为三角形有三条边', '因为高比较短', '因为底比较长'], '两个完全一样的三角形能拼成一个平行四边形', '拼成的平行四边形面积是底×高，一个三角形是它的一半。', '除以2');
    return mc('三角形和平行四边形等底等高，三角形的面积是平行四边形的（ ）。', '一半', ['2 倍', '相等', '三分之一'], '等底等高时，三角形面积 = 平行四边形面积÷2。', '三角形面积');
  });

  reg('五上-L11', function (r, i) {
    var a = int(r, 2, 8), b = int(r, a + 1, 12), h = int(r, 2, 10), mode = (i || 0) % 5;
    var area = (a + b) * h / 2;
    if (mode === 0) return mc('梯形上底 ' + a + ' 厘米，下底 ' + b + ' 厘米，高 ' + h + ' 厘米，面积是多少？', area, [(a + b) * h, a + b + h, 2 * (a + b + h)], '梯形面积 =（上底+下底）×高÷2 =（' + a + '+' + b + '）×' + h + '÷2=' + area + ' 平方厘米。', '梯形面积');
    if (mode === 1) return mc('梯形面积 ' + area + ' 平方厘米，上底 ' + a + ' 厘米，下底 ' + b + ' 厘米，高是多少？', h, [area, a + b, h + 1], '高 = 面积×2÷（上底+下底）= ' + area + '×2÷' + (a + b) + '=' + h + ' 厘米。', '上底下底');
    if (mode === 2) return choice('两个完全一样的梯形可以拼成一个（ ）。', ['平行四边形', '三角形', '正方形', '圆'], '平行四边形', '两个梯形倒过来拼，得到底为（上底+下底）、高不变的平行四边形。', '拼合');
    if (mode === 3) return mc('梯形面积 ' + area + ' 平方厘米，高 ' + h + ' 厘米，上底与下底的和是多少？', a + b, [area, h, area / h], '上底+下底 = 面积×2÷高 = ' + area + '×2÷' + h + '=' + (a + b) + ' 厘米。', '梯形面积');
    return choice('梯形面积公式是（ ）。', ['(上底+下底)×高÷2', '上底×下底÷2', '(上底+下底)×2', '上底×高'], '(上底+下底)×高÷2', '两个完全一样的梯形拼成平行四边形，再取一半。', '梯形面积');
  });

  reg('五上-L12', function (r, i) {
    var d = pick(r, [3, 4, 5, 6, 8]), seg = int(r, 5, 15), L = d * seg, mode = (i || 0) % 5;
    if (mode === 0) return mc('一条 ' + L + ' 米的路，每隔 ' + d + ' 米栽一棵（两端都栽），共需多少棵？', seg + 1, [seg, seg - 1, seg + 2], '间隔数 ' + L + '÷' + d + '=' + seg + '，两端都栽加 1，得 ' + (seg + 1) + ' 棵。', '植树问题');
    if (mode === 1) return mc('一条 ' + L + ' 米的路，每隔 ' + d + ' 米栽一棵（只栽一端），共需多少棵？', seg, [seg + 1, seg - 1, seg + 2], '只栽一端，棵数等于间隔数 ' + seg + '。', '间隔');
    if (mode === 2) return mc('一条 ' + L + ' 米的路，每隔 ' + d + ' 米栽一棵（两端都不栽），共需多少棵？', seg - 1, [seg, seg + 1, seg - 2], '两端都不栽，棵数比间隔数少 1，得 ' + (seg - 1) + ' 棵。', '间隔');
    if (mode === 3) return mc('一个周长 ' + L + ' 米的圆形花坛，每隔 ' + d + ' 米栽一棵，共需多少棵？', seg, [seg + 1, seg - 1, seg + 2], '封闭图形棵数等于间隔数 ' + seg + '。', '封闭图形');
    var trees = seg + 1;
    return mc('一条路两端都栽，共栽了 ' + trees + ' 棵，每隔 ' + d + ' 米一棵，这条路长多少米？', L, [trees * d, (trees - 2) * d, L + d], '间隔数 = 棵数−1 = ' + seg + '，路长 = ' + seg + '×' + d + '=' + L + ' 米。', '植树问题');
  });

  reg('五上-L13', function (r, i) {
    var a = int(r, 4, 12), b = int(r, 3, 9), c = int(r, 2, 8), mode = (i || 0) % 5;
    if (mode === 0) return mc('一个长方形长 ' + a + ' 厘米、宽 ' + b + ' 厘米，再拼上一个底 ' + c + ' 厘米、高 ' + b + ' 厘米的三角形，两块不重叠。组合图形面积是多少？', a * b + c * b / 2, [a * b + c * b, (a + c) * b, a * b - c * b / 2], '长方形 ' + a + '×' + b + '=' + (a * b) + '，三角形 ' + c + '×' + b + '÷2=' + (c * b / 2) + '，合计 ' + (a * b + c * b / 2) + ' 平方厘米。', '组合图形');
    if (mode === 1) { var cut = int(r, 2, Math.min(a, b) - 1); return mc('大长方形长 ' + a + ' 厘米、宽 ' + b + ' 厘米，右上角剪去一个边长 ' + cut + ' 厘米的正方形，剩下面积是多少？', a * b - cut * cut, [a * b + cut * cut, (a - cut) * b, a * b], '用大长方形面积减去正方形面积：' + (a * b) + '−' + (cut * cut) + '=' + (a * b - cut * cut) + ' 平方厘米。', '添补'); }
    if (mode === 2) { var big = int(r, 8, 15), small = int(r, 3, 7); return mc('L 形图形可以看成大长方形 ' + big + '×' + big + ' 去掉一个小长方形 ' + small + '×' + small + '。面积是多少？', big * big - small * small, [big * big + small * small, big * big, small * small], '大面积 − 小面积 = ' + (big * big) + '−' + (small * small) + '=' + (big * big - small * small) + '。', '分割'); }
    if (mode === 3) return choice('求组合图形面积，常用的两种方法是（ ）。', ['分割法和添补法', '加法和减法', '画圆和画方', '平移和旋转'], '分割法和添补法', '分割成学过的基本图形，或补成一个大图形再减去多余部分。', '组合图形');
    return mc('两个完全一样的直角三角形，直角边分别是 ' + a + ' 厘米和 ' + b + ' 厘米，拼成一个长方形，面积是多少？', a * b, [a * b / 2, 2 * (a + b), a + b], '两个三角形拼成的长方形面积 = ' + a + '×' + b + '=' + (a * b) + ' 平方厘米。', '组合图形');
  });

  reg('五上-L14', function (r, i) {
    var a = int(r, 20, 99), b = int(r, 1, 9), mode = (i || 0) % 5;
    if (mode === 0) { var rounded = ((a * 10 + b + 1) / 10).toFixed(1); return mc('把 ' + a + '.' + b + '5 保留一位小数，约是多少？', rounded, [y1(a * 10 + b), y2((a * 10 + b) * 10 + 5), fmt(a)], '看百分位是 5，向十分位进 1，得 ' + rounded + '。保留一位小数时，十分位上的 0 也要写出来。', '四舍五入'); }
    if (mode === 1) { var p = int(r, 2, 9), q = int(r, 2, 9); return mc(p + ' ÷ ' + q + ' 保留两位小数约是（ ）。', (p / q).toFixed(2), [(p / q + 0.01).toFixed(2), (p / q - 0.01).toFixed(2), (p / q + 0.02).toFixed(2)], '多算一位再四舍五入，' + p + '÷' + q + '≈' + (p / q).toFixed(2) + '。', '近似数'); }
    if (mode === 2) { var people = int(r, 20, 60), cap = int(r, 6, 9); return mc('有 ' + people + ' 人，每条船最多坐 ' + cap + ' 人，至少要租几条船？', Math.ceil(people / cap), [Math.floor(people / cap), Math.ceil(people / cap) + 1, cap], people + '÷' + cap + '=' + Math.floor(people / cap) + '……' + (people % cap) + '。' + (people % cap ? '剩下的人还要一条船，' : '刚好坐满，') + '至少 ' + Math.ceil(people / cap) + ' 条。', '进一法去尾法'); }
    if (mode === 3) { var cloth = int(r, 10, 30), each = int(r, 2, 4); return mc('一块布长 ' + cloth + ' 米，做一套衣服用 ' + each + ' 米，最多能做几套？', Math.floor(cloth / each), [Math.ceil(cloth / each), Math.floor(cloth / each) + 1, each], '只算能做出的完整套数，最多做 ' + Math.floor(cloth / each) + ' 套。', '进一法去尾法'); }
    return choice('租船、装东西这类问题，通常用（ ）。', ['进一法', '去尾法', '四舍五入', '随便取'], '进一法', '剩下的人或物也要占一份，所以要进一。', '进一法去尾法');
  });

  reg('五上-L15', function (r, i) {
    var base = int(r, 8, 12), extra = pick(r, [1, 1.5, 2]), km = int(r, 4, 12), mode = (i || 0) % 5;
    var cost = base + (km - 3) * extra;
    if (mode === 0) return mc('出租车起步价 ' + base + ' 元（含 3 千米），超过 3 千米每千米 ' + extra + ' 元。行 ' + km + ' 千米要多少元？', money(cost), [money(base + km * extra), money(base), money(cost + extra)], '前 3 千米 ' + base + ' 元，超出 ' + (km - 3) + ' 千米，' + (km - 3) + '×' + extra + '=' + ((km - 3) * extra) + ' 元，共 ' + money(cost) + ' 元。', '分段计费');
    if (mode === 1) { var c = base + int(r, 1, 5) * extra; var k = 3 + Math.round((c - base) / extra); return mc('出租车起步价 ' + base + ' 元（含 3 千米），超过部分每千米 ' + extra + ' 元。付了 ' + money(c) + ' 元，最多坐了多少千米？', k, [k + 1, k - 1, 3 + Math.round(c / extra)], '超出部分 ' + money(c - base) + ' 元，' + money(c - base) + '÷' + extra + '=' + Math.round((c - base) / extra) + ' 千米，加上 3 千米，共 ' + k + ' 千米。', '反推'); }
    if (mode === 2) { var first = int(r, 2, 5), per = int(r, 2, 5), hours = int(r, 4, 6); return mc('停车第 1 小时 ' + first + ' 元，以后每小时 ' + per + ' 元。停 ' + hours + ' 小时要多少元？', first + per * (hours - 1), [first + per * 4, first * 3, per * 4], '第 1 小时 ' + first + ' 元，后 ' + (hours - 1) + ' 小时 ' + (per * (hours - 1)) + ' 元，共 ' + (first + per * (hours - 1)) + ' 元。', '时间分段'); }
    if (mode === 3) return choice('分段计费问题，第一步应该（ ）。', ['找出分界点和每段的单价', '直接乘总数量', '把所有单价相加', '取平均数'], '找出分界点和每段的单价', '先分段，再分别算，最后相加。', '分段计费');
    return mc('水费前 10 吨每吨 2 元，超过 10 吨每吨 3 元。用 14 吨水要多少元？', 10 * 2 + 4 * 3, [14 * 2, 14 * 3, 10 * 3 + 4 * 2], '前 10 吨 20 元，超出 4 吨 12 元，共 32 元。', '分段计费');
  });

  return MP;
});

/* practice-g5b.js */
/* 五年级下 · 参数化练习（每一题都由代码现算） */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./practice.js'));
  else factory(root.MathPractice);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (MP) {
  'use strict';
  var int = MP.int, pick = MP.pick, mc = MP.mc, choice = MP.choice, frac = MP.frac, gcd = MP.gcd, lcm = MP.lcm;

  var POINTS = {
    '五下-L01': ['因数', '倍数', '奇偶'],
    '五下-L02': ['2、5、3的倍数', '整除特征', '数字和'],
    '五下-L03': ['公因数', '公倍数', '最大公因数', '最小公倍数'],
    '五下-L04': ['观察物体', '三视图', '遮挡'],
    '五下-L05': ['旋转', '旋转中心', '方向与角度'],
    '五下-L06': ['长方体', '正方体', '面棱顶点'],
    '五下-L07': ['表面积', '六个面', '无盖'],
    '五下-L08': ['体积', '容积', '体积单位'],
    '五下-L09': ['分数意义', '单位1', '分数单位'],
    '五下-L10': ['分数基本性质', '约分', '通分'],
    '五下-L11': ['分数加减', '通分', '最简分数'],
    '五下-L12': ['找次品', '天平', '分组排除'],
    '五下-L13': ['约分', '通分', '分数比较'],
    '五下-L14': ['折线统计图', '变化趋势', '刻度'],
    '五下-L15': ['展开图', '表面积', '包装'],
    '五下-L16': ['排水法', '不规则物体', '体积']
  };
  function reg(id, make) { MP.register(id, POINTS[id], make); }

  reg('五下-L01', function (r, i) {
    var n = pick(r, [12, 15, 16, 18, 20, 21, 24, 27, 28, 30, 36]), mode = (i || 0) % 5;
    var divs = [];
    for (var i = 1; i <= n; i++) if (n % i === 0) divs.push(i);
    if (mode === 0) return mc(n + ' 一共有多少个因数？', divs.length, [divs.length + 1, divs.length - 1, n], n + ' 的因数是 ' + divs.join('、') + '，共 ' + divs.length + ' 个。', '因数');
    if (mode === 1) return mc(n + ' 最大的因数是多少？', n, [n / 2, 1, n - 1], '一个数最大的因数是它本身。', '因数');
    if (mode === 2) return mc(n + ' 最小的因数是多少？', 1, [2, n, 0], '任何非零自然数最小的因数都是 1。', '因数');
    if (mode === 3) return mc('下面哪个数是 ' + n + ' 的倍数？', n * 2, [n + 1, n * 2 + 1, n - 2], n + '×2=' + (n * 2) + '，所以 ' + (n * 2) + ' 是 ' + n + ' 的倍数。', '倍数');
    return choice(n + ' 是奇数还是偶数？', ['偶数', '奇数', '既不是奇数也不是偶数', '无法判断'], n % 2 === 0 ? '偶数' : '奇数', '个位是 0、2、4、6、8 的数是偶数。', '奇偶');
  });

  reg('五下-L02', function (r, i) {
    var mode = (i || 0) % 5, a = int(r, 12, 98), b = int(r, 12, 98);
    if (mode === 0) return mc('下面哪个数是 2 的倍数？', 2 * int(r, 6, 49), [2 * a + 1, 2 * b + 3, 77], '个位是 0、2、4、6、8 的数是 2 的倍数。', '2、5、3的倍数');
    if (mode === 1) return mc('下面哪个数是 5 的倍数？', 5 * int(r, 3, 19), [5 * a + 1, 5 * b + 2, 63], '个位是 0 或 5 的数是 5 的倍数。', '整除特征');
    if (mode === 2) { var n = int(r, 10, 99); var sum = Math.floor(n / 10) + n % 10; return mc(n + ' 的各位数字和是多少？', sum, [n % 10, Math.floor(n / 10), sum + 10], n + ' 的十位和个位相加：' + Math.floor(n / 10) + '+' + (n % 10) + '=' + sum + '。', '数字和'); }
    if (mode === 3) { var d = int(r, 1, 9); return mc('四位数 2' + d + '3□ 是 3 的倍数，末位最小填几？', (3 - (2 + d + 3) % 3) % 3, [1, 5, 9], '各位数字和 5+' + d + '+□ 要能被 3 整除，末位最小填 ' + ((3 - (2 + d + 3) % 3) % 3) + '。', '2、5、3的倍数'); }
    return mc('一个数同时是 2 和 5 的倍数，它的个位一定是（ ）。', 0, [5, 2, 1], '同时是 2 和 5 的倍数，个位只能是 0。', '整除特征');
  });

  reg('五下-L03', function (r, i) {
    var a = pick(r, [4, 6, 8, 9, 10, 12]), b = pick(r, [6, 9, 12, 15, 18, 20]), mode = (i || 0) % 5;
    var g = gcd(a, b), l = lcm(a, b);
    if (mode === 0) return mc(a + ' 和 ' + b + ' 的最大公因数是多少？', g, [l, a * b, g + 1], a + ' 和 ' + b + ' 的公因数中最大的是 ' + g + '。', '最大公因数');
    if (mode === 1) return mc(a + ' 和 ' + b + ' 的最小公倍数是多少？', l, [g, a * b, l + 1], a + ' 和 ' + b + ' 的最小公倍数是 ' + l + '。', '最小公倍数');
    if (mode === 2) return mc('用边长是整厘米的正方形铺满长 ' + a + ' 厘米、宽 ' + b + ' 厘米的长方形，正方形边长最大是多少？', g, [l, a + b, 1], '正方形边长必须同时是 ' + a + ' 和 ' + b + ' 的因数，最大是 ' + g + ' 厘米。', '公因数');
    if (mode === 3) return mc('甲每 ' + a + ' 天来一次，乙每 ' + b + ' 天来一次，今天同时来，至少再过多少天又同时来？', l, [g, a + b, a * b], '再次同时来要经过最小公倍数 ' + l + ' 天。', '公倍数');
    var common = 0; for (var i = 1; i <= g; i++) if (a % i === 0 && b % i === 0) common++;
    return mc(a + ' 和 ' + b + ' 一共有多少个公因数？', common, [g, common + 1, 1], '公因数的个数就是最大公因数 ' + g + ' 的因数个数，共 ' + common + ' 个。', '公因数');
  });

  reg('五下-L04', function (r, i) {
    var n = int(r, 2, 5), mode = (i || 0) % 5;
    if (mode === 0) return mc(n + ' 个同样的小正方体从左到右摆成一排，从正面能看到几个正方形？', n, [n + 1, n - 1, n * 2], '排成一排时，正面看到 ' + n + ' 个正方形。', '观察物体');
    if (mode === 1) return choice('观察一个长方体，最多能同时看到几个面？', ['3 个', '1 个', '6 个', '2 个'], '3 个', '最多同时看到正面、上面、侧面。', '三视图');
    if (mode === 2) return choice('从上面看一个长方体，看到的是（ ）。', ['长方形', '三角形', '圆', '梯形'], '长方形', '长方体的上面是长方形。', '三视图');
    if (mode === 3) return choice('两个物体从正面看形状相同，它们一定相同吗？', ['不一定', '一定', '一定不同', '无法比较'], '不一定', '一个方向只能看到一部分，可能被遮挡。', '遮挡');
    return choice('从不同方向观察同一个物体，看到的形状（ ）。', ['可能不同', '一定相同', '一定不同', '与方向无关'], '可能不同', '方向不同，看到的面和遮挡关系不同。', '观察物体');
  });

  reg('五下-L05', function (r, i) {
    var x = int(r, 1, 6), mode = (i || 0) % 5;
    if (mode === 0) return mc('点 A 在 O 的右边 ' + x + ' 格。绕 O 逆时针旋转 90° 后，A 在哪里？', 'O 的上边 ' + x + ' 格', ['O 的下边 ' + x + ' 格', 'O 的左边 ' + x + ' 格', 'O 的上边 ' + (x + 1) + ' 格'], '从右边逆时针转四分之一圈，来到上边；到 O 的距离仍是 ' + x + ' 格。', '旋转');
    if (mode === 1) return choice('钟面上的指针从 12 转到 3，是绕中心（ ）。', ['顺时针旋转 90°', '逆时针旋转 90°', '顺时针旋转 180°', '平移'], '顺时针旋转 90°', '12 到 3 是顺时针四分之一圈，即 90°。', '方向与角度');
    if (mode === 2) return mc('一个向右的箭头绕它的尾端旋转 180°，得到的图形与原图形（ ）。', '方向相反、形状大小相同', ['完全相同且方向相同', '大小改变', '形状改变'], '旋转 180° 不改变形状和大小，只改变方向。', '旋转中心');
    if (mode === 3) return choice('旋转时，图形上每一点都绕（ ）转动。', ['同一个旋转中心', '各自的中心', '不同的点', '原点以外'], '同一个旋转中心', '旋转是整体绕一个固定点转动。', '旋转');
    return choice('下面哪种运动是旋转？', ['钟表指针走动', '电梯上下', '推箱子', '拉抽屉'], '钟表指针走动', '绕固定点转动是旋转；其余是平移。', '旋转');
  });

  reg('五下-L06', function (r, i) {
    var a = int(r, 3, 9), b = int(r, 3, 9), c = int(r, 3, 9), mode = (i || 0) % 5;
    if (mode === 0) return mc('长方体有几个面？', 6, [4, 8, 12], '长方体有 6 个面。', '长方体');
    if (mode === 1) return mc('长方体有几条棱？', 12, [6, 8, 4], '长方体有 12 条棱。', '面棱顶点');
    if (mode === 2) return mc('长方体有几个顶点？', 8, [6, 12, 4], '长方体有 8 个顶点。', '面棱顶点');
    if (mode === 3) return mc('长 ' + a + ' 厘米、宽 ' + b + ' 厘米、高 ' + c + ' 厘米的长方体，所有棱长总和是多少？', 4 * (a + b + c), [a + b + c, 2 * (a + b + c), a * b * c], '棱长总和 =（长+宽+高）×4 =（' + a + '+' + b + '+' + c + '）×4=' + (4 * (a + b + c)) + ' 厘米。', '长方体');
    return choice('正方体与长方体相比，正方体（ ）。', ['12 条棱长度都相等', '只有 4 条棱相等', '没有顶点', '只有 2 个面'], '12 条棱长度都相等', '正方体是特殊的长方体，12 条棱都相等。', '正方体');
  });

  reg('五下-L07', function (r, i) {
    var a = int(r, 2, 9), b = int(r, 2, 9), c = int(r, 2, 9), mode = (i || 0) % 5;
    var area = 2 * (a * b + a * c + b * c);
    if (mode === 0) return mc('长 ' + a + ' 厘米、宽 ' + b + ' 厘米、高 ' + c + ' 厘米' + ' 的长方体，表面积是多少平方厘米？', area, [a * b * c, a * b + b * c + a * c, 4 * (a + b + c)], '表面积 =（长×宽+长×高+宽×高）×2 = ' + area + '。', '表面积');
    if (mode === 1) return mc('棱长 ' + a + ' 厘米的正方体，表面积是多少平方厘米？', 6 * a * a, [a * a * a, 4 * a * a, 6 * a], '正方体表面积 = 棱长×棱长×6 = ' + a + '×' + a + '×6=' + (6 * a * a) + '。', '六个面');
    if (mode === 2) return mc('长 ' + a + ' 厘米、宽 ' + b + ' 厘米、高 ' + c + ' 厘米' + ' 的无盖长方体盒子，表面积是多少平方厘米？', a * b + 2 * a * c + 2 * b * c, [area, a * b * c, a * b + a * c + b * c], '无盖只有 5 个面：底面 + 前后 + 左右 = ' + (a * b + 2 * a * c + 2 * b * c) + '。', '无盖');
    if (mode === 3) return mc('两个棱长 ' + a + ' 厘米的正方体拼成一个长方体，表面积比原来两个正方体表面积之和少多少？', 2 * a * a, [a * a, 4 * a * a, 6 * a * a], '拼在一起遮住 2 个面，少 ' + 2 * a * a + '。', '表面积');
    return choice('求做一个无盖鱼缸需要多少玻璃，要算（ ）个面。', ['5', '6', '4', '3'], '5', '无盖鱼缸没有上面，只有 5 个面。', '无盖');
  });

  reg('五下-L08', function (r, i) {
    var a = int(r, 2, 9), b = int(r, 2, 9), c = int(r, 2, 9), mode = (i || 0) % 5;
    if (mode === 0) return mc('长 ' + a + ' 厘米、宽 ' + b + ' 厘米、高 ' + c + ' 厘米' + ' 的长方体，体积是多少立方厘米？', a * b * c, [2 * (a + b + c), a * b + b * c + a * c, 4 * (a + b + c)], '体积 = 长×宽×高 = ' + a + '×' + b + '×' + c + '=' + (a * b * c) + '。', '体积');
    if (mode === 1) return mc('棱长 ' + a + ' 厘米的正方体，体积是多少立方厘米？', a * a * a, [6 * a * a, 4 * a, a * a], '正方体体积 = 棱长³ = ' + a + '×' + a + '×' + a + '=' + (a * a * a) + '。', '体积单位');
    if (mode === 2) return mc('1 升 = 多少立方厘米？', 1000, [100, 10, 10000], '1 升 = 1 立方分米 = 1000 立方厘米。', '容积');
    if (mode === 3) return mc('一个长方体水箱，里面长 ' + a + ' 分米、宽 ' + b + ' 分米、水深 ' + c + ' 分米，水的体积是多少升？', a * b * c, [a * b, 2 * (a + b) * c, a + b + c], '水的体积 = ' + a + '×' + b + '×' + c + '=' + (a * b * c) + ' 立方分米 = ' + (a * b * c) + ' 升。', '容积');
    return choice('体积和容积的区别是（ ）。', ['体积从外面量，容积从里面量', '完全一样', '体积只算水', '容积没有单位'], '体积从外面量，容积从里面量', '体积占空间的大小，容积是容器内部能装多少。', '体积');
  });

  reg('五下-L09', function (r, i) {
    var d = pick(r, [2, 3, 4, 5, 6, 8]), n = int(r, 1, d - 1), total = d * int(r, 3, 8), mode = (i || 0) % 5;
    if (mode === 0) return mc(total + ' 的 ' + n + '/' + d + ' 是多少？', total * n / d, [total / d, total * d / n, total - n], '把 ' + total + ' 平均分成 ' + d + ' 份，取 ' + n + ' 份：' + total + '÷' + d + '×' + n + '=' + (total * n / d) + '。', '分数意义');
    if (mode === 1) return mc(frac(1, d) + ' 的分数单位是多少？', frac(1, d), [frac(d, 1), frac(1, d + 1), '1'], '分子是 1 的分数，分数单位就是它本身。', '分数单位');
    if (mode === 2) return choice('把全班人数看作单位“1”，男生占 ' + frac(n, d) + '。这里单位“1”是（ ）。', ['全班人数', '男生人数', '女生人数', '一个男生'], '全班人数', '被平均分的整体就是单位“1”。', '单位1');
    if (mode === 3) return choice(frac(n, d) + ' 是真分数还是假分数？', ['真分数', '假分数', '带分数', '整数'], n < d ? '真分数' : '假分数', '分子小于分母是真分数。', '分数意义');
    return mc('一个整体平均分成 ' + d + ' 份，取 ' + n + ' 份，用分数表示是（ ）。', n + '/' + d, [d + '/' + n, n + '/' + (d + 1), (n + 1) + '/' + d], '平均分成 ' + d + ' 份，取 ' + n + ' 份，就是 ' + n + '/' + d + '。', '分数意义');
  });

  reg('五下-L10', function (r, i) {
    var d = pick(r, [2, 3, 4, 5, 6, 8]), n = int(r, 1, d - 1), k = int(r, 2, 4), mode = (i || 0) % 5;
    if (mode === 0) return mc(n + '/' + d + ' = ' + (n * k) + '/' + (d * k) + '，这是根据（ ）。', '分数的基本性质', ['加法交换律', '乘法交换律', '乘法分配律'], '分子分母同时乘 ' + k + '，分数大小不变。把分数看成除法，这也和商不变规律相通。', '分数基本性质');
    if (mode === 1) return mc((n * k) + '/' + (d * k) + ' 约分后是（ ）。', frac(n, d), [frac(n, d + 1), frac(n + 1, d + 1), frac(n + 1, d)], '分子分母同时除以 ' + gcd(n * k, d * k) + '，得 ' + frac(n, d) + '。', '约分');
    if (mode === 2) return mc(n + '/' + d + ' = ' + '?/' + (d * k) + '，分子应填几？', n * k, [n, n + k, d * k], '分母乘 ' + k + '，分子也乘 ' + k + '，得 ' + (n * k) + '。', '分数基本性质');
    if (mode === 3) return mc('把 ' + n + '/' + d + ' 和 1/' + (d * k) + ' 通分，公分母选 ' + (d * k) + '，前一个分数的分子应变成几？', n * k, [n, n + k, d * k], '前一个分数的分母从 ' + d + ' 变成 ' + (d * k) + '，乘了 ' + k + '；分子也乘 ' + k + '，变成 ' + (n * k) + '。', '通分');
    var raw = (n * k) + '/' + (d * k), g = gcd(n * k, d * k);
    return mc('把 ' + raw + ' 化成最简分数，分子分母应同时除以（ ）。', g, [k, n, d], '分子分母的最大公因数是 ' + g + '，同时除以 ' + g + '。', '约分');
  });

  reg('五下-L11', function (r, i) {
    var d = pick(r, [3, 4, 5, 6, 8, 10]), a = int(r, 1, d - 1), b = int(r, 1, d - a), mode = (i || 0) % 5;
    if (mode === 0) return mc(a + '/' + d + ' + ' + b + '/' + d + ' = ？', frac(a + b, d), [frac(a + b + 1, d), frac(a + b, d + 1), frac(a + b - 1, d + 1)], '同分母分数相加，分母不变，分子相加：' + frac(a + b, d) + '。', '分数加减');
    if (mode === 1) { var d2 = pick(r, [2, 3, 4, 5, 6]); if (d2 === d) d2 = d2 === 6 ? 4 : d2 + 1; var n1 = int(r, 1, d - 1), n2 = int(r, 1, d2 - 1); var L = lcm(d, d2); var A = n1 * (L / d) + n2 * (L / d2); return mc(frac(n1, d) + ' + ' + frac(n2, d2) + ' = ？', frac(A, L), [frac(A + 1, L), frac(A, L + 1), frac(A - 1, L + 1)], '先通分，公分母取 ' + L + '，相加得 ' + frac(A, L) + '。', '通分'); }
    if (mode === 2) return mc('1 − ' + frac(a, d) + ' = ？', frac(d - a, d), [frac(d - a + 1, d), frac(d - a, d + 1), frac(d - a - 1, d)], '把 1 看成 ' + d + '/' + d + '，减去 ' + frac(a, d) + ' 得 ' + frac(d - a, d) + '。', '最简分数');
    if (mode === 3) return mc(frac(a, d) + ' + ' + frac(d - a, d) + ' = ？', 1, [frac(d, 2 * d), 0, frac(d + 1, d)], '分子相加等于分母，正好是 1。', '分数加减');
    return choice('同分母分数相加，应该（ ）。', ['分母不变，分子相加', '分子分母都相加', '分子不变，分母相加', '先相乘'], '分母不变，分子相加', '分母表示平均分的份数，份数不变，只把取的份数相加。', '分数加减');
  });

  reg('五下-L12', function (r, i) {
    var mode = (i || 0) % 5;
    if (mode === 0) return mc('3 个零件中有 1 个次品（次品轻一些），用天平至少称几次一定能找出？', 1, [2, 3, 0], '天平两边各放 1 个，若平衡则剩下的是次品；若不平衡，轻的是次品。1 次即可。', '找次品');
    if (mode === 1) return mc('9 个零件中有 1 个次品（轻一些），用天平至少称几次一定能找出？', 2, [3, 4, 1], '分成 3、3、3，先称两组，确定次品在哪一组，再称一次，共 2 次。', '分组排除');
    if (mode === 2) return mc('8 个零件中有 1 个次品（轻一些），用天平至少称几次一定能找出？', 2, [3, 4, 1], '分成 3、3、2，先称 3 和 3；无论结果如何，第二次都能确定，共 2 次。', '天平');
    if (mode === 3) return choice('用天平找次品，最好的分法是（ ）。', ['尽量平均分成 3 组', '分成 2 组', '一个一个称', '分成 4 组'], '尽量平均分成 3 组', '天平一次能比较两组，还能留下第三组，分 3 组效率最高。', '找次品');
    return choice('天平两边平衡，说明（ ）。', ['两边物体一样重', '左边重', '右边重', '无法判断'], '两边物体一样重', '平衡表示两边质量相等。', '天平');
  });

  reg('五下-L13', function (r, i) {
    var d = pick(r, [4, 6, 8, 9, 10, 12]), n = int(r, 2, d - 1), k = int(r, 2, 4), mode = (i || 0) % 5;
    if (mode === 0) return mc((n * k) + '/' + (d * k) + ' 约分后是（ ）。', frac(n, d), [frac(n, d + 1), frac(n + 1, d), frac(n * k, d)], '分子分母同时除以 ' + gcd(n * k, d * k) + '，得 ' + frac(n, d) + '。', '约分');
    if (mode === 1) { var d2 = pick(r, [3, 4, 5, 6, 8]); if (d2 === d) d2 += 1; var n2 = int(r, 1, d2 - 1); while (n * d2 === n2 * d) n2 = n2 % (d2 - 1) + 1; var v1 = n / d, v2 = n2 / d2; return choice('比较 ' + frac(n, d) + ' 和 ' + frac(n2, d2) + '，哪个大？', [v1 > v2 ? frac(n, d) : frac(n2, d2), v1 > v2 ? frac(n2, d2) : frac(n, d), '一样大', '无法比较'], v1 > v2 ? frac(n, d) : frac(n2, d2), '通分或化成小数比较，' + frac(n, d) + '≈' + v1.toFixed(2) + '，' + frac(n2, d2) + '≈' + v2.toFixed(2) + '。', '分数比较'); }
    if (mode === 2) { var d3 = pick(r, [3, 4, 5, 6]); var d4 = pick(r, [4, 5, 6, 8]); if (d3 === d4) d4 += 1; return mc(frac(1, d3) + ' 和 ' + frac(1, d4) + ' 的公分母最小是多少？', lcm(d3, d4), [d3 * d4, d3 + d4, Math.max(d3, d4)], '最小公分母是 ' + d3 + ' 和 ' + d4 + ' 的最小公倍数 ' + lcm(d3, d4) + '。', '通分'); }
    if (mode === 3) return mc(n + '/' + d + ' 的分子分母最大公因数是多少？', gcd(n, d), [1, n, d], n + ' 和 ' + d + ' 的最大公因数是 ' + gcd(n, d) + '。', '约分');
    return choice('约分的依据是（ ）。', ['分数的基本性质', '加法交换律', '乘法分配律', '乘法结合律'], '分数的基本性质', '分子分母同时除以相同的非零公因数，分数大小不变。把分数看成除法，这也和商不变规律相通。', '约分');
  });

  reg('五下-L14', function (r, i) {
    var a = int(r, 10, 30), b = int(r, 10, 30), c = int(r, 10, 30), mode = (i || 0) % 5;
    var desc = '折线统计图：周一 ' + a + '，周二 ' + b + '，周三 ' + c + '。';
    if (mode === 0) return mc(desc + ' 周二和周一相差多少？', Math.abs(b - a), [a + b, Math.abs(b - a) + 1, b], '周二 ' + b + '，周一 ' + a + '，相差 ' + Math.abs(b - a) + '。', '折线统计图');
    if (mode === 1) return mc(desc + ' 三天一共是多少？', a + b + c, [a + b, Math.max(a, b, c), a + b + c + 10], '三个数据相加：' + a + '+' + b + '+' + c + '=' + (a + b + c) + '。', '变化趋势');
    if (mode === 2) { var trend = b > a ? '上升' : b < a ? '下降' : '不变'; return choice(desc + ' 折线从周一走到周二怎样变化？', ['上升', '下降', '不变', '无法判断'], trend, '周一是 ' + a + '，周二是 ' + b + '，所以折线' + trend + '。', '变化趋势'); }
    if (mode === 3) return choice('要表示气温一天中的变化趋势，最好选（ ）。', ['折线统计图', '条形统计图', '统计表', '扇形统计图'], '折线统计图', '折线统计图能清楚看出增减变化。', '折线统计图');
    return choice('读折线统计图时，先要看（ ）。', ['横轴和纵轴各表示什么', '线的颜色', '图的大小', '标题有几个字'], '横轴和纵轴各表示什么', '先认清横轴、纵轴和刻度，才能正确读数。', '刻度');
  });

  reg('五下-L15', function (r, i) {
    var a = int(r, 2, 9), b = int(r, 2, 9), c = int(r, 2, 9), mode = (i || 0) % 5;
    var area = 2 * (a * b + a * c + b * c);
    if (mode === 0) return mc('一个长方体纸盒长 ' + a + ' 厘米、宽 ' + b + ' 厘米、高 ' + c + ' 厘米' + '，做这个纸盒至少需要多少平方厘米纸板？', area, [a * b * c, a * b + a * c + b * c, 4 * (a + b + c)], '纸盒有 6 个面，表面积 = ' + area + ' 平方厘米。', '表面积');
    if (mode === 1) return mc('长 ' + a + ' 厘米、宽 ' + b + ' 厘米、高 ' + c + ' 厘米' + ' 的无盖纸盒，需要多少平方厘米纸板？', a * b + 2 * a * c + 2 * b * c, [area, a * b * c, a * b + a * c + b * c], '无盖少一个上面：' + (a * b + 2 * a * c + 2 * b * c) + ' 平方厘米。', '展开图');
    if (mode === 2) return mc('用包装纸包一个长 ' + a + ' 厘米、宽 ' + b + ' 厘米、高 ' + c + ' 厘米' + ' 的盒子，至少需要多少平方厘米包装纸（不计接头）？', area, [a * b * c, 2 * (a + b + c), a * b], '包装纸面积就是盒子的表面积 ' + area + ' 平方厘米。', '包装');
    if (mode === 3) return choice('长方体展开图中，相对的面（ ）。', ['完全相同', '面积不同', '一定相邻', '只有 1 个'], '完全相同', '长方体相对的两个面完全相同。', '展开图');
    return choice('求包装纸面积，通常算长方体的（ ）。', ['表面积', '体积', '棱长总和', '容积'], '表面积', '包装纸包住表面，算表面积。', '包装');
  });

  reg('五下-L16', function (r, i) {
    var base = int(r, 10, 40), rise = int(r, 2, 8), mode = (i || 0) % 5;
    if (mode === 0) return mc('长方体容器底面积 ' + base + ' 平方厘米，将不吸水的石头完全浸没（水未溢出）后水面上升 ' + rise + ' 厘米，石头体积是多少立方厘米？', base * rise, [base + rise, base * rise / 2, 2 * (base + rise)], '石头体积 = 底面积×水面上升高度 = ' + base + '×' + rise + '=' + (base * rise) + ' 立方厘米。', '排水法');
    if (mode === 1) return mc('将不吸水的石头完全浸没在长方体容器的水中，水未溢出。石头体积 ' + (base * rise) + ' 立方厘米，容器底面积 ' + base + ' 平方厘米，水面上升多少厘米？', rise, [base * rise, rise + 1, base], '上升高度 = 体积÷底面积 = ' + (base * rise) + '÷' + base + '=' + rise + ' 厘米。', '不规则物体');
    if (mode === 2) return mc('量杯里有 200 毫升水，将不吸水的石头完全浸没（水未溢出）后水面升到 ' + (200 + base) + ' 毫升，石头体积是多少立方厘米？', base, [200, base + 200, base / 2], '石头体积 = 上升的水量 = ' + (200 + base) + '−200=' + base + ' 毫升 = ' + base + ' 立方厘米。', '体积');
    if (mode === 3) return choice('用排水法测石头体积，必须保证石头（ ）。', ['完全浸没且水没有溢出', '只浸入一半', '露出水面', '比水轻'], '完全浸没且水没有溢出', '完全浸没，排开水的体积才等于石头体积；水不能溢出。', '排水法');
    return choice('下面哪种测量不能直接套用长方体体积公式，通常要用排水法？', ['不吸水且不溶于水的不规则石头的体积', '规则长方体的体积', '长度', '面积'], '不吸水且不溶于水的不规则石头的体积', '不规则物体无法直接量长宽高，用排水法。', '不规则物体');
  });

  return MP;
});

/* practice-g6a.js */
/* 六年级上 · 参数化练习（每一题都由代码现算） */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./practice.js'));
  else factory(root.MathPractice);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (MP) {
  'use strict';
  var int = MP.int, pick = MP.pick, mc = MP.mc, choice = MP.choice, fmt = MP.fmt, frac = MP.frac, gcd = MP.gcd, lcm = MP.lcm;

  var POINTS = {
    '六上-L01': ['分数乘法', '求一个数的几分之几', '约分'],
    '六上-L02': ['分数除法', '倒数', '工程问题'],
    '六上-L03': ['比', '比值', '比与除法'],
    '六上-L04': ['按比分配', '份数', '总量'],
    '六上-L05': ['位置与方向', '方向和距离', '相对位置'],
    '六上-L06': ['圆', '圆心', '半径', '直径'],
    '六上-L07': ['圆的面积', '化圆为方', '圆环'],
    '六上-L08': ['扇形', '弧', '圆心角'],
    '六上-L09': ['百分数', '百分率', '分数小数互化'],
    '六上-L10': ['百分数应用', '单位1', '增减'],
    '六上-L11': ['扇形统计图', '百分比', '整体与部分'],
    '六上-L12': ['数与形', '平方数', '奇偶'],
    '六上-L13': ['单位1', '分数应用', '已知部分求整体'],
    '六上-L14': ['分数混合运算', '运算顺序', '简便计算'],
    '六上-L15': ['百分率', '加权平均', '统计判断'],
    '六上-L16': ['连续变化', '逆推', '百分数']
  };
  function reg(id, make) { MP.register(id, POINTS[id], make); }
  var PI = 3.14;

  reg('六上-L01', function (r, i) {
    var a = int(r, 1, 5), b = int(r, 2, 6), c = int(r, 1, 5), d = int(r, 2, 6), mode = (i || 0) % 5;
    if (b <= a) b = a + 1;
    if (d <= c) d = c + 1;
    if (mode === 0) { var N = a * c, D = b * d; return mc(frac(a, b) + ' × ' + frac(c, d) + ' = ？', frac(N, D), [frac(N + 1, D), frac(N, D + 1), frac(N + 1, D + 1)], '分子乘分子，分母乘分母，再约分：' + frac(N, D) + '。', '分数乘法'); }
    if (mode === 1) { var total = b * int(r, 2, 6); return mc(total + ' 的 ' + frac(a, b) + ' 是多少？', total * a / b, [total / b, total * b / a, total - a], '把 ' + total + ' 平均分成 ' + b + ' 份，取 ' + a + ' 份：' + total + '÷' + b + '×' + a + '=' + (total * a / b) + '。', '求一个数的几分之几'); }
    if (mode === 2) return mc(frac(a, b) + ' × ' + b + ' = ？', a, [a * b, frac(a, b), b], '分母和整数约分：' + frac(a, b) + '×' + b + '=' + a + '。', '约分');
    if (mode === 3) return choice('一个正数乘真分数，积（ ）这个数。', ['小于', '大于', '等于', '无法比较'], '小于', '正数乘一个大于 0、小于 1 的数，积比原数小。', '分数乘法');
    return mc(frac(a, b) + ' × 1 = ？', frac(a, b), [frac(a + 1, b), frac(a, b + 1), frac(a + 1, b + 1)], '任何数乘 1 都得它本身。', '分数乘法');
  });

  reg('六上-L02', function (r, i) {
    var a = int(r, 1, 5), b = int(r, 2, 6), c = int(r, 1, 5), d = int(r, 2, 6), mode = (i || 0) % 5;
    if (b <= a) b = a + 1;
    if (d <= c) d = c + 1;
    if (mode === 0) { var N = a * d, D = b * c; return mc(frac(a, b) + ' ÷ ' + frac(c, d) + ' = ？', frac(N, D), [frac(N + 1, D), frac(N, D + 1), frac(N + 1, D + 1)], '除以一个分数，等于乘它的倒数：' + frac(a, b) + '×' + frac(d, c) + '=' + frac(N, D) + '。', '分数除法'); }
    if (mode === 1) return mc(frac(a, b) + ' 的倒数是多少？', frac(b, a), [frac(a, b), b, a], '分子分母交换位置，' + frac(a, b) + ' 的倒数是 ' + frac(b, a) + '。', '倒数');
    if (mode === 2) { var n = int(r, 2, 8); var N = a, D = b * n; return mc(frac(a, b) + ' ÷ ' + n + ' = ？', frac(N, D), [frac(N + 1, D), frac(N, D + 1), frac(N + 1, D + 1)], '除以整数等于乘它的倒数：' + frac(a, b) + '×' + frac(1, n) + '=' + frac(N, D) + '。', '分数除法'); }
    if (mode === 3) { var days = int(r, 3, 9); return mc('一项工程每天完成 ' + frac(1, days) + '，多少天完成？', days, [days + 1, days - 1, 1], '工作总量是 1，1÷' + frac(1, days) + '=' + days + ' 天。', '工程问题'); }
    return choice('修一条路，每天完成整项工程的 ' + frac(a, b) + '。这里把什么看作单位“1”？', ['整条路的工程量', '一天完成的工程量', '还没完成的工程量', '修路的天数'], '整条路的工程量', '每天完成的是整项工程的一部分，所以把全部工程量看作单位“1”。', '工程问题');
  });

  reg('六上-L03', function (r, i) {
    var a = int(r, 2, 9), b = int(r, 2, 9), k = int(r, 2, 5), mode = (i || 0) % 5;
    if (a === b) b += 1;
    if (mode === 0) return mc('把 ' + (a * k) + ':' + (b * k) + ' 化成最简整数比是（ ）。', (a / gcd(a, b)) + ':' + (b / gcd(a, b)), [b + ':' + a, (a * k) + ':' + b, a + ':' + (b * k)], '前项后项同时除以 ' + (k * gcd(a, b)) + '，得 ' + (a / gcd(a, b)) + ':' + (b / gcd(a, b)) + '。', '比');
    if (mode === 1) return mc(a + ':' + b + ' 的比值是多少？', frac(a, b), [frac(b, a), fmt(a / b + 1), a * b], '比值 = 前项÷后项 = ' + a + '÷' + b + '=' + frac(a, b) + '。', '比值');
    if (mode === 2) return choice(a + ':' + b + ' 可以写成（ ）。', [a + '÷' + b, a + '×' + b, a + '+' + b, b + '÷' + a], a + '÷' + b, '比的前项相当于被除数，后项相当于除数。', '比与除法');
    if (mode === 3) { var x = a * k; return mc(a + ':' + b + ' = ' + x + ':?，后项应填几？', b * k, [x, a, b], '前项乘 ' + k + '，后项也乘 ' + k + '，得 ' + (b * k) + '。', '比'); }
    return choice('比的后项可以是 0 吗？', ['不可以', '可以', '有时可以', '看情况'], '不可以', '后项相当于除数，除数不能为 0。', '比与除法');
  });

  reg('六上-L04', function (r, i) {
    var a = int(r, 1, 4), b = int(r, 2, 5), total = (a + b) * int(r, 2, 8), mode = (i || 0) % 5;
    if (a === b) b += 1; total = (a + b) * int(r, 2, 8);
    if (mode === 0) return mc('把 ' + total + ' 按 ' + a + ':' + b + ' 分配，两份分别是多少？', (total / (a + b) * a) + ' 和 ' + (total / (a + b) * b), [(total / (a + b)) + ' 和 ' + (total / (a + b)), frac(total, a) + ' 和 ' + frac(total, b), (total * a) + ' 和 ' + (total * b)], '总份数 ' + (a + b) + '，一份 ' + total + '÷' + (a + b) + '=' + (total / (a + b)) + '。', '按比分配');
    if (mode === 1) return mc('按 ' + a + ':' + b + ' 分配，第一份是 ' + (total / (a + b) * a) + '，第二份是多少？', total / (a + b) * b, [total / (a + b) * a, total, total / (a + b)], '总份数 ' + (a + b) + '，第二份占 ' + b + ' 份，得 ' + (total / (a + b) * b) + '。', '份数');
    if (mode === 2) return mc('两数比是 ' + a + ':' + b + '，第一份是 ' + (total / (a + b) * a) + '，总数是多少？', total, [total / (a + b) * b, total / (a + b), total * a], '第一份占 ' + a + ' 份，一份是 ' + (total / (a + b)) + '，总数 ' + total + '。', '总量');
    if (mode === 3) return mc('两数比是 ' + a + ':' + b + '，两份相差 ' + (total / (a + b) * Math.abs(a - b)) + '，总数是多少？', total, [total / (a + b) * b, total / (a + b), total * b], '相差 ' + Math.abs(a - b) + ' 份，一份是 ' + (total / (a + b)) + '，总数 ' + total + '。', '按比分配');
    return choice('按比分配时，第一步通常先求（ ）。', ['总份数和一份的量', '较大的数', '较小的数', '平均数'], '总份数和一份的量', '先求总份数，再求一份，最后分到各份。', '份数');
  });

  reg('六上-L05', function (r, i) {
    var d = int(r, 2, 9), mode = (i || 0) % 5;
    if (mode === 0) return choice('“北偏东 30°”表示从（ ）开始，向东偏 30°。', ['正北方向', '正东方向', '正南方向', '正西方向'], '正北方向', '北偏东，先指向北，再向东偏。', '方向和距离');
    if (mode === 1) return choice('A 在 B 的北偏东 30° 方向，那么 B 在 A 的（ ）方向。', ['南偏西 30°', '北偏西 30°', '南偏东 30°', '北偏东 30°'], '南偏西 30°', '方向相反、角度相同。', '相对位置');
    if (mode === 2) return mc('从学校向北走 ' + d + ' 千米，再向东走 ' + (d + 2) + ' 千米，一共走了多少千米？', 2 * d + 2, [d + 2, d * (d + 2), 2 * d], '两段路程相加：' + d + '+' + (d + 2) + '=' + (2 * d + 2) + ' 千米。', '位置与方向');
    if (mode === 3) return choice('只说方向，能确定一个点的位置吗？', ['不能，还要知道距离', '能', '一定能', '看方向'], '不能，还要知道距离', '方向和距离都确定，位置才唯一。', '方向和距离');
    return choice('地图上通常用“上北下南、左西右东”，东北方向在（ ）。', ['右上角', '左上角', '右下角', '左下角'], '右上角', '上北右东，东北在右上角。', '位置与方向');
  });

  reg('六上-L06', function (r, i) {
    var rr = int(r, 2, 9), mode = (i || 0) % 5;
    if (mode === 0) return mc('圆的半径是 ' + rr + ' 厘米，直径是多少？', 2 * rr, [rr, 4 * rr, rr + 2], '直径 = 半径×2 = ' + rr + '×2=' + (2 * rr) + ' 厘米。', '直径');
    if (mode === 1) return mc('圆的直径是 ' + (2 * rr) + ' 厘米，半径是多少？', rr, [2 * rr, 4 * rr, rr + 1], '半径 = 直径÷2 = ' + (2 * rr) + '÷2=' + rr + ' 厘米。', '半径');
    if (mode === 2) return mc('半径 ' + rr + ' 厘米的圆，周长是多少？（π 取 3.14）', fmt(2 * PI * rr), [fmt(PI * rr * rr), fmt(PI * rr), fmt(2 * rr)], '周长 = 2πr = 2×3.14×' + rr + '=' + fmt(2 * PI * rr) + ' 厘米。', '圆');
    if (mode === 3) return choice('画圆时，圆规针尖固定的位置是圆的（ ）。', ['圆心', '半径', '直径', '周长'], '圆心', '针尖固定在圆心，笔尖绕着它转。针尖的位置决定圆画在哪里。', '圆心');
    return choice('圆有几条对称轴？', ['无数条', '1 条', '2 条', '4 条'], '无数条', '任何一条过圆心的直线都是对称轴。', '圆');
  });

  reg('六上-L07', function (r, i) {
    var rr = int(r, 2, 9), R = rr + int(r, 1, 5), mode = (i || 0) % 5;
    if (mode === 0) return mc('半径 ' + rr + ' 厘米的圆，面积是多少？（π 取 3.14）', fmt(PI * rr * rr), [fmt(2 * PI * rr), fmt(PI * rr), fmt(2 * rr)], '面积 = πr² = 3.14×' + rr + '²=' + fmt(PI * rr * rr) + ' 平方厘米。', '圆的面积');
    if (mode === 1) return mc('直径 ' + (2 * rr) + ' 厘米的圆，面积是多少？（π 取 3.14）', fmt(PI * rr * rr), [fmt(PI * 2 * rr * 2 * rr), fmt(2 * PI * rr), fmt(PI * rr)], '先求半径 ' + rr + ' 厘米，再算 πr² = ' + fmt(PI * rr * rr) + '。', '圆的面积');
    if (mode === 2) return mc('外圆半径 ' + R + ' 厘米、内圆半径 ' + rr + ' 厘米的圆环，面积是多少？（π 取 3.14）', fmt(PI * (R * R - rr * rr)), [fmt(PI * (R * R + rr * rr)), fmt(PI * (R - rr) * (R - rr)), fmt(2 * PI * (R - rr))], '圆环面积 = π(R²−r²) = 3.14×(' + (R * R) + '−' + (rr * rr) + ')=' + fmt(PI * (R * R - rr * rr)) + '。', '圆环');
    if (mode === 3) return choice('半径扩大到原来的 2 倍，圆的面积扩大到原来的（ ）。', ['4 倍', '2 倍', '8 倍', '不变'], '4 倍', '面积与半径的平方成正比，2²=4。', '化圆为方');
    return choice('把圆平均分成若干份，拼成一个近似长方形，这个长方形的长相当于（ ）。', ['圆周长的一半', '圆的直径', '圆的半径', '圆的面积'], '圆周长的一半', '拼成的长方形长是 πr，正好是圆周长的一半。', '化圆为方');
  });

  reg('六上-L08', function (r, i) {
    var parts = pick(r, [2, 4, 8]), mode = (i || 0) % 5;
    if (mode === 0) return mc('把一个圆沿半径平均分成 ' + parts + ' 个扇形，每个扇形占整个圆的几分之几？', frac(1, parts), [frac(1, parts + 1), frac(1, parts + 2), frac(2, parts)], '平均分成 ' + parts + ' 份，每份就是整个圆的 ' + frac(1, parts) + '。', '扇形');
    if (mode === 1) return choice('圆心角的顶点在哪里？', ['圆心', '圆上', '圆外', '圆内任意一点'], '圆心', '两条半径在圆心相交，夹出的角叫圆心角。', '圆心角');
    if (mode === 2) return choice('扇形由两条半径和一段什么围成？', ['弧', '直径', '直线', '折线'], '弧', '两条半径是直边，圆上的一段弧是弯边。', '弧');
    if (mode === 3) return choice('同一个圆的两个扇形，一个占二分之一，另一个占四分之一，哪个面积大？', ['占二分之一的', '占四分之一的', '一样大', '无法比较'], '占二分之一的', '同一个圆里，二分之一包含两个四分之一，所以面积更大。', '扇形');
    return choice('同一个圆中，圆心角越大，所选扇形的面积怎样变？', ['越大', '越小', '不变', '无法比较'], '越大', '两条半径的开口张大，扇形占的部分也变大。', '圆心角');
  });
  reg('六上-L09', function (r, i) {
    var p = int(r, 5, 95), mode = (i || 0) % 5;
    if (mode === 0) return mc('0.' + (p < 10 ? '0' + p : p) + ' 写成百分数是（ ）。', p + '%', [p / 10 + '%', p * 10 + '%', p + '‰'], '小数乘 100 再加百分号：' + p + '%。', '分数小数互化');
    if (mode === 1) { var n = int(r, 1, 3), d = 4; var pv = n * 100 / d; return mc(frac(n, d) + ' 写成百分数是（ ）。', pv + '%', [(pv + 1) + '%', (pv - 1) + '%', (pv * 2) + '%'], frac(n, d) + '=' + (n / d) + '=' + pv + '%。', '百分数'); }
    if (mode === 2) { var total = int(r, 2, 10) * 10; return mc(total + ' 的 ' + p + '% 是多少？', total * p / 100, [total * p / 10, total / p, total - p], total + '×' + p + '%=' + (total * p / 100) + '。', '百分数'); }
    if (mode === 3) return choice(p + '% 表示（ ）。', ['百分之' + p, '千分之' + p, p + ' 个一', '百分之' + (p === 50 ? p + 1 : 100 - p)], '百分之' + p, '百分数表示一个数是另一个数的百分之几。', '百分率');
    return choice('百分数能带单位吗？', ['不能', '能', '有时能', '看情况'], '不能', '百分数表示两个数的倍比关系，不带单位。', '百分数');
  });

  reg('六上-L10', function (r, i) {
    var base = int(r, 20, 200), p = pick(r, [10, 20, 25, 30, 40, 50]), mode = (i || 0) % 5;
    if (mode === 0) return mc(base + ' 增加 ' + p + '% 后是多少？', base * (100 + p) / 100, [base * p / 100, base * (100 - p) / 100, base + p], '增加后的量 = ' + base + '×（1+' + p + '%）=' + (base * (100 + p) / 100) + '。', '百分数应用');
    if (mode === 1) return mc(base + ' 减少 ' + p + '% 后是多少？', base * (100 - p) / 100, [base * p / 100, base * (100 + p) / 100, base - p], '减少后的量 = ' + base + '×（1−' + p + '%）=' + (base * (100 - p) / 100) + '。', '增减');
    if (mode === 2) { var after = base * (100 + p) / 100; return mc('一个数增加 ' + p + '% 后是 ' + fmt(after) + '，原数是多少？', base, [after, after * (1 - p / 100), base + p], '原数 = ' + fmt(after) + '÷（1+' + p + '%）=' + base + '。', '单位1'); }
    if (mode === 3) { var price = int(r, 50, 300), off = pick(r, [6, 7, 8, 9]); return mc('原价 ' + price + ' 元，打 ' + off + ' 折后是多少元？', price * off / 10, [price * off / 100, price * (10 - off) / 10, price - off], '打 ' + off + ' 折就是原价的 ' + (off * 10) + '%，' + price + '×' + (off / 10) + '=' + (price * off / 10) + ' 元。', '百分数应用'); }
    return choice('“今年比去年增产 20%”，这里把（ ）看作单位“1”。', ['去年的产量', '今年的产量', '增产的部分', '总产量'], '去年的产量', '“比去年”中，去年是单位“1”。', '单位1');
  });

  reg('六上-L11', function (r, i) {
    var total = int(r, 2, 10) * 50, p = pick(r, [10, 20, 25, 30, 40, 50]), mode = (i || 0) % 5;
    if (mode === 0) return mc('扇形统计图中，某部分占 ' + p + '%，总数是 ' + total + '，这部分是多少？', total * p / 100, [total * p / 10, total - p, total / p], total + '×' + p + '%=' + (total * p / 100) + '。', '百分比');
    if (mode === 1) return mc('扇形统计图中，某部分占 ' + p + '%，其余部分一共占百分之几？', (100 - p) + '%', [(100 - p - 1) + '%', (100 + p) + '%', (100 - p + 1) + '%'], '整个圆代表 100%，其余部分占 100%−' + p + '%=' + (100 - p) + '%。', '扇形统计图');
    if (mode === 2) return choice('扇形统计图适合表示（ ）。', ['各部分占整体的百分比', '数量的增减变化', '具体数量的多少', '两个数的差'], '各部分占整体的百分比', '扇形统计图看部分与整体的关系。', '整体与部分');
    if (mode === 3) return choice('两个扇形统计图中，画得更大的扇形一定代表更多数量吗？', ['不一定，要用各自的总数乘所占百分比', '能，直接看扇形', '能，圆大的扇形一定大', '无法比较'], '不一定，要用各自的总数乘所占百分比', '图画得多大不代表数量多少；要分别用总数乘所占百分比，再比较。', '扇形统计图');
    return mc('扇形统计图中所有部分加起来是（ ）。', '100%', ['90%', '180%', '360%'], '各部分百分比之和是 100%。', '百分比');
  });

  reg('六上-L12', function (r, i) {
    var n = int(r, 3, 10), mode = (i || 0) % 5;
    if (mode === 0) return mc('1+3+5+…+（2×' + n + '−1）= ？', n * n, [n * (n + 1), 2 * n, n * n + n], '从 1 开始的连续奇数之和等于项数的平方：' + n + '²=' + (n * n) + '。', '平方数');
    if (mode === 1) return mc('按 1、4、9、16……排列，第 ' + n + ' 个平方数是多少？', n * n, [n * (n + 1), 2 * n, n * n + 1], '第 ' + n + ' 个平方数是 ' + n + '×' + n + '=' + (n * n) + '。', '平方数');
    if (mode === 2) return mc('在 ' + n + '×' + n + ' 的方格图外再添一层 L 形，需要添多少个小正方形？', 2 * n + 1, [2 * n, n * n, 2 * n - 1], '新一层每边 ' + (n + 1) + ' 个，L 形需要 2×' + n + '+1=' + (2 * n + 1) + ' 个。', '数与形');
    if (mode === 3) return choice('两个连续奇数的和一定是（ ）。', ['偶数', '奇数', '质数', '平方数'], '偶数', '奇数+奇数=偶数。', '奇偶');
    return mc('1+3+5+7+9 = ？', 25, [20, 30, 24], '5 个连续奇数相加，等于 5²=25。', '数与形');
  });

  reg('六上-L13', function (r, i) {
    var n = int(r, 1, 4), d = pick(r, [3, 4, 5, 6]), whole = d * int(r, 4, 12), mode = (i || 0) % 5;
    if (n >= d) n = d - 1;
    var part = whole * n / d;
    if (mode === 0) return mc('整体是 ' + whole + '，它的 ' + frac(n, d) + ' 是多少？', part, [whole / d, whole - part, whole * d / n], '求一个数的几分之几，用乘法：' + whole + '×' + frac(n, d) + '=' + part + '。', '分数应用');
    if (mode === 1) return mc('一个数的 ' + frac(n, d) + ' 是 ' + part + '，这个数是多少？', whole, [part, part * d / n, whole + n], '已知部分求整体，用除法：' + part + '÷' + frac(n, d) + '=' + whole + '。', '已知部分求整体');
    if (mode === 2) return mc('一个数的 ' + frac(n, d) + ' 是 ' + part + '，这个数的 ' + frac(1, d) + ' 是多少？', whole / d, [part, whole, part / d], '先求整体 ' + whole + '，再求它的 ' + frac(1, d) + '：' + whole + '÷' + d + '=' + (whole / d) + '。', '单位1');
    if (mode === 3) return choice('“男生人数是女生的 ' + frac(n, d) + '”，单位“1”是（ ）。', ['女生人数', '男生人数', '全班人数', '男女生之差'], '女生人数', '“是女生的几分之几”，女生是单位“1”。', '单位1');
    return mc('比 ' + whole + ' 多它的 ' + frac(n, d) + ' 的数是多少？', whole + part, [part, whole - part, whole * n], '先求多的部分 ' + part + '，再加上整体 ' + whole + '，得 ' + (whole + part) + '。', '分数应用');
  });

  reg('六上-L14', function (r, i) {
    var a = int(r, 1, 5), b = int(r, 2, 6), c = int(r, 1, 5), d = int(r, 2, 6), mode = (i || 0) % 5;
    if (b <= a) b = a + 1;
    if (d <= c) d = c + 1;
    if (mode === 0) { var N = a * 2 * d + c * b, D = b * 2 * d; return mc(frac(a, b) + ' + ' + frac(c, d) + ' × ' + frac(1, 2) + ' = ？', frac(N, D), [frac(N + 1, D), frac(N, D + 1), frac(N + 1, D + 1)], '先算乘法 ' + frac(c, 2 * d) + '，再与 ' + frac(a, b) + ' 相加，得 ' + frac(N, D) + '。', '运算顺序'); }
    if (mode === 1) return mc('(' + frac(a, b) + ' + ' + frac(c, d) + ') × ' + lcm(b, d) + ' = ？', a * (lcm(b, d) / b) + c * (lcm(b, d) / d), [a + c, a * c, lcm(b, d)], '用分配律：' + a + '×' + (lcm(b, d) / b) + '+' + c + '×' + (lcm(b, d) / d) + '=' + (a * (lcm(b, d) / b) + c * (lcm(b, d) / d)) + '。', '简便计算');
    if (mode === 2) { var N = a * (c + 1), D = b * d; return mc(frac(a, b) + ' × ' + frac(c, d) + ' + ' + frac(a, b) + ' × ' + frac(1, d) + ' = ？', frac(N, D), [frac(N + 1, D), frac(N, D + 1), frac(N + 1, D + 1)], '提取 ' + frac(a, b) + '：' + frac(a, b) + '×(' + frac(c, d) + '+' + frac(1, d) + ')=' + frac(N, D) + '。', '简便计算'); }
    if (mode === 3) return choice('分数混合运算的顺序是（ ）。', ['先乘除后加减，有括号先算括号', '从左往右', '先加减后乘除', '先算分母'], '先乘除后加减，有括号先算括号', '和整数混合运算顺序相同。', '运算顺序');
    var N = b * d - a * c, D = b * d;
    return mc('1 − ' + frac(a, b) + ' × ' + frac(c, d) + ' = ？', frac(N, D), [frac(N + 1, D), frac(N, D + 1), frac(N + 1, D + 1)], '先算乘法得 ' + frac(a * c, b * d) + '，再用 1 减，得 ' + frac(N, D) + '。', '分数混合运算');
  });

  reg('六上-L15', function (r, i) {
    var a = int(r, 20, 40), b = int(r, 20, 40), pa = int(r, 60, 95), pb = int(r, 60, 95), mode = (i || 0) % 5;
    if (mode === 0) { var passed = Math.round(a * pa / 100), roundedRate = Math.round(passed / a * 100); return mc(a + ' 人中有 ' + passed + ' 人达标，达标率约是多少（四舍五入到 1%）？', roundedRate + '%', [(roundedRate + 1) + '%', (roundedRate - 1) + '%', (roundedRate + 2) + '%'], '达标率 = ' + passed + '÷' + a + '×100%，约是 ' + roundedRate + '%。', '百分率'); }
    if (mode === 1) return choice('两个班人数不相同，合起来的达标率应该怎样算？', ['总达标人数÷总人数×100%', '两个达标率相加后除以 2', '用较高的那个达标率', '用较低的那个达标率'], '总达标人数÷总人数×100%', '先合计达标人数和总人数，再相除，不能把两个班当作人数相同的两份。', '加权平均');
    if (mode === 2) { var total = a + b, pass = Math.round(a * pa / 100) + Math.round(b * pb / 100); var rate = Math.round(pass / total * 100); return mc('一班 ' + a + ' 人达标 ' + Math.round(a * pa / 100) + ' 人，二班 ' + b + ' 人达标 ' + Math.round(b * pb / 100) + ' 人。两班合起来的达标率约是多少（四舍五入到 1%）？', rate + '%', [(rate + 1) + '%', (rate - 1) + '%', (rate + 2) + '%'], '总达标 ' + pass + ' 人，总人数 ' + total + '，达标率约是 ' + rate + '%。', '百分率'); }
    if (mode === 3) return choice('比较两个班的达标情况，只看达标率而不看人数，可能（ ）。', ['得出片面结论', '一定正确', '没有影响', '更准确'], '得出片面结论', '人数很少时，一个学生的变化就会让百分率大幅波动。', '统计判断');
    var students = 40, percent = pick(r, [60, 65, 70, 75, 80, 85, 90, 95]);
    return mc('某班 ' + students + ' 人，达标率 ' + percent + '%，达标人数是多少？', students * percent / 100, [students, students * (100 - percent) / 100, percent], students + '×' + percent + '%=' + (students * percent / 100) + ' 人。', '百分率');
  });

  reg('六上-L16', function (r, i) {
    var base = int(r, 50, 200), p = pick(r, [10, 20, 25, 50]), mode = (i || 0) % 5;
    if (mode === 0) { return mc('一个数先增加 ' + p + '%，再减少 ' + p + '%，最后是原来的百分之几？', fmt((100 + p) * (100 - p) / 100) + '%', ['100%', (100 + p) + '%', (100 - p) + '%'], '先乘（1+' + p + '%），再乘（1−' + p + '%），结果是原来的 ' + fmt((100 + p) * (100 - p) / 100) + '%。', '连续变化'); }
    if (mode === 1) { var after = base * (100 + p) / 100; return mc('一个数增加 ' + p + '% 后是 ' + fmt(after) + '，原数是多少？', base, [after, after * (1 - p / 100), base + p], '原数 = ' + fmt(after) + '÷（1+' + p + '%）=' + base + '。', '逆推'); }
    if (mode === 2) { var after2 = base * (100 - p) / 100; return mc('一个数减少 ' + p + '% 后是 ' + fmt(after2) + '，原数是多少？', base, [after2, after2 * (1 + p / 100), base - p], '原数 = ' + fmt(after2) + '÷（1−' + p + '%）=' + base + '。', '逆推'); }
    if (mode === 3) return choice('“先涨 20% 再降 20%”，最后的价格与原价相比（ ）。', ['比原价低', '比原价高', '一样', '无法判断'], '比原价低', '两次的 20% 对应的整体不同，最后是原价的 96%。', '连续变化');
    return choice('连续变化问题中，每次变化对应的“1”是（ ）。', ['变化前的量', '最初的总量', '变化后的量', '固定的数'], '变化前的量', '每一次变化都以变化前的量为单位“1”。', '百分数');
  });

  return MP;
});

/* practice-g6b.js */
/* 六年级下 · 参数化练习（每一题都由代码现算） */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./practice.js'));
  else factory(root.MathPractice);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (MP) {
  'use strict';
  var int = MP.int, pick = MP.pick, mc = MP.mc, choice = MP.choice, fmt = MP.fmt;

  var POINTS = {
    '六下-L01': ['负数', '数轴', '相反意义'],
    '六下-L02': ['折扣', '利率', '税率'],
    '六下-L03': ['圆柱', '侧面积', '表面积'],
    '六下-L04': ['圆柱体积', '底面积乘高', '切拼'],
    '六下-L05': ['圆锥体积', '三分之一', '等底等高'],
    '六下-L06': ['比例', '比值相等', '比例填数'],
    '六下-L07': ['正比例', '比值一定', '图像'],
    '六下-L08': ['乘积一定', '倍数关系', '数量变化'],
    '六下-L09': ['比例尺', '图上距离', '实际距离'],
    '六下-L10': ['鸽巢原理', '最不利', '抽屉'],
    '六下-L11': ['统计图选择', '条形', '折线', '扇形'],
    '六下-L12': ['知识整理', '综合应用', '运算'],
    '六下-L13': ['切拼', '表面积变化', '体积不变'],
    '六下-L14': ['比例', '行程', '速度比'],
    '六下-L15': ['统计调查', '平均数', '估算'],
    '六下-L16': ['综合应用', '方案设计', '数量关系']
  };
  function reg(id, make) { MP.register(id, POINTS[id], make); }
  var PI = 3.14;

  reg('六下-L01', function (r, i) {
    var a = int(r, 1, 9), b = int(r, 1, 9), mode = (i || 0) % 5;
    if (a === b) b = b === 9 ? 8 : b + 1;
    if (mode === 0) { var big = Math.max(a, b), small = Math.min(a, b); return choice('−' + small + ' 和 −' + big + ' 哪个大？', ['−' + small, '−' + big, '一样大', '无法比较'], '−' + small, '负数在数轴上越靠右越大，−' + small + ' 在 −' + big + ' 的右边。', '负数'); }
    if (mode === 1) return mc('温度从 −' + a + '℃ 上升到 ' + b + '℃，上升了多少度？', a + b, [b - a, a - b, a * b], '先升到 0℃，要上升 ' + a + '℃；再上升 ' + b + '℃，一共上升 ' + (a + b) + '℃。', '相反意义');
    if (mode === 2) return choice('如果收入 100 元记作 +100 元，那么支出 100 元记作（ ）。', ['−100 元', '+100 元', '0 元', '200 元'], '−100 元', '收入和支出是相反意义的量。', '相反意义');
    if (mode === 3) return choice('在数轴上，−2 在 −5 的（ ）。', ['右边', '左边', '同一点', '无法确定'], '右边', '数轴上右边的数比左边的大，−2 > −5。', '数轴');
    return mc('数轴上 −' + a + ' 到 0 的距离是多少个单位长度？', a, ['−' + a, 0, a + 1], '从 −' + a + ' 向右走 ' + a + ' 个单位长度，就到 0。', '数轴');
  });

  reg('六下-L02', function (r, i) {
    var price = int(r, 50, 300), off = pick(r, [6, 7, 8, 9]), mode = (i || 0) % 5;
    if (mode === 0) return choice('打 ' + off + ' 折表示按原价的（ ）出售。', [(off * 10) + '%', off + '%', (100 - off * 10) + '%', (off * 100) + '%'], (off * 10) + '%', '几折就是原价的百分之几十。', '折扣');
    if (mode === 1) return mc('原价 ' + price + ' 元，打 ' + off + ' 折后是多少元？', price * off / 10, [price * off / 100, price * (10 - off) / 10, price - off], '现价 = 原价×折扣 = ' + price + '×' + (off / 10) + '=' + (price * off / 10) + ' 元。', '折扣');
    if (mode === 2) { var sale = price * off / 10; return mc('一件商品打 ' + off + ' 折后是 ' + fmt(sale) + ' 元，原价是多少元？', price, [sale, sale * off / 10, sale + off], '原价 = 现价÷折扣 = ' + fmt(sale) + '÷' + (off / 10) + '=' + price + ' 元。', '折扣'); }
    if (mode === 3) { var principal = int(r, 1, 5) * 1000, rate = pick(r, [2, 2.5, 3, 4]), years = int(r, 2, 5); return mc('本金 ' + principal + ' 元，年利率 ' + rate + '%，存 ' + years + ' 年，按本金计算单利，利息是多少元？', principal * rate / 100 * years, [principal * rate / 100, principal * rate * years, principal + principal * rate / 100 * years], '利息 = 本金×利率×时间 = ' + principal + '×' + rate + '%×' + years + '=' + (principal * rate / 100 * years) + ' 元。', '利率'); }
    var income = int(r, 2, 10) * 1000, tax = pick(r, [3, 5, 10]);
    return mc('收入 ' + income + ' 元，题设税率为 ' + tax + '%，全部收入按此税率缴税，应缴多少元？', income * tax / 100, [income * tax, income / tax, income - tax], '税额 = 收入×税率 = ' + income + '×' + tax + '%=' + (income * tax / 100) + ' 元。', '税率');
  });

  reg('六下-L03', function (r, i) {
    var rr = int(r, 2, 9), h = int(r, 3, 12), mode = (i || 0) % 5;
    var lateral = 2 * PI * rr * h, base = PI * rr * rr;
    if (mode === 0) return mc('圆柱底面半径 ' + rr + ' 厘米、高 ' + h + ' 厘米，侧面积是多少？（π 取 3.14）', fmt(lateral), [fmt(base), fmt(2 * base + lateral), fmt(PI * rr * h)], '侧面积 = 底面周长×高 = 2×3.14×' + rr + '×' + h + '=' + fmt(lateral) + ' 平方厘米。', '侧面积');
    if (mode === 1) return mc('圆柱底面半径 ' + rr + ' 厘米、高 ' + h + ' 厘米，表面积是多少？（π 取 3.14）', fmt(2 * base + lateral), [fmt(base + lateral), fmt(lateral), fmt(2 * base)], '表面积 = 两个底面积 + 侧面积 = ' + fmt(2 * base) + '+' + fmt(lateral) + '=' + fmt(2 * base + lateral) + ' 平方厘米。', '表面积');
    if (mode === 2) return mc('无盖圆柱形水桶，底面半径 ' + rr + ' 厘米、高 ' + h + ' 厘米，需要多少铁皮？（π 取 3.14）', fmt(base + lateral), [fmt(2 * base + lateral), fmt(lateral), fmt(base)], '无盖只要一个底面：' + fmt(base) + '+' + fmt(lateral) + '=' + fmt(base + lateral) + ' 平方厘米。', '表面积');
    if (mode === 3) return choice('把圆柱侧面沿高剪开展平，得到一个（ ）。', ['长方形', '三角形', '梯形', '圆'], '长方形', '侧面沿高展开是长方形，长是底面周长，宽是高。', '侧面积');
    return mc('圆柱底面直径 ' + (2 * rr) + ' 厘米、高 ' + h + ' 厘米，侧面积是多少？（π 取 3.14）', fmt(PI * 2 * rr * h), [fmt(PI * rr * h), fmt(PI * rr * rr), fmt(2 * PI * rr + h)], '侧面积 = πdh = 3.14×' + (2 * rr) + '×' + h + '=' + fmt(PI * 2 * rr * h) + ' 平方厘米。', '圆柱');
  });

  reg('六下-L04', function (r, i) {
    var rr = int(r, 2, 8), h = int(r, 3, 12), mode = (i || 0) % 5;
    var base = PI * rr * rr, vol = base * h;
    if (mode === 0) return mc('圆柱底面半径 ' + rr + ' 厘米、高 ' + h + ' 厘米，体积是多少？（π 取 3.14）', fmt(vol), [fmt(base), fmt(2 * PI * rr * h), fmt(base * h / 3)], '体积 = 底面积×高 = 3.14×' + rr + '²×' + h + '=' + fmt(vol) + ' 立方厘米。', '圆柱体积');
    if (mode === 1) return mc('圆柱底面直径 ' + (2 * rr) + ' 厘米、高 ' + h + ' 厘米，体积是多少？（π 取 3.14）', fmt(vol), [fmt(PI * 2 * rr * 2 * rr * h), fmt(2 * PI * rr * h), fmt(vol / 3)], '先求半径 ' + rr + '，再算 πr²h = ' + fmt(vol) + '。', '圆柱体积');
    if (mode === 2) return mc('圆柱体积 ' + fmt(vol) + ' 立方厘米，底面积 ' + fmt(base) + ' 平方厘米，高是多少？', h, [fmt(vol), fmt(base), h + 1], '高 = 体积÷底面积 = ' + fmt(vol) + '÷' + fmt(base) + '=' + h + ' 厘米。', '底面积乘高');
    if (mode === 3) return choice('把圆柱切拼成近似的长方体，体积（ ）。', ['不变', '变大', '变小', '无法确定'], '不变', '切拼只改变形状，不改变体积。', '切拼');
    return choice('圆柱底面积不变，高变成原来的 2 倍，体积会怎样？', ['变成原来的 2 倍', '变成原来的 4 倍', '变成原来的一半', '不变'], '变成原来的 2 倍', '每一层的大小没变，层数变成了 2 倍，体积也变成 2 倍。', '圆柱体积');
  });

  reg('六下-L05', function (r, i) {
    var rr = int(r, 2, 8), h = 3 * int(r, 1, 4), mode = (i || 0) % 5;
    var cone = PI * rr * rr * h / 3, cyl = PI * rr * rr * h;
    if (mode === 0) return mc('圆锥底面半径 ' + rr + ' 厘米、高 ' + h + ' 厘米，体积是多少？（π 取 3.14）', fmt(cone), [fmt(cyl), fmt(PI * rr * rr), fmt(cone * 2)], '圆锥体积 = 底面积×高÷3 = ' + fmt(cone) + ' 立方厘米。', '圆锥体积');
    if (mode === 1) return mc('等底等高的圆柱体积是 ' + fmt(cyl) + ' 立方厘米，圆锥体积是多少？', fmt(cone), [fmt(cyl), fmt(cyl * 2), fmt(cyl / 2)], '圆锥体积是等底等高圆柱的三分之一：' + fmt(cone) + '。', '三分之一');
    if (mode === 2) return choice('圆锥体积公式是（ ）。', ['底面积×高÷3', '底面积×高', '底面积×高÷2', '底面周长×高'], '底面积×高÷3', '圆锥体积是与它等底等高圆柱体积的三分之一。', '圆锥体积');
    if (mode === 3) return mc('圆锥体积 ' + fmt(cone) + ' 立方厘米，底面积 ' + fmt(PI * rr * rr) + ' 平方厘米，高是多少？', h, [h * 3, h / 3, h + 1], '高 = 体积×3÷底面积 = ' + h + ' 厘米。', '等底等高');
    return choice('圆锥的高是（ ）。', ['从顶点到底面圆心的距离', '底面直径', '底面半径', '侧面长度'], '从顶点到底面圆心的距离', '圆锥的高是从顶点垂直到底面的距离。', '等底等高');
  });

  reg('六下-L06', function (r, i) {
    var a = int(r, 2, 9), b = int(r, 2, 9), k = int(r, 2, 5), mode = (i || 0) % 5;
    if (a === b) b = b === 9 ? 8 : b + 1;
    if (mode === 0) return mc(a + ':' + b + ' = □:' + (b * k) + '，□ 里填几？', a * k, [a, b * k, a + k], '后项变成原来的 ' + k + ' 倍，前项也要变成 ' + k + ' 倍：' + a + '×' + k + '=' + (a * k) + '。', '比例填数');
    if (mode === 1) return mc(a + ':' + b + ' = ' + (a * k) + ':□，□ 里填几？', b * k, [a * k, b, a], '前项变成原来的 ' + k + ' 倍，后项也要变成 ' + k + ' 倍：' + b + '×' + k + '=' + (b * k) + '。', '比例填数');
    if (mode === 2) return choice(a + ':' + b + ' 与 ' + (a * k) + ':' + (b * k) + ' 的比值相比，怎样？', ['相等', '前一个大', '后一个大', '无法比较'], '相等', '前项、后项都乘同一个非零数，比值不变。', '比值相等');
    if (mode === 3) return choice('下面哪一组能组成比例？', [a + ':' + b + ' 和 ' + (a * k) + ':' + (b * k), a + ':' + b + ' 和 ' + (a + k) + ':' + (b + k), a + ':' + b + ' 和 ' + (a * k) + ':' + b, a + ':' + b + ' 和 ' + a + ':' + (b + k)], a + ':' + b + ' 和 ' + (a * k) + ':' + (b * k), '前项后项同时乘 ' + k + '，比值相等，能组成比例。', '比例');
    return choice('表示两个比相等的式子叫作什么？', ['比例', '乘法算式', '差', '百分率'], '比例', '比如 2:3=4:6，表示这两个比相等。', '比例');
  });
  reg('六下-L07', function (r, i) {
    var k = int(r, 2, 6), x = int(r, 2, 8), mode = (i || 0) % 5;
    if (mode === 0) return mc('y 与 x 成正比例，x=' + x + ' 时 y=' + (k * x) + '。x=' + (x + 1) + ' 时 y 是多少？', k * (x + 1), [k * x + 1, k + x, k * x], '正比例中 y÷x=' + k + '，所以 y=' + k + '×' + (x + 1) + '=' + (k * (x + 1)) + '。', '正比例');
    if (mode === 1) return mc('y 与 x 成正比例，x=' + x + ' 时 y=' + (k * x) + '。比值是多少？', k, [x, k * x, k + x], '比值 = y÷x = ' + (k * x) + '÷' + x + '=' + k + '。', '比值一定');
    if (mode === 2) return choice('下面哪组量成正比例？', ['单价一定，总价和数量', '路程一定，速度和时间', '长方形面积一定，长和宽', '总页数一定，已看页数和未看页数'], '单价一定，总价和数量', '总价÷数量=单价（一定），所以成正比例。', '正比例');
    if (mode === 3) return choice('正比例的图像是一条（ ）。', ['过原点的直线', '曲线', '折线', '不过原点的直线'], '过原点的直线', 'y=kx 的图像是过原点的直线。', '图像');
    return mc('x 和 y 成正比例，x 扩大到原来的 2 倍，y（ ）。', '也扩大到原来的 2 倍', ['缩小到一半', '不变', '扩大 4 倍'], '正比例中 y 与 x 的比值不变，x 乘 2，y 也乘 2。', '正比例');
  });

  reg('六下-L08', function (r, i) {
    var length = int(r, 3, 9), width = int(r, 2, 6), area = length * width, mode = (i || 0) % 5;
    if (mode === 0) return mc('长方形面积是 ' + area + ' 平方厘米，长是 ' + length + ' 厘米，宽是多少厘米？', width, [area, length + width, width + 1], '面积不变，用面积除以长：' + area + '÷' + length + '=' + width + ' 厘米。', '乘积一定');
    if (mode === 1) return mc('长方形长 ' + length + ' 厘米、宽 ' + (2 * width) + ' 厘米。面积不变，长变成原来的 2 倍，宽要变成多少厘米？', width, [2 * width, 4 * width, width + 1], '长变成 2 倍，宽要变成原来的一半，长与宽的乘积才不变。', '倍数关系');
    if (mode === 2) return mc('同一段路，原来每小时走 30 千米，要 ' + (2 * width) + ' 小时。改为每小时 60 千米，需要几小时？', width, [2 * width, 4 * width, width + 1], '路程没变，每小时走的路程变成 2 倍，所需时间就是原来的一半：' + (2 * width) + '÷2=' + width + ' 小时。', '倍数关系');
    if (mode === 3) return choice('长方形长与宽的和不变，面积一定不变吗？', ['不一定', '一定不变', '一定变大', '一定变小'], '不一定', '例如长宽是 6 和 4，面积是 24；改成 7 和 3，和仍是 10，面积却是 21。', '数量变化');
    return choice('下面哪种情况下，两个量的乘积保持不变？', ['长方形面积不变时的长和宽', '长方形周长不变时的长和宽', '总页数不变时的已读页数和未读页数', '两人总钱数不变时各自的钱数'], '长方形面积不变时的长和宽', '长×宽=面积。面积不变，乘积就不变；其余条件保持的是和。', '乘积一定');
  });
  reg('六下-L09', function (r, i) {
    var scale = pick(r, [1000, 2000, 10000, 100000, 500000]), cm = int(r, 2, 9), mode = (i || 0) % 5;
    var actualCm = cm * scale;
    if (mode === 0) return mc('比例尺 1:' + scale + '，图上 ' + cm + ' 厘米表示实际多少千米？', fmt(actualCm / 100000), [fmt(actualCm / 1000), fmt(cm * scale / 10000), fmt(cm * scale)], '实际距离 = 图上距离×比例尺分母 = ' + cm + '×' + scale + ' 厘米 = ' + fmt(actualCm / 100000) + ' 千米。', '实际距离');
    if (mode === 1) { var km = int(r, 2, 9); return mc('比例尺 1:' + scale + '，实际 ' + km + ' 千米在图上应画多少厘米？', fmt(km * 100000 / scale), [fmt(km * 1000 / scale), fmt(km * scale / 100000), fmt(km)], '图上距离 = 实际距离÷比例尺分母 = ' + km + ' 千米 = ' + (km * 100000) + ' 厘米，除以 ' + scale + ' 得 ' + fmt(km * 100000 / scale) + ' 厘米。', '图上距离'); }
    if (mode === 2) return choice('比例尺 1:' + scale + ' 表示（ ）。', ['图上 1 厘米代表实际 ' + scale + ' 厘米', '图上 ' + scale + ' 厘米代表实际 1 厘米', '图上 1 厘米代表实际 ' + scale + ' 千米', '图上距离是实际距离的 ' + scale + ' 倍'], '图上 1 厘米代表实际 ' + scale + ' 厘米', '比例尺是图上距离与实际距离的比。', '比例尺');
    if (mode === 3) return mc('图上距离 ' + cm + ' 厘米，实际距离 ' + fmt(actualCm / 100000) + ' 千米，比例尺是多少？', '1:' + scale, ['1:' + (scale / 10), scale + ':1', '1:' + (scale * 10)], '先统一单位，再化简比，得 1:' + scale + '。', '比例尺');
    return choice('缩小比例尺的前项通常是（ ）。', ['1', '0', '图上距离', '实际距离'], '1', '缩小比例尺通常写成 1:... 的形式。', '比例尺');
  });

  reg('六下-L10', function (r, i) {
    var holes = int(r, 3, 6), pigeons = holes + int(r, 1, 5), mode = (i || 0) % 5;
    if (mode === 0) return mc(pigeons + ' 只鸽子飞进 ' + holes + ' 个鸽巢，至少有一个鸽巢里飞进几只？', Math.ceil(pigeons / holes), [Math.floor(pigeons / holes), pigeons - holes, holes], '平均分：' + pigeons + '÷' + holes + '=' + Math.floor(pigeons / holes) + '……' + (pigeons % holes) + '，至少有一个巢里有 ' + Math.ceil(pigeons / holes) + ' 只。', '鸽巢原理');
    if (mode === 1) { var colors = int(r, 2, 4); return mc('有 ' + colors + ' 种颜色的袜子，至少摸出几只才能保证有一双同色？', colors + 1, [colors, colors + 2, 2], '最不利情况先每种颜色各摸 1 只，共 ' + colors + ' 只，再摸 1 只必有同色，所以 ' + (colors + 1) + ' 只。', '最不利'); }
    if (mode === 2) return mc('13 个人中，至少有几人生日在同一个月？', 2, [1, 3, 12], '13÷12=1……1，至少 2 人同月。', '抽屉');
    if (mode === 3) return choice('鸽巢原理研究的是（ ）。', ['把多于巢数的物体放进巢里，至少有一个巢放多个', '怎样平均分', '怎样算平均数', '怎样画统计图'], '把多于巢数的物体放进巢里，至少有一个巢放多个', '这就是抽屉原理。', '鸽巢原理');
    return choice('用“最不利原则”时，先要考虑（ ）。', ['最坏的情况', '最好的情况', '平均情况', '任意情况'], '最坏的情况', '保证问题要看最不利的情况。', '最不利');
  });

  reg('六下-L11', function (r, i) {
    var mode = (i || 0) % 5;
    if (mode === 0) return choice('要比较四个班的人数多少，最好选（ ）。', ['条形统计图', '折线统计图', '扇形统计图', '统计表'], '条形统计图', '条形统计图便于比较数量的多少。', '条形');
    if (mode === 1) return choice('要表示一周气温的变化趋势，最好选（ ）。', ['折线统计图', '条形统计图', '扇形统计图', '统计表'], '折线统计图', '折线统计图能看出增减变化趋势。', '折线');
    if (mode === 2) return choice('要表示各部分占整体的百分比，最好选（ ）。', ['扇形统计图', '条形统计图', '折线统计图', '统计表'], '扇形统计图', '扇形统计图看部分与整体的关系。', '扇形');
    if (mode === 3) return choice('扇形统计图不能直接看出（ ）。', ['具体数量的多少', '各部分百分比', '整体与部分的关系', '哪部分最大'], '具体数量的多少', '扇形统计图只给百分比，具体数量还要结合总数。', '统计图选择');
    return choice('三种统计图各有侧重，选图前先要明确（ ）。', ['想从数据里知道什么', '图好不好看', '颜色搭配', '纸张大小'], '想从数据里知道什么', '先明确问题，再选能回答问题的统计图。', '统计图选择');
  });

  reg('六下-L12', function (r, i) {
    var a = int(r, 2, 9), b = int(r, 2, 9), c = int(r, 2, 9), mode = (i || 0) % 5;
    if (mode === 0) { var dd = int(r, 2, (a + b) * c); return mc('(' + a + ' + ' + b + ') × ' + c + ' − ' + dd + ' = ？', (a + b) * c - dd, [a + b * c - dd, (a + b) * (c - dd), a * b + c - dd], '先算括号 ' + (a + b) + '，乘 ' + c + ' 得 ' + ((a + b) * c) + '，再减 ' + dd + ' 得 ' + ((a + b) * c - dd) + '。', '运算'); }
    if (mode === 1) { var len = int(r, 4, 12), w = int(r, 2, 9); return mc('长方形长 ' + len + ' 厘米、宽 ' + w + ' 厘米，面积是多少？', len * w, [2 * (len + w), len + w, len * w / 2], '面积 = 长×宽 = ' + len + '×' + w + '=' + (len * w) + ' 平方厘米。', '综合应用'); }
    if (mode === 2) { var total = int(r, 2, 10) * 50, p = pick(r, [20, 25, 40, 50]); return mc(total + ' 的 ' + p + '% 是多少？', total * p / 100, [total * p / 10, total - p, total / p], total + '×' + p + '%=' + (total * p / 100) + '。', '综合应用'); }
    if (mode === 3) { var x = int(r, 2, 9), y = int(r, 2, 9), k = int(r, 2, 5); if (x === y) y += 1; return mc('把 ' + (x + y) * k + ' 按 ' + x + ':' + y + ' 分配，较大的一份是多少？', (x + y) * k / (x + y) * Math.max(x, y), [(x + y) * k / (x + y) * Math.min(x, y), (x + y) * k, k], '总份数 ' + (x + y) + '，一份 ' + k + '，较大的一份 ' + (k * Math.max(x, y)) + '。', '综合应用'); }
    var n = int(r, 3, 6), avg = int(r, 60, 90);
    return mc(n + ' 个数的平均数是 ' + avg + '，它们的总和是多少？', n * avg, [avg + n, avg * (n - 1), n * avg + n], '总和 = 平均数×个数 = ' + avg + '×' + n + '=' + (n * avg) + '。', '知识整理');
  });

  reg('六下-L13', function (r, i) {
    var a = int(r, 3, 8), b = int(r, 3, 8), c = int(r, 3, 8), mode = (i || 0) % 5;
    if (mode === 0) return mc('把长 ' + a + ' 厘米、宽 ' + b + ' 厘米、高 ' + c + ' 厘米' + ' 的长方体沿平行于宽和高的方向切成两个小长方体，表面积增加多少平方厘米？', 2 * b * c, [b * c, 4 * b * c, a * b * c], '切开后多出两个切面，每个切面 ' + b + '×' + c + '=' + (b * c) + '，共增加 ' + (2 * b * c) + '。', '切拼');
    if (mode === 1) return mc('两个完全一样的长方体，宽 ' + b + ' 厘米、高 ' + c + ' 厘米。把它们的宽×高面完全贴合，表面积比原来两个的表面积之和少多少平方厘米？', 2 * b * c, [b * c, 4 * b * c, 2 * (a * b + b * c + a * c)], '拼在一起遮住两个宽×高面，少 ' + (2 * b * c) + '。', '表面积变化');
    if (mode === 2) return choice('把长方体切开后，体积（ ）。', ['不变', '变大', '变小', '无法确定'], '不变', '切拼只改变表面积，体积不变。', '体积不变');
    if (mode === 3) return mc('把圆柱沿底面直径竖直切成两半，表面积增加多少平方厘米？（半径 ' + a + ' 厘米，高 ' + b + ' 厘米）', 2 * (2 * a) * b, [(2 * a) * b, 2 * a * b, 2 * PI * a * b], '增加两个长方形切面，每个长 ' + (2 * a) + '、宽 ' + b + '，共 ' + (2 * (2 * a) * b) + '。', '切拼');
    return choice('切拼问题中，表面积变化的关键是（ ）。', ['看增加了还是减少了几个面', '看体积变没变', '看长度', '看颜色'], '看增加了还是减少了几个面', '切开增加面，拼合减少面。', '表面积变化');
  });

  reg('六下-L14', function (r, i) {
    var v1 = int(r, 2, 6), v2 = int(r, 3, 8), t = int(r, 2, 5), mode = (i || 0) % 5;
    if (v1 === v2) v2 += 1;
    if (mode === 0) return choice('两车速度比是 ' + v1 + ':' + v2 + '，行驶同样时间，路程比是（ ）。', [v1 + ':' + v2, v2 + ':' + v1, v1 + ':' + (v1 + v2), '无法确定'], v1 + ':' + v2, '时间相同，路程比等于速度比。', '速度比');
    if (mode === 1) return choice('两车速度比是 ' + v1 + ':' + v2 + '，行驶同样路程，时间比是（ ）。', [v2 + ':' + v1, v1 + ':' + v2, v1 + ':' + (v1 + v2), '无法确定'], v2 + ':' + v1, '路程相同，时间比等于速度的反比。', '比例');
    if (mode === 2) { var s = (v1 + v2) * t; return mc('两车从相距 ' + s + ' 千米的两地同时出发，相向而行，速度分别是 ' + v1 + ' 和 ' + v2 + ' 千米/时，几小时相遇？', t, [s / v1, s / v2, t + 1], '相遇时间 = 路程÷速度和 = ' + s + '÷(' + v1 + '+' + v2 + ')=' + t + ' 小时。', '行程'); }
    if (mode === 3) { var scale = pick(r, [100000, 200000, 500000]); var cm = int(r, 2, 8); return mc('比例尺 1:' + scale + '，图上 ' + cm + ' 厘米表示实际多少千米？', fmt(cm * scale / 100000), [fmt(cm * scale / 1000), fmt(cm * scale / 10000), fmt(cm * scale)], '实际距离 = ' + cm + '×' + scale + ' 厘米 = ' + fmt(cm * scale / 100000) + ' 千米。', '比例'); }
    return mc('甲、乙速度比 ' + v1 + ':' + v2 + '，两人行驶时间相同。甲行 ' + (v1 * t) + ' 千米时，乙行多少千米？', v2 * t, [v1 * t, v2, v1 + v2], '时间相同，路程比等于速度比：乙行 ' + v2 + '×' + t + '=' + (v2 * t) + ' 千米。', '速度比');
  });

  reg('六下-L15', function (r, i) {
    var days = int(r, 3, 7), avg = int(r, 8, 20), mode = (i || 0) % 5;
    if (mode === 0) return mc(days + ' 天平均每天用水 ' + avg + ' 升，一共用水多少升？', days * avg, [avg + days, avg * (days - 1), days * avg + days], '总用水量 = 平均数×天数 = ' + avg + '×' + days + '=' + (days * avg) + ' 升。', '平均数');
    if (mode === 1) { var total = days * avg; return mc(days + ' 天共用水 ' + total + ' 升，平均每天用水多少升？', avg, [total, total / (days + 1), avg + 1], '平均数 = 总用水量÷天数 = ' + total + '÷' + days + '=' + avg + ' 升。', '统计调查'); }
    if (mode === 2) return choice('调查校园用水量时，只记录一天的数据，能代表一周的情况吗？', ['不能，要多记录几天', '能，一天就够', '能，因为每天都一样', '无法判断'], '不能，要多记录几天', '一天可能有偶然性，多记录几天再取平均数更可靠。', '统计调查');
    if (mode === 3) return choice('用样本估计总体时，样本应该（ ）。', ['有代表性', '越少越好', '只选特殊的一天', '随便选'], '有代表性', '样本要有代表性，估计才可靠。', '估算');
    return mc('一个水龙头每分钟漏水 ' + avg + ' 毫升，' + days + ' 分钟漏多少毫升？', avg * days, [avg + days, avg * days * 60, avg], '漏水量 = 每分钟漏水量×时间 = ' + avg + '×' + days + '=' + (avg * days) + ' 毫升。', '估算');
  });

  reg('六下-L16', function (r, i) {
    var price = int(r, 5, 30), qty = int(r, 3, 10), people = int(r, 20, 60), mode = (i || 0) % 5;
    if (mode === 0) return mc('每张门票 ' + price + ' 元，' + people + ' 人参观，买门票一共要多少元？', price * people, [price + people, price * (people + 1), price * people / 2], '总价 = 单价×人数 = ' + price + '×' + people + '=' + (price * people) + ' 元。', '数量关系');
    if (mode === 1) { var a = int(r, 4, 12), b = int(r, 3, 9); return mc('一块长方形菜地长 ' + a + ' 米、宽 ' + b + ' 米，面积是多少平方米？', a * b, [2 * (a + b), a + b, a * b / 2], '面积 = 长×宽 = ' + a + '×' + b + '=' + (a * b) + ' 平方米。', '综合应用'); }
    if (mode === 2) { var total = int(r, 2, 10) * 100, p = pick(r, [20, 25, 40, 50]); return mc('计划植树 ' + total + ' 棵，完成了 ' + p + '%，完成了多少棵？', total * p / 100, [total * p / 10, total - p, total / p], '完成数量 = 总数×完成率 = ' + total + '×' + p + '%=' + (total * p / 100) + ' 棵。', '方案设计'); }
    if (mode === 3) { var boys = int(r, 2, 6), girls = int(r, 2, 6); if (boys === girls) girls += 1; return mc('男生 ' + boys + ' 份、女生 ' + girls + ' 份，全班 ' + (boys + girls) * 5 + ' 人，男生有多少人？', boys * 5, [girls * 5, boys + girls, 5], '总份数 ' + (boys + girls) + '，一份 5 人，男生 ' + boys + '×5=' + (boys * 5) + ' 人。', '方案设计'); }
    var cost = price * qty;
    return mc('买 ' + qty + ' 件商品共 ' + cost + ' 元，平均每件多少元？', price, [cost, price + qty, price - 1], '单价 = 总价÷数量 = ' + cost + '÷' + qty + '=' + price + ' 元。', '数量关系');
  });

  return MP;
});
