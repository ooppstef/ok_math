#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { build } = require('./build_html');
const { loadCatalog } = require('./site/catalog');
const { SEMESTERS } = require('./site/config');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
build(root);
const site = loadCatalog(root);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

function copy(file) {
  const target = path.join(out, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(root, file), target);
}

copy('index.html');
copy('课程/index.html');
copy('课程/知识点.html');
copy('课程/练习.html');
fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });
for (const sem of SEMESTERS) {
  if (site.ALL_LESSONS.some(lesson => lesson.sem === sem)) copy(`课程/${sem}/index.html`);
}
for (const doc of site.DOCS) {
  if (doc.kind === 'lesson' || doc.kind === 'handout') copy(doc.src.replace(/\.md$/, '.html'));
}
for (const lesson of site.ALL_LESSONS.filter(lesson => lesson.hasVideo)) {
  const dir = path.dirname(lesson.src);
  for (const name of ['视频.mp4', '视频.vtt', 'poster.jpg']) copy(`${dir}/${name}`);
}

// 显式提供 404，避免静态托管平台把不存在的地址当成首页。
fs.writeFileSync(path.join(out, '404.html'), `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>没有找到这一页 · 为什么实验室</title>
  <link rel="stylesheet" href="/assets/doc.css">
</head>
<body class="doc-page">
  <main class="page">
    <section class="doc-hero">
      <h1 class="doc-title">没有找到这一页</h1>
      <p>回到课程目录，重新选一课吧。</p>
      <a class="btn" href="/">打开课程目录</a>
    </section>
  </main>
</body>
</html>
`);
console.log(`公开网站已生成：${out}`);
