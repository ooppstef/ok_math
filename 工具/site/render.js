const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { rootRel, href, escapeHtml, stripTags, documentPage } = require('./templates');
const { learningLabel } = require('./catalog');

function renderDoc(doc, { ROOT, ALL_LESSONS }) {
  const abs = path.join(ROOT, doc.src);
  const md = fs.readFileSync(abs, 'utf8');
  const dir = path.dirname(doc.src);
  const out = doc.src.replace(/\.md$/, '.html');
  const root = rootRel(out, ROOT);

  let body = marked.parse(md, { gfm: true, breaks: false });
  const h1 = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const sourceTitle = doc.title || (h1 ? stripTags(h1[1]) : path.basename(doc.src, '.md'));
  const title = doc.kind === 'lesson' ? sourceTitle.replace(/^第\s*\d+\s*课[：:]\s*/, '') : sourceTitle;
  if (h1) body = body.replace(h1[0], '');

  // 只去掉旧制作信息；学习顺序、材料和前置提示是正文的一部分。
  if (doc.kind === 'lesson' || doc.kind === 'storyboard' || doc.kind === 'handout') {
    const bq = body.indexOf('<blockquote>');
    const h2 = body.indexOf('<h2');
    if (bq >= 0 && (h2 < 0 || bq < h2) && /(?:时长|状态|制作状态)[：:]/.test(body.match(/<blockquote>[\s\S]*?<\/blockquote>/)[0])) {
      body = body.replace(/<blockquote>[\s\S]*?<\/blockquote>\s*/, '');
    }
  }

  if (doc.kind === 'lesson' || doc.kind === 'handout') {
    body = body.replace(/^\s*(?:<p><strong>(?:大问题|本课要点|一句话原理|核心一句话|时长|状态|今天的大问题|对应课)<\/strong>[：:][\s\S]*?<\/p>\s*)+/, '');
  }
  if (doc.kind === 'handout') {
    body = body.replace(/<p><strong>今天的大问题<\/strong>[：:][\s\S]*?<\/p>\s*/, '');
  }
  if (doc.kind === 'storyboard') {
    body = body.replace(/^\s*<ul>[\s\S]*?<\/ul>\s*/, '');
  }

  // 表格包一层，宽表可横向滚动
  body = body.replace(/<table>([\s\S]*?)<\/table>/g, (m, inner) => {
    const cols = (inner.match(/<th[ >]/g) || []).length;
    const isNum = /<th[^>]*>\s*#\s*<\/th>/.test(inner);
    return `<div class="table-wrap${cols >= 6 ? ' wide' : ''}${isNum ? ' num-table' : ''}"><table>${inner}</table></div>`;
  });

  // 标题 id + 目录
  const toc = [];
  let n = 0;
  body = body.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (m, lvl, inner) => {
    n += 1;
    const id = 'sec-' + n;
    toc.push({ lvl, id, text: stripTags(inner) });
    return `<h${lvl} id="${id}">${inner}</h${lvl}>`;
  });

  // 站内 .md 链接换成 .html
  body = body.replace(/href="([^"]+)\.md(#[^"]*)?"/g, 'href="$1.html$2"');
  // 解码中文路径，避免 href 里出现一长串 %E5...
  body = body.replace(/href="((?!https?:)[^"]+)"/g, (m, u) => {
    let d = u;
    try { d = decodeURIComponent(u); } catch (e) {}
    return `href="${d}"`;
  });
  // 外链新窗口
  body = body.replace(/<a href="(https?:[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener"');
  // 课程图可单独打开，手机上查看细小的刻度与标注。
  if (doc.kind === 'lesson') {
    body = body.replace(/<img src="([^"]+\.svg)" alt="([^"]*)"\s*\/?\s*>/g,
      (img, src, alt) => `<a class="lesson-figure" href="${src}" target="_blank" rel="noopener" aria-label="放大查看：${alt}">${img}</a>`);
  }

  // 视频
  const videoPath = path.join(ROOT, dir, '视频.mp4');
  const lesson = ALL_LESSONS.find(l => path.dirname(l.src) === dir);
  const lessonById = new Map(ALL_LESSONS.map(l => [l.id, l]));
  const prereqLinks = (lesson?.prerequisiteLessons || []).map(id => {
    const p = lessonById.get(id);
    if (!p) return '';
    return `<a href="${href(root, p.src.replace(/\.md$/, '.html'))}">${escapeHtml(p.title)}（${escapeHtml(learningLabel(p))}）</a>`;
  }).filter(Boolean).join('、');
  const hasVideo = (doc.kind === 'lesson' || doc.kind === 'storyboard') && fs.existsSync(videoPath);
  let video = '';
  if (hasVideo) {
    const poster = fs.existsSync(path.join(ROOT, dir, 'poster.jpg')) ? 'poster.jpg' : '';
    video = `<div class="video-hero">
${lesson?.video_note ? `      <p class="video-scope">${escapeHtml(lesson.video_note)}</p>\n` : ''}      <div class="video-frame">
        <video id="lessonVideo" preload="metadata" playsinline ${poster ? `poster="${poster}"` : ''}>
          <source src="视频.mp4" type="video/mp4">
          ${fs.existsSync(path.join(ROOT, dir, '视频.vtt')) ? '<track kind="subtitles" src="视频.vtt" srclang="zh" label="中文">' : ''}
        </video>
        <button class="video-play" data-target="lessonVideo" type="button">
          <span class="pill"><span class="circle">▶</span><span class="label">播放本课视频</span></span>
        </button>
      </div>
    </div>`;
  }

  let note = '';
  if (doc.kind === 'storyboard' && !hasVideo) {
    note = `<div class="note">视频待渲染。下面是分镜和旁白，可以先按稿子讲一遍。</div>`;
  }

  // 操作按钮
  const actions = [];
  if (doc.kind === 'handout') {
    actions.push('<button class="btn primary print-btn" type="button">打印本页</button>');
  }
  const selfName = path.basename(doc.src);
  if (doc.kind === 'lesson') {
    if (fs.existsSync(path.join(ROOT, dir, '动手单.md'))) actions.push('<a class="btn" href="动手单.html">动手练习</a>');
    if (fs.existsSync(path.join(ROOT, dir, '挑战单.md'))) actions.push('<a class="btn" href="挑战单.html">挑战单</a>');
    actions.push('<a class="btn" href="#practice-heading">换一组练习</a>');
  }
  if (doc.kind === 'storyboard') {
    if (fs.existsSync(path.join(ROOT, dir, '讲授稿.md'))) actions.push('<a class="btn" href="讲授稿.html">课程讲解</a>');
    if (fs.existsSync(path.join(ROOT, dir, '动手单.md'))) actions.push('<a class="btn" href="动手单.html">动手单</a>');
  }
  if (doc.kind === 'handout') {
    if (fs.existsSync(path.join(ROOT, dir, '讲授稿.md'))) actions.push('<a class="btn" href="讲授稿.html">课程讲解</a>');
    if (selfName !== '动手单.md' && fs.existsSync(path.join(ROOT, dir, '动手单.md'))) actions.push('<a class="btn" href="动手单.html">动手单</a>');
    if (selfName !== '挑战单.md' && fs.existsSync(path.join(ROOT, dir, '挑战单.md'))) actions.push('<a class="btn" href="挑战单.html">挑战单</a>');
  }
  const learning = doc.kind === 'lesson' || doc.kind === 'handout';
  const courseHub = learning ? '课程/index.html' : (doc.courseHub || '课程/index.html');
  actions.push(`<a class="btn" href="${href(root, courseHub)}">课程目录</a>`);

  const practice = doc.kind === 'lesson' && lesson ? `<section class="practice" data-practice="${lesson.id}" aria-labelledby="practice-heading">
  <div class="practice-head">
    <div class="practice-kicker">换一组练习</div>
    <h2 id="practice-heading">这一课，再练一练</h2>
    <p class="practice-intro">每次 5 题，答完一题就能看解析。做错题的知识点会记在这个浏览器里，留着下次练。同一知识点连对 2 次，就从待练列表里划掉。</p>
    <p class="practice-weak" data-practice-weak>正在读取本课记录……</p>
  </div>
  <div class="practice-body" data-practice-body></div>
</section>` : '';
  const scripts = doc.kind === 'lesson' ? `<script src="${href(root, 'assets/practice-all.js')}"></script>` : '';

  const html = documentPage({ doc, root, title, body, lesson, video, note, actions, toc, practice, prereqLinks, scripts });
  fs.mkdirSync(path.dirname(path.join(ROOT, out)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, out), html);
  console.log('✓', out);
}

module.exports = { renderDoc };
