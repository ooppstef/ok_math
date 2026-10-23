#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { SEMESTERS } = require('./site/config');
const { loadCatalog } = require('./site/catalog');
const { renderDoc } = require('./site/render');
const { semesterPage, coursePage, practicePage, knowledgePage, homePage } = require('./site/templates');

const PRACTICE_PATTERN = /^practice-g.*\.js$/;

function buildPracticeBundle(root) {
  const files = ['practice.js', ...fs.readdirSync(path.join(root, 'assets')).filter(file => PRACTICE_PATTERN.test(file)).sort()];
  const source = '/* 自动生成：npm run build 会覆盖本文件。源文件为 assets/practice*.js */\n' + files
    .map(file => `/* ${file} */\n` + fs.readFileSync(path.join(root, 'assets', file), 'utf8'))
    .join('\n');
  fs.writeFileSync(path.join(root, 'assets/practice-all.js'), source);
  console.log('✓ assets/practice-all.js');
}

function build(root = path.resolve(__dirname, '..')) {
  const site = loadCatalog(root);
  buildPracticeBundle(root);
  function write(file, html) {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, html);
    console.log('✓', file);
  }

  site.DOCS.forEach(doc => renderDoc(doc, site));
  for (const sem of SEMESTERS) {
    const lessons = site.ALL_LESSONS.filter(l => l.sem === sem).sort((a, b) => a.no.localeCompare(b.no));
    if (lessons.length) write(`课程/${sem}/index.html`, semesterPage(sem, lessons));
  }
  write('课程/index.html', coursePage(site.ALL_LESSONS));
  write('课程/知识点.html', knowledgePage(site.ALL_LESSONS));
  write('课程/练习.html', practicePage(site.ALL_LESSONS));
  write('index.html', homePage(site.ALL_LESSONS));
}

if (require.main === module) build();
module.exports = { build };
