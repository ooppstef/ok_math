const path = require('path');
const { LEARNING_GROUPS, SEM_NAMES, DOC_CARDS } = require('./config');
const { lessonsIn, learningLabel, expandSem } = require('./catalog');

function rootRel(outRel, ROOT) {
  const dir = path.dirname(path.join(ROOT, outRel));
  let r = path.relative(dir, ROOT).split(path.sep).join('/');
  return r === '' ? '.' : r;
}
function href(root, p) {
  return root === '.' ? p : root + '/' + p;
}
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function stripTags(s) {
  return String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function videoBadge(lesson) {
  return lesson.hasVideo
    ? '<span class="badge video-badge" aria-label="本课有视频"><span aria-hidden="true">▶</span> 视频</span>'
    : '';
}

function topbar(root, learning) {
  return `<header class="topbar">
  <div class="inner">
    <a class="brand" href="${href(root, 'index.html')}"><span class="mark">M</span><span>为什么实验室 · 小学数学</span></a>
    <nav class="nav${learning ? ' learning-nav' : ''}" aria-label="网站导航">
${learning ? '' : `      <a href="${href(root, '00-方案/00-总方案.html')}">总方案</a>
      <a href="${href(root, '00-方案/09-96课总图.html')}">96 课地图</a>
      <a href="${href(root, '00-方案/03-B卷题型对照表.html')}">B 卷对照</a>\n`}      <a href="${href(root, '课程/index.html')}">课程目录</a>
    </nav>
  </div>
  <div class="progress"><span></span></div>
</header>`;
}

function shell({ root, title, kicker, subtitle, content, bodyClass, learning = false }) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#101826">
<link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iNSIgZmlsbD0iIzFlNGZkOCIvPjxwYXRoIGQ9Ik0xNCA0OFYxNmg4bDEwIDE3IDEwLTE3aDh2MzJoLThWMjlMMzIgNDYgMjIgMjl2MTl6IiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iNDciIHk9IjQ3IiB3aWR0aD0iOSIgaGVpZ2h0PSI5IiBmaWxsPSIjZjNjODRiIi8+PC9zdmc+">
<title>${escapeHtml(title)} · 为什么实验室</title>
<link rel="stylesheet" href="${href(root, 'assets/doc.css')}">
</head>
<body class="doc-page ${bodyClass || ''}" id="top">
${topbar(root, learning)}
<main class="page">
${content}
<div class="backtop"><a href="#top">↑ 回到顶部</a></div>
</main>
<script src="${href(root, 'assets/doc.js')}"></script>
</body>
</html>`;
}

function documentPage({ doc, root, title, body, lesson, video, note, actions, toc }) {
  const learning = doc.kind === 'lesson' || doc.kind === 'handout';
  const tocHtml = toc.length && !doc.fullWidth
    ? `<aside class="toc">
        <div class="toc-title">本页目录</div>
        ${toc.map(t => `<a class="lvl${t.lvl}" href="#${t.id}">${t.text}</a>`).join('')}
      </aside>`
    : '';

  const heroCopy = `<div class="hero-copy">
    <div class="hero-main">
      <div class="kicker">${escapeHtml(learning && lesson ? learningLabel(lesson) : expandSem(doc.kicker || '为什么实验室'))}</div>
      <h1 class="doc-title">${escapeHtml(title)}</h1>
${learning && lesson ? `      <p class="lesson-prerequisites">先会：${escapeHtml(lesson.prerequisites.join('、'))}</p>\n` : ''}${!learning && doc.subtitle ? `      <p class="doc-sub">${escapeHtml(doc.subtitle)}</p>\n` : ''}      <div class="actions">${actions.join('')}</div>    </div>
  </div>`;
  const heroMedia = video;
  const heroClasses = ['doc-hero'];
  if (heroMedia) heroClasses.push('has-media');
  const hero = heroMedia
    ? `<section class="${heroClasses.join(' ')}"><div class="hero-grid">${heroCopy}<div class="hero-media">${heroMedia}</div></div></section>`
    : `<section class="${heroClasses.join(' ')}">${heroCopy}</section>`;
  const content = `${hero}
${note}
<div class="doc-layout${doc.fullWidth || !tocHtml ? ' no-toc' : ''}">
  <article class="article">
${body}
  </article>
${tocHtml ? '  ' + tocHtml + '\n' : ''}</div>`;

  return shell({ root, title, content, bodyClass: doc.kind || 'doc', learning });
}

function docsPage() {
  const root = '..';
  const cards = DOC_CARDS;
  const content = `<section class="hub-hero">
  <div class="hub-hero-grid">
    <div>
      <div class="kicker">DOCS · 方案与工具</div>
      <h1 class="doc-title">先读哪一份？</h1>
      <p class="doc-sub">当前审查与教材边界见 29 号记录，学习入口按学段和前置安排。旧地图与报告保留作历史参考。</p>
    </div>
    <aside class="hub-side">
      <div class="side-label">推荐阅读顺序</div>
      <ol>
        <li>29 号记录：全新复审与学习安排</li>
        <li>课标覆盖核查：内容与证据</li>
        <li>课程目录：选择正在学的内容</li>
        <li>审查清单：视频制作前核对</li>
      </ol>
    </aside>
  </div>
</section>
<div class="hub-grid">
${cards.map(c => `<a class="hub-card" href="${c[4]}">
  <div class="num">${c[0]} · ${c[1]}</div>
  <h3>${c[2]}</h3>
  <p>${c[3]}</p>
  <span class="go">打开 →</span>
</a>`).join('')}
</div>`;
  return shell({ root, title: '方案与工具', content, bodyClass: 'hub' });
}

function semesterPage(sem, lessons) {
  const root = '../..';
    const rows = lessons.map(l => `<a class="lesson-row" href="${l.dir}/讲授稿.html">
        <div class="no">${l.no}</div>
        <div><h3>${escapeHtml(l.title)}${videoBadge(l)}</h3><p>${learningLabel(l)}</p></div>
      </a>`).join('');
    const content = `<section class="hub-hero">
  <h1 class="doc-title">${sem} · 原课号索引</h1>
  <p class="doc-sub">按旧课号找课；学习阶段以每课标注为准。</p>
</section>
<div class="lesson-list">
${rows}
</div>`;
    return shell({ root, title: SEM_NAMES[sem], content, bodyClass: 'hub course-hub', learning: true });
}

function coursePage(lessons) {
  const root = '..';
  const sections = LEARNING_GROUPS.map(group => {
    const rows = lessonsIn(group, lessons).map((l, i) => `<a class="lesson-row" href="${href(root, l.src.replace(/\.md$/, '.html'))}"><span class="no">${String(i + 1).padStart(2, '0')}</span><h3>${escapeHtml(l.title)}${videoBadge(l)}</h3></a>`).join('');
    return `<section class="learning-group">
  <h2>${group.title}</h2>
  <div class="lesson-list">${rows}</div>
</section>`;
  }).join('');
  const content = `<section class="hub-hero">
  <h1 class="doc-title">课程目录</h1>
</section>
${sections}`;
  return shell({ root, title: '课程目录', content, bodyClass: 'hub course-hub', learning: true });
}

function homePage(lessons) {
  const terms = LEARNING_GROUPS.map((group, i) => {
    const list = `<ol class="term-list">
${lessonsIn(group, lessons).map((l, j) => `          <li><a class="lesson" href="${escapeHtml(l.src.replace(/\.md$/, '.html'))}"><span class="lesson-no">${String(j + 1).padStart(2, '0')}</span><span class="lesson-name">${escapeHtml(l.title)}${videoBadge(l)}</span></a></li>`).join('\n')}
        </ol>`;
    return `      <section class="term">
        <div class="term-head">
          <span class="term-no">${String(i + 1).padStart(2, '0')}</span>
          <h3>${group.title}</h3>
        </div>
        ${list}
      </section>`;
  }).join('\n');
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#101826">
<link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iNSIgZmlsbD0iIzFlNGZkOCIvPjxwYXRoIGQ9Ik0xNCA0OFYxNmg4bDEwIDE3IDEwLTE3aDh2MzJoLThWMjlMMzIgNDYgMjIgMjl2MTl6IiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iNDciIHk9IjQ3IiB3aWR0aD0iOSIgaGVpZ2h0PSI5IiBmaWxsPSIjZjNjODRiIi8+PC9zdmc+">
<title>小学数学 · B 卷原理课</title>
<meta name="description" content="三至六年级数学课程，包含知识讲解、例题与练习。">
<link rel="stylesheet" href="assets/doc.css">
<link rel="stylesheet" href="assets/home.css">
</head>
<body class="doc-page" id="top">
<header class="topbar">
  <div class="inner">
    <a class="brand" href="index.html"><span class="mark">M</span><span>为什么实验室 · 小学数学</span></a>
  </div>
</header>
<main class="page">
  <header class="home-hero">
    <div class="kicker">三至六年级</div>
    <h1 class="home-title"><span>小学数学</span> <em>B 卷原理课</em></h1>
  </header>

  <section id="courses">
${terms}
  </section>

  <div class="backtop"><a href="#top">↑ 回到顶部</a></div>
</main>
</body>
</html>
`;
}

module.exports = { rootRel, href, escapeHtml, stripTags, documentPage, docsPage, semesterPage, coursePage, homePage };
