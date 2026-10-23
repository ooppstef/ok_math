const path = require('path');
const { LEARNING_GROUPS, SEM_NAMES } = require('./config');
const { lessonsIn, learningLabel, expandSem } = require('./catalog');

function rootRel(outRel, ROOT) {
  const dir = path.dirname(path.join(ROOT, outRel));
  let r = path.relative(dir, ROOT).split(path.sep).join('/');
  return r === '' ? '.' : r;
}
function href(root, p) {
  return root === '.' ? p : root + '/' + p;
}
function courseHref(lesson) {
  return lesson.src.replace(/^课程\//, '').replace(/\.md$/, '.html');
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
${learning ? '' : `      <a href="${href(root, 'README.html')}">使用说明</a>\n`}      <a href="${href(root, '课程/index.html')}">课程目录</a>
      <a href="${href(root, '课程/知识点.html')}">知识点</a>
      <a href="${href(root, '课程/练习.html')}">练习记录</a>
    </nav>
  </div>
  <div class="progress"><span></span></div>
</header>`;
}

function shell({ root, title, kicker, subtitle, content, bodyClass, learning = false, scripts = '' }) {
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
${scripts ? scripts + '\n' : ''}</body>
</html>`;
}

function documentPage({ doc, root, title, body, lesson, video, note, actions, toc, practice = '', prereqLinks = '', scripts = '' }) {
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
${learning && lesson ? `      <p class="lesson-prerequisites">先会：${escapeHtml(lesson.prerequisites.join('、'))}</p>\n` : ''}${learning && lesson && lesson.knowledge ? `      <p class="lesson-knowledge">本课知识点：${lesson.knowledge.map(k => `<span class="kn-tag">${escapeHtml(k)}</span>`).join('')}</p>\n` : ''}${learning && lesson && prereqLinks ? `      <p class="lesson-links">可以先学：${prereqLinks}</p>\n` : ''}${!learning && doc.subtitle ? `      <p class="doc-sub">${escapeHtml(doc.subtitle)}</p>\n` : ''}      <div class="actions">${actions.join('')}</div>    </div>
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
${practice}
  </article>
${tocHtml ? '  ' + tocHtml + '\n' : ''}</div>`;

  return shell({ root, title, content, bodyClass: doc.kind || 'doc', learning, scripts });
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

function practicePage(lessons) {
  const root = '..';
  const sections = LEARNING_GROUPS.map(group => {
    const rows = lessonsIn(group, lessons).map((l, i) => `<a class="lesson-row practice-row" href="${courseHref(l)}#practice-heading" data-lesson="${l.id}">
        <span class="no">${String(i + 1).padStart(2, '0')}</span>
        <h3>${escapeHtml(l.title)}</h3>
        <span class="practice-row-weak" data-weak-for="${l.id}"></span>
      </a>`).join('');
    return `<section class="learning-group">
  <h2>${group.title}</h2>
  <div class="lesson-list">${rows}</div>
</section>`;
  }).join('');
  const content = `<section class="hub-hero">
  <h1 class="doc-title">练习记录</h1>
  <p class="doc-sub">这里记下做错题的知识点，方便下次再练。同一知识点连对 2 次，就从待练列表里划掉。记录保存在这个浏览器里，换设备或浏览器不会跟着过去；清空浏览器数据也会删掉记录。</p>
</section>
<div class="practice-summary" data-practice-summary>
  <div class="practice-summary-count"><strong data-practice-total>0</strong><span>个知识点还要练</span></div>
  <p class="practice-summary-detail" data-practice-detail>正在读取练习记录……</p>
  <button class="btn" type="button" data-practice-clear>清空练习记录</button>
</div>
${sections}`;
  return shell({ root, title: '练习记录', content, bodyClass: 'hub course-hub practice-hub', learning: true, scripts: `<script src="${href(root, 'assets/practice-all.js')}"></script>\n<script src="${href(root, 'assets/practice-hub.js')}"></script>` });
}

function knowledgePage(lessons) {
  const root = '..';
  const map = new Map();
  lessons.forEach(l => {
    (l.knowledge || []).forEach(tag => {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag).push(l);
    });
  });
  const tags = [...map.entries()].sort((a, b) => b[1].length - a[1].length || lessons.indexOf(a[1][0]) - lessons.indexOf(b[1][0]));
  const multi = tags.filter(([, list]) => list.length > 1);
  const single = tags.filter(([, list]) => list.length === 1);
  const lessonLink = l => `<a href="${courseHref(l)}">${escapeHtml(l.title)}（${escapeHtml(learningLabel(l))}）</a>`;
  const multiHtml = multi.map(([tag, list]) => `<section class="kn-entry">
  <h2>${escapeHtml(tag)}<span class="kn-count">${list.length} 课</span></h2>
  <p>${list.map(lessonLink).join(' · ')}</p>
</section>`).join('');
  const singleHtml = single.map(([tag, list]) => `<p class="kn-single"><strong>${escapeHtml(tag)}</strong> ${lessonLink(list[0])}</p>`).join('');
  const content = `<section class="hub-hero">
  <h1 class="doc-title">知识点索引</h1>
  <p class="doc-sub">想复习哪个知识点，就从这里找一课。</p>
</section>
<div class="kn-index">
${multiHtml}
<section class="kn-entry kn-entry-single">
  <h2>其他知识点<span class="kn-count">${single.length} 条</span></h2>
  <div class="kn-single-grid">${singleHtml}</div>
</section>
</div>`;
  return shell({ root, title: '知识点索引', content, bodyClass: 'hub course-hub knowledge-hub', learning: true });
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
    <nav class="nav learning-nav" aria-label="网站导航">
      <a href="课程/知识点.html">知识点</a>
      <a href="课程/练习.html">练习记录</a>
    </nav>
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

module.exports = { rootRel, href, escapeHtml, stripTags, documentPage, semesterPage, coursePage, practicePage, knowledgePage, homePage };
