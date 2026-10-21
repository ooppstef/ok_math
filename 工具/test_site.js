const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { loadCatalog, learningLabel } = require('./site/catalog');
const { homePage, coursePage } = require('./site/templates');

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
