const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadCatalog, learningLabel } = require('./site/catalog');
const { homePage, coursePage, knowledgePage, practicePage } = require('./site/templates');

const root = path.resolve(__dirname, '..');
const removedIds = ['三上-L01', '三上-L02', '三上-L06'];

test('读取课程可重复调用，不重复登记文档或遗漏课程', () => {
  const first = loadCatalog(root);
  const second = loadCatalog(root);
  assert.deepEqual(second, first);
  assert.equal(first.ALL_LESSONS.length, 125);
  assert.equal(new Set(first.DOCS.map(d => d.src)).size, first.DOCS.length);
  assert.equal(first.ALL_LESSONS.filter(l => l.hasVideo).length, 49);
  assert.ok(first.ALL_LESSONS.every(l => !removedIds.includes(l.id)));
  assert.equal(first.ALL_LESSONS.filter(l => l.level === '轻奥').length, 13);
  const sources = fs.readdirSync(path.join(root, '课程'), { recursive: true })
    .filter(file => file.endsWith('.md')).map(file => '课程/' + file);
  assert.deepEqual(first.DOCS.map(d => d.src).sort(), ['README.md', ...sources].sort());
  for (const lesson of first.ALL_LESSONS) assert.ok(learningLabel(lesson));
});

test('首页和课程目录使用同一学习顺序，不再显示基础回顾', () => {
  const { ALL_LESSONS } = loadCatalog(root);
  const pages = [homePage(ALL_LESSONS), coursePage(ALL_LESSONS)];
  const lists = pages.map(html => [...html.matchAll(/href="([^"]+讲授稿\.html)"/g)].map(m => m[1].replace(/^\.\.\//, '')));
  assert.deepEqual(lists[0], lists[1]);
  assert.equal(lists[0].length, 125);
  assert.equal(new Set(lists[0]).size, 125);
  for (const html of pages) {
    assert.ok(!html.includes('review-group'));
    assert.ok(!html.includes('基础回顾'));
    assert.equal((html.match(/aria-label="本课有视频"/g) || []).length, 49);
    assert.ok(html.includes('三、四年级 · 轻奥选学'));
    assert.ok(html.includes('五、六年级 · 轻奥选学'));
  }
});

test('知识点索引覆盖全部知识点，练习记录页覆盖全部课程', () => {
  const { ALL_LESSONS } = loadCatalog(root);
  const knowledge = knowledgePage(ALL_LESSONS);
  const counts = new Map();
  for (const lesson of ALL_LESSONS) for (const tag of lesson.knowledge) counts.set(tag, (counts.get(tag) || 0) + 1);
  for (const tag of counts.keys()) assert.ok(knowledge.includes(tag), `知识点索引缺少：${tag}`);
  const multi = [...counts.values()].filter(n => n > 1).length;
  const single = [...counts.values()].filter(n => n === 1).length;
  assert.equal((knowledge.match(/class="kn-entry(?: |")/g) || []).length, multi + 1);
  assert.equal((knowledge.match(/class="kn-single"/g) || []).length, single);

  const practice = practicePage(ALL_LESSONS);
  assert.equal((practice.match(/class="lesson-row practice-row"/g) || []).length, 125);
  for (const lesson of ALL_LESSONS) assert.ok(practice.includes(`data-lesson="${lesson.id}"`));
});

test('知识点索引按当前学习阶段标注课程，不把存放目录当作适学年级', () => {
  const { ALL_LESSONS } = loadCatalog(root);
  const knowledge = knowledgePage(ALL_LESSONS);
  assert.ok(knowledge.includes('小数意义（五、六年级 · 基础）'));
  assert.ok(!/>四下 04 /.test(knowledge));
});
