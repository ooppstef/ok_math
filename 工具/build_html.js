#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { SEMESTERS } = require('./site/config');
const { loadCatalog } = require('./site/catalog');
const { renderDoc } = require('./site/render');
const { docsPage, semesterPage, coursePage, homePage } = require('./site/templates');

function build(root = path.resolve(__dirname, '..')) {
  const site = loadCatalog(root);
  function write(file, html) {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, html);
    console.log('✓', file);
  }

  site.DOCS.forEach(doc => renderDoc(doc, site));
  write('00-方案/index.html', docsPage());
  for (const sem of SEMESTERS) {
    const lessons = site.ALL_LESSONS.filter(l => l.sem === sem).sort((a, b) => a.no.localeCompare(b.no));
    if (lessons.length) write(`课程/${sem}/index.html`, semesterPage(sem, lessons));
  }
  write('课程/index.html', coursePage(site.ALL_LESSONS));
  write('index.html', homePage(site.ALL_LESSONS));
}

if (require.main === module) build();
module.exports = { build };
