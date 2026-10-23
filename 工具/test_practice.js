const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('node:vm');
const { loadCatalog } = require('./site/catalog');

const root = path.resolve(__dirname, '..');
const MP = require(path.join(root, 'assets/practice.js'));
const assets = path.join(root, 'assets');
for (const file of fs.readdirSync(assets).filter(file => /^practice-g.*\.js$/.test(file)).sort()) {
  require(path.join(assets, file));
}

test('学习安排：每课都有知识点，站内先修只指向更早的课', () => {
  const { ALL_LESSONS } = loadCatalog(root);
  const order = new Map(ALL_LESSONS.map((l, i) => [l.id, i]));
  assert.equal(ALL_LESSONS.length, 125);
  for (const lesson of ALL_LESSONS) {
    assert.ok(Array.isArray(lesson.knowledge) && lesson.knowledge.length >= 2, `${lesson.id} 缺知识点`);
    assert.equal(new Set(lesson.knowledge).size, lesson.knowledge.length, `${lesson.id} 知识点重复`);
    assert.ok(Array.isArray(lesson.prerequisiteLessons), `${lesson.id} 缺站内先修`);
    assert.equal(new Set(lesson.prerequisiteLessons).size, lesson.prerequisiteLessons.length, `${lesson.id} 先修重复`);
    for (const id of lesson.prerequisiteLessons) {
      assert.ok(order.has(id), `${lesson.id} 的先修课不存在：${id}`);
      assert.ok(order.get(id) < order.get(lesson.id), `${lesson.id} 的先修课不在前面：${id}`);
    }
  }
});

test('出题器覆盖全部 125 课，知识点与学习安排一致', () => {
  const { ALL_LESSONS } = loadCatalog(root);
  const ids = new Set(ALL_LESSONS.map(l => l.id));
  assert.deepEqual(new Set(MP.ids()), ids);
  for (const lesson of ALL_LESSONS) {
    const meta = MP.metadata(lesson.id);
    assert.deepEqual(meta.points, lesson.knowledge, `${lesson.id} 的知识点不一致`);
  }
});

test('每课都能稳定生成 5 道格式正确的题', () => {
  const { ALL_LESSONS } = loadCatalog(root);
  for (const lesson of ALL_LESSONS) {
    for (let seed = 1; seed <= 25; seed++) {
      const set = MP.generate(lesson.id, 5, seed * 104729 + 7);
      assert.equal(set.length, 5, `${lesson.id} 题量不足`);
      assert.equal(new Set(set.map(q => q.q)).size, 5, `${lesson.id} 题干重复`);
      for (const q of set) {
        assert.ok(q.q && q.q.length >= 4, `${lesson.id} 题干为空`);
        assert.equal(q.options.length, 4, `${lesson.id} 选项不是 4 个`);
        assert.equal(new Set(q.options).size, 4, `${lesson.id} 选项重复`);
        assert.ok(q.answer >= 0 && q.answer < 4, `${lesson.id} 答案越界`);
        assert.ok(q.explain && q.explain.length >= 6, `${lesson.id} 解析过短`);
        assert.ok(!/NaN|undefined|null/.test(q.q + q.options.join('') + q.explain), `${lesson.id} 含无效值`);
        assert.ok(lesson.knowledge.includes(q.point), `${lesson.id} 知识点不在本课：${q.point}`);
      }
    }
  }
});

test('同一种子结果可复现，不同种子会换题', () => {
  const { ALL_LESSONS } = loadCatalog(root);
  for (const lesson of ALL_LESSONS) {
    const a = MP.generate(lesson.id, 5, 20261023);
    const b = MP.generate(lesson.id, 5, 20261023);
    assert.deepEqual(a, b, `${lesson.id} 同种子结果不稳定`);
    const c = MP.generate(lesson.id, 5, 20261024);
    assert.notDeepEqual(a.map(q => q.q), c.map(q => q.q), `${lesson.id} 换种子没有换题`);
  }
});

// 直接检查各题型，避免只抽到一组里的五道题而漏掉其他分支。
const makers = new Map();
for (const file of fs.readdirSync(assets).filter(file => /^practice-g.*\.js$/.test(file))) {
  vm.runInNewContext(fs.readFileSync(path.join(assets, file), 'utf8'), {
    MathPractice: { ...MP, register: (id, points, make) => makers.set(id, make) }
  });
}
function question(id, variant, seed) { return makers.get(id)(MP.makeRng(seed), variant); }
function answer(q) { return q.options[q.answer]; }
function value(s) {
  if (s.includes('/')) { const [n, d] = s.split('/').map(Number); return n / d; }
  return Number(s);
}

test('入门分数保留题目中的份数，近似数保留指定的小数位', () => {
  for (let seed = 1; seed <= 100; seed++) {
    for (const [id, mode] of [['三上-L10', 2], ['五下-L09', 4]]) {
      const q = question(id, mode, seed);
      const [denominator, numerator] = q.q.match(/\d+/g).map(Number);
      assert.equal(answer(q), numerator + '/' + denominator, q.q);
    }
    const decimal = question('四下-L04', 4, seed);
    const digit = decimal.q.match(/0\.(\d)/)[1];
    assert.equal(answer(decimal), digit + '/10', decimal.q);
    const rounded = question('五上-L14', 0, seed);
    const [whole, tenth] = rounded.q.match(/(\d+)\.(\d)5/).slice(1).map(Number);
    assert.equal(answer(rounded), ((whole * 10 + tenth + 1) / 10).toFixed(1), rounded.q);
    const division = question('三下-L01', 1, seed);
    assert.ok(Number(division.q.match(/\d+/)[0]) >= 10, division.q);
    assert.equal(answer(division), '高位一端');
  }
});

test('分数基本性质题不把同样成立的商不变规律作为错项', () => {
  for (const [id, mode] of [['五下-L10', 0], ['五下-L13', 4]]) {
    const q = question(id, mode, 1);
    assert.equal(answer(q), '分数的基本性质');
    assert.ok(!q.options.includes('商不变规律'), q.q);
    assert.ok(q.explain.includes('商不变规律'), '说明分数和除法的联系');
  }
});

test('数学回归：小数除法、分数含义、约分、最简比和分段计费', () => {
  for (let seed = 1; seed <= 200; seed++) {
    for (const mode of [0, 1]) {
      const q = question('五上-L02', mode, seed);
      const [a, b] = q.q.match(/[\d.]+/g).map(Number);
      assert.ok(Math.abs(value(answer(q)) - a / b) < 1e-10, q.q);
    }
    const fraction = question('三上-L10', 1, seed);
    assert.equal(Number(answer(fraction)), Number(fraction.q.match(/\/(\d+)/)[1]), fraction.q);
    const factor = question('五下-L13', 3, seed);
    const [n, d] = factor.q.match(/\d+/g).map(Number);
    assert.equal(Number(answer(factor)), MP.gcd(n, d), factor.q);
    const ratio = question('六上-L03', 0, seed);
    const [x, y] = ratio.q.match(/\d+/g).map(Number);
    const [u, v] = answer(ratio).split(':').map(Number);
    assert.equal(x * v, y * u, ratio.q);
    assert.equal(MP.gcd(u, v), 1, ratio.q);
    const parking = question('五上-L15', 2, seed);
    const [, first, per, hours] = parking.q.match(/\d+/g).map(Number);
    assert.equal(Number(answer(parking)), first + per * (hours - 1), parking.q);
    const common = question('五下-L10', 3, seed);
    const [numerator, denominator, , commonDenominator] = common.q.match(/\d+/g).map(Number);
    assert.equal(Number(answer(common)) * denominator, numerator * commonDenominator, common.q);
  }
});

test('数学回归：周期余数、百分率、统计并列和近似数', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const cycle = question('三下-L11', 0, seed);
    const [n, d, quotient, remainder] = cycle.explain.match(/\d+/g).map(Number);
    assert.equal(n, d * quotient + remainder, cycle.explain);
    assert.ok(remainder < d, cycle.explain);
    const rate = question('六上-L15', 0, seed);
    const [total, passed] = rate.q.match(/\d+/g).map(Number);
    assert.equal(answer(rate), Math.round(passed / total * 100) + '%', rate.q);
    const trend = question('五下-L14', 2, seed);
    const [a, b] = trend.q.match(/\d+/g).map(Number);
    assert.equal(answer(trend), b > a ? '上升' : b < a ? '下降' : '不变', trend.q);
    const bars = question('三下-L16', 0, seed);
    const values = bars.q.match(/\d+/g).map(Number);
    const days = ['周一', '周二', '周三'];
    assert.equal(answer(bars), days.filter((_, i) => values[i] === Math.max(...values)).join('、'), bars.q);
    const rounded = question('五上-L14', 1, seed);
    const [numerator, denominator] = rounded.q.match(/\d+/g).map(Number);
    assert.equal(answer(rounded), (numerator / denominator).toFixed(2), rounded.q);
    assert.equal(new Set(rounded.options.map(Number)).size, 4, rounded.q);
    const change = question('六上-L16', 0, seed);
    const percent = Number(change.q.match(/\d+/)[0]);
    assert.equal(parseFloat(answer(change)), (100 + percent) * (100 - percent) / 100, change.q);
  }
});

test('数学回归：切拼题条件齐全，比例尺只有一个正确选项', () => {
  for (let seed = 1; seed <= 100; seed++) {
    const cut = question('六下-L13', 1, seed);
    const [width, height] = cut.q.match(/\d+/g).map(Number);
    assert.equal(Number(answer(cut)), 2 * width * height, cut.q);
    const scale = question('六下-L09', 2, seed);
    assert.ok(!scale.options.some(option => option.startsWith('实际是图上的')), scale.q);
    const trees = question('六下-L16', 2, seed);
    assert.ok(Number.isInteger(Number(answer(trees))), trees.q);
  }
});

test('每个题型在多组数据下都有四个不同选项，答案属于本课知识点', () => {
  for (const [id, make] of makers) {
    const covered = new Set();
    for (let mode = 0; mode < 7; mode++) for (let seed = 1; seed <= 100; seed++) {
      const q = make(MP.makeRng(seed), mode);
      covered.add(q.point);
      assert.equal(q.options.length, 4, id + ': ' + q.q);
      assert.equal(new Set(q.options.map(String)).size, 4, id + ': ' + q.q);
      assert.ok(MP.metadata(id).points.includes(q.point), id + ': ' + q.point);
      assert.ok(!/NaN|undefined|null/.test(JSON.stringify(q)), id + ': ' + q.q);
      assert.ok(!/\d\.\d{10}/.test(JSON.stringify(q)), id + ': 出现机器精度尾数 ' + q.q);
      if (q.options.every(option => /^-?\d+(?:\.\d+)?(?:\/\d+)?$/.test(option))) {
        assert.equal(new Set(q.options.map(option => Math.round(value(option) * 1e10))).size, 4, id + ': 等值选项 ' + q.q);
      }
      const expression = q.q.match(/^([\d.\s+×÷−()\/]+) = ？$/);
      if (expression && Number.isFinite(value(answer(q))) && !answer(q).includes('……')) {
        // 只允许数字和算术符号；先把横排分数视作一个整体，再独立计算。
        const source = expression[1].replace(/(\d+)\/(\d+)/g, '($1/$2)').replaceAll('×', '*').replaceAll('÷', '/').replaceAll('−', '-');
        const expected = vm.runInNewContext(source);
        assert.ok(Math.abs(value(answer(q)) - expected) < 1e-9, id + ': ' + q.q);
      }
    }
    assert.deepEqual([...covered].sort(), [...MP.metadata(id).points].sort(), id + ': 有知识点始终不会出题');
  }
});

test('选题轮换能覆盖第六、第七题型，固定文字题的正确选项也会换位置', () => {
  const local = requireFreshEngine();
  local.register('轮换', ['知识点'], (r, i) => local.choice('固定题型 ' + i % 7, ['对', '错一', '错二', '错三'], '对', '题型解释', '知识点'));
  const variants = new Set(), positions = new Set();
  for (let seed = 1; seed <= 30; seed++) for (const q of local.generate('轮换', 5, seed)) {
    variants.add(q.q); positions.add(q.answer);
  }
  assert.equal(variants.size, 7);
  assert.equal(positions.size, 4);
});

function requireFreshEngine(extra = {}) {
  const context = vm.createContext(extra);
  vm.runInContext(fs.readFileSync(path.join(assets, 'practice.js'), 'utf8'), context);
  return context.MathPractice;
}

test('薄弱知识点优先选三题；题库不足时用其他题补齐，不会卡在重复题上', () => {
  const local = requireFreshEngine();
  local.register('优先', ['薄弱', '复习'], (r, i) => local.mc('题号 ' + i, i, [i + 1, i + 2, i + 3], '题型解释', i % 3 === 0 ? '薄弱' : '复习'));
  for (let seed = 1; seed <= 20; seed++) {
    const set = local.generate('优先', 5, seed, ['薄弱']);
    assert.equal(set.length, 5);
    assert.equal(set.filter(q => q.point === '薄弱').length, 3);
  }
  local.register('有限', ['薄弱', '复习'], (r, i) => local.mc('题型 ' + Math.floor(i / 2) % 6, 1, [2, 3, 4], '题型解释', Math.floor(i / 2) % 6 === 0 ? '薄弱' : '复习'));
  const set = local.generate('有限', 5, 1, ['薄弱']);
  assert.equal(set.length, 5);
  assert.equal(new Set(set.map(q => q.q)).size, 5);
  assert.equal(set.filter(q => q.point === '薄弱').length, 1);
});

// 仅模拟练习面板用到的 DOM；点击的仍是生产代码注册的事件处理器。
function practiceDOM(id) {
  class Node {
    constructor() { this.children = []; this.attributes = {}; this.events = {}; this.className = ''; this.textContent = ''; this.classes = new Set(); }
    set innerHTML(_) { this.children = []; }
    appendChild(child) { this.children.push(child); return child; }
    setAttribute(name, value) { this.attributes[name] = value; }
    getAttribute(name) { return this.attributes[name]; }
    addEventListener(name, handler) { this.events[name] = handler; }
    focus() {}
    click() { this.events.click(); }
    get classList() { return { add: name => this.classes.add(name), toggle: (name, on) => on ? this.classes.add(name) : this.classes.delete(name) }; }
    querySelector(selector) {
      const matches = node => selector[0] === '.' ? node.className === selector.slice(1) : node.getAttribute(selector.slice(1, -1)) != null;
      for (const child of this.children) { if (matches(child)) return child; const match = child.querySelector(selector); if (match) return match; }
      return null;
    }
  }
  const section = new Node(), body = new Node(), weak = new Node(), events = {};
  section.setAttribute('data-practice', id);
  body.setAttribute('data-practice-body', ''); weak.setAttribute('data-practice-weak', '');
  section.appendChild(body); section.appendChild(weak);
  const document = {
    readyState: 'loading',
    addEventListener: (name, handler) => { events[name] = handler; },
    querySelectorAll: () => [section],
    createElement: () => new Node(),
    createTextNode: text => { const node = new Node(); node.textContent = text; return node; }
  };
  return { section, body, weak, document, init: () => events.DOMContentLoaded() };
}

test('答题流程：防重复点击，错题跨页面保留，连对两次清除，再错重新记录', () => {
  const data = new Map();
  const localStorage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
  function mount() {
    const dom = practiceDOM('流程');
    const local = requireFreshEngine({ document: dom.document, localStorage });
    local.register('流程', ['计算'], (r, i) => local.choice('题目 ' + i, ['对', '错一', '错二', '错三'], '对', '这是本题的解析。', '计算'));
    dom.init();
    return { dom, local };
  }
  const first = mount();
  assert.equal(first.dom.body.querySelector('.practice-explain').hidden, true);
  function choose(panel, correct) {
    const options = panel.dom.body.querySelector('.practice-options');
    const button = options.children.find(node => (node.children[1].textContent === '对') === correct);
    button.click(); button.click();
    assert.ok(options.children.every(node => node.disabled));
    assert.equal(panel.dom.body.querySelector('.practice-explain').hidden, false);
  }
  choose(first, false);
  assert.equal(first.local.weakPoints('流程')[0].fails, 1);
  const resumed = mount();
  assert.equal(resumed.local.weakPoints('流程').length, 1);
  choose(resumed, true);
  assert.equal(resumed.local.weakPoints('流程').length, 1);
  resumed.dom.body.querySelector('.practice-next').click();
  choose(resumed, true);
  assert.equal(resumed.local.weakPoints('流程').length, 0);
  resumed.dom.body.querySelector('.practice-next').click();
  choose(resumed, false);
  assert.equal(resumed.local.weakPoints('流程').length, 1);
  for (let i = 0; i < 2; i++) { resumed.dom.body.querySelector('.practice-next').click(); choose(resumed, true); }
  resumed.dom.body.querySelector('.practice-next').click();
  assert.equal(resumed.dom.body.querySelector('.practice-score').textContent, '这一组答对 4 / 5 题。');
  resumed.dom.body.querySelector('.practice-again').click();
  assert.equal(resumed.dom.body.querySelector('.practice-count').textContent, '第 1 / 5 题');
  resumed.local.clearAll();
  assert.equal(resumed.local.weakSummary().length, 0);
});

test('从课程返回练习记录页时，pageshow 会刷新汇总', () => {
  const total = {}, detail = {}, row = { getAttribute: () => '流程', classList: { toggle() {} } };
  const events = {};
  let records = [];
  vm.runInNewContext(fs.readFileSync(path.join(assets, 'practice-hub.js'), 'utf8'), {
    window: { MathPractice: { weakSummary: () => records }, addEventListener: (name, handler) => { events[name] = handler; } },
    document: { querySelectorAll: () => [row], querySelector: selector => ({ '[data-practice-total]': total, '[data-practice-detail]': detail, '[data-practice-clear]': null }[selector]) }
  });
  assert.equal(total.textContent, '0');
  records = [{ lesson: '流程', point: '计算', fails: 1 }];
  events.pageshow();
  assert.equal(total.textContent, '1');
  assert.equal(row.textContent, '计算');
});

test('基础练习不强制正文中单独列出的初中衔接内容', () => {
  const restricted = {
    '三上-L15': /\d+°|多少度|90/,
    '三下-L13': /坐标|原点/,
    '四下-L08': /坐标|原点/,
    '五上-L07': /解方程|两边同时|两边除以/,
    '五上-L08': /列方程|设.*为 x|解得 x/,
    '五下-L05': /坐标|原点逆时针/,
    '六上-L08': /÷360|弧长是多少/,
    '六上-L11': /圆心角是多少/,
    '六下-L01': /绝对值|\|−/,
    '六下-L04': /圆锥/,
    '六下-L06': /交叉相乘|内项|外项/,
    '六下-L08': /反比例|双曲线|xy=k/
  };
  for (const [id, pattern] of Object.entries(restricted)) {
    for (let mode = 0; mode < 7; mode++) {
      const q = question(id, mode, 1);
      assert.ok(!pattern.test(q.q + q.explain), id + ': ' + q.q);
    }
  }
});

test('知识点更新后，旧标签不再显示成永远无法清除的薄弱点', () => {
  const saved = { '当前课': { '旧标签': { cleared: false }, '当前标签': { fails: 1, cleared: false } }, '已撤下的课': { '旧标签': { cleared: false } } };
  const local = requireFreshEngine({ localStorage: { getItem: () => JSON.stringify(saved) } });
  local.register('当前课', ['当前标签'], () => {});
  assert.equal(local.weakPoints('当前课').length, 1);
  assert.equal(local.weakSummary().length, 1);
  assert.equal(local.weakSummary()[0].point, '当前标签');
});

test('页面已加载后插入练习脚本，也会等题库注册完再初始化', async () => {
  const dom = practiceDOM('稍后注册');
  dom.document.readyState = 'complete';
  const local = requireFreshEngine({ document: dom.document });
  local.register('稍后注册', ['测试'], (r, i) => local.mc('题目 ' + i, 1, [2, 3, 4], '题型解释', '测试'));
  await Promise.resolve();
  assert.equal(dom.body.querySelector('.practice-count').textContent, '第 1 / 5 题');
});
