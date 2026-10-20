#!/usr/bin/env node
/**
 * 把 Markdown 课程稿转换成可直接阅读的 HTML。
 * 用法：node 工具/build_html.js
 */
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const ROOT = path.resolve(__dirname, '..');

const DOCS = [
  {
    src: 'README.md', kind: 'doc', kicker: 'START HERE · 使用说明',
    subtitle: '48 节课，每课一个为什么。'
  },
  {
    src: '00-方案/00-总方案.md', kind: 'doc', kicker: 'PLAN · 总方案',
    subtitle: '目标、课程结构、两年安排、家长做什么。'
  },
  {
    src: '00-方案/01-48课知识地图.md', kind: 'doc', kicker: 'MAP · 知识地图',
    subtitle: '三上到四下，48 课全表。',
    fullWidth: true
  },
  {
    src: '00-方案/06-覆盖核对.md', kind: 'doc', kicker: 'COVERAGE · 覆盖核对',
    subtitle: '三、四年级 71 个知识点，逐个找到落点。',
    fullWidth: true
  },
  {
    src: '00-方案/02-每课标准流程.md', kind: 'doc', kicker: 'METHOD · 上课流程',
    subtitle: '70 分钟怎么跑，话怎么说，孩子卡住时怎么接。'
  },
  {
    src: '00-方案/03-B卷题型对照表.md', kind: 'doc', kicker: 'B-PAPER · 对照表',
    subtitle: '40+ 题型对应课次。',
    fullWidth: true
  },
  {
    src: '00-方案/04-视频生产说明.md', kind: 'doc', kicker: 'VIDEO · 生产线',
    subtitle: '一份 JSON，生成一集。改旁白、改数字、改时长，重新跑一条命令。'
  },
  {
    src: '00-方案/05-入学诊断.md', kind: 'doc', kicker: 'DIAGNOSTIC · 入学诊断',
    subtitle: '10 分钟，8 个问题，看孩子现在在哪。只记录原话，不打分。'
  },

  {
    src: '课程/三上/L01-满十进一/讲授稿.md', kind: 'lesson', kicker: 'LESSON 01 · 三上',
    subtitle: '为什么数到十，就要换一根柱子？'
  },
  {
    src: '课程/三上/L01-满十进一/视频稿与分镜.md', kind: 'storyboard', fullWidth: true, kicker: 'STORYBOARD · 第 1 课',
    subtitle: '分镜、旁白、暂停点。',
    facts: { '状态': '成片已完成 · 2 分 54 秒', '本课要点': '数是“打包”出来的；位置决定同一个数字代表多大。' }
  },
  {
    src: '课程/三上/L01-满十进一/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 第 1 课',
    subtitle: '打印出来，直接做。'
  },
  {
    src: '课程/三上/L02-竖式的秘密/讲授稿.md', kind: 'lesson', kicker: 'LESSON 02 · 三上',
    subtitle: '为什么竖式要把相同数位对齐？'
  },
  {
    src: '课程/三上/L02-竖式的秘密/视频稿与分镜.md', kind: 'storyboard', fullWidth: true, kicker: 'STORYBOARD · 第 2 课',
    subtitle: '分镜、旁白、暂停点。',
    facts: { '状态': '分镜完成，视频待渲染', '本课要点': '加减法只在同一种单位之间进行；对齐的是单位。' }
  },
  {
    src: '课程/三上/L02-竖式的秘密/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 第 2 课',
    subtitle: '打印出来，直接做。'
  },
  {
    src: '课程/三上/L03-乘法的形状/讲授稿.md', kind: 'lesson', kicker: 'LESSON 03 · 三上',
    subtitle: '为什么 3×4 和 4×3 一样多？'
  },
  {
    src: '课程/三上/L03-乘法的形状/视频稿与分镜.md', kind: 'storyboard', fullWidth: true, kicker: 'STORYBOARD · 第 3 课',
    subtitle: '分镜、旁白、暂停点。',
    facts: { '状态': '成片已完成 · 1 分 34 秒', '本课要点': '乘法是“每份一样多的阵列”；交换行列，总数不变。' }
  },
  {
    src: '课程/三上/L03-乘法的形状/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 第 3 课',
    subtitle: '打印出来，直接做。'
  },
  {
    src: '课程/三上/L04-除法的两张脸/讲授稿.md', kind: 'lesson', kicker: 'LESSON 04 · 三上',
    subtitle: '12÷3 到底在问什么？'
  },
  {
    src: '课程/三上/L04-除法的两张脸/视频稿与分镜.md', kind: 'storyboard', fullWidth: true, kicker: 'STORYBOARD · 第 4 课',
    subtitle: '分镜、旁白、暂停点。',
    facts: { '状态': '分镜完成，视频待渲染', '本课要点': '“平均分给 3 人”和“每 3 个装一袋”，是同一个除法的两种现实原型。' }
  },
  {
    src: '课程/三上/L04-除法的两张脸/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 第 4 课',
    subtitle: '打印出来，直接做。'
  }
];

const LESSONS = [
  { no: '01', dir: 'L01-满十进一', title: '满十进一', q: '为什么数到十，就要换一根柱子？', badge: '成片 2:54', ready: true },
  { no: '02', dir: 'L02-竖式的秘密', title: '竖式的秘密', q: '为什么竖式要把相同数位对齐？', badge: '分镜完成', ready: true },
  { no: '03', dir: 'L03-乘法的形状', title: '乘法的形状', q: '为什么 3×4 和 4×3 一样多？', badge: '成片 1:34', ready: true },
  { no: '04', dir: 'L04-除法的两张脸', title: '除法的两张脸', q: '12÷3 到底在问什么？', badge: '分镜完成', ready: true },
  { no: '05', dir: '', title: '倍不是“多”', q: '3 倍为什么不是多 3？', badge: '待写稿', ready: false },
  { no: '06', dir: '', title: '0 的隐身术', q: '为什么 0 不能随便去掉？', badge: '待写稿', ready: false },
  { no: '07', dir: '', title: '估算的边界', q: '为什么“差不多”也是一种本事？', badge: '待写稿', ready: false },
  { no: '08', dir: '', title: '单位是人的尺', q: '毫米、分米、千米为什么这么怪？', badge: '待写稿', ready: false },
  { no: '09', dir: '', title: '周长的边界', q: '为什么周长不是“边加起来”这么简单？', badge: '待写稿', ready: false },
  { no: '10', dir: '', title: '分数的诞生', q: '为什么必须“平均分”？', badge: '待写稿', ready: false },
  { no: '11', dir: '', title: '集合圈', q: '为什么数数会“数重”？', badge: '待写稿', ready: false },
  { no: '12', dir: '', title: '时间的刻度', q: '为什么一天是 24 小时？', badge: '待写稿', ready: false }
];

function rootRel(outRel) {
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
function parseMeta(md) {
  const out = {};
  md.split('\n').forEach(line => {
    let m = line.match(/^\s*>?\s*\*\*(.+?)\*\*\s*[：:]\s*(.*)$/);
    if (!m) m = line.match(/^\s*>\s*([^：:]{1,10})\s*[：:]\s*(.*)$/);
    if (m) out[m[1].replace(/\s+/g, '')] = m[2].trim();
  });
  return out;
}

function topbar(root) {
  return `<header class="topbar">
  <div class="inner">
    <a class="brand" href="${href(root, 'index.html')}"><span class="mark">M</span><span>为什么实验室 · 小学数学</span></a>
    <nav class="nav">
      <a href="${href(root, '00-方案/00-总方案.html')}">总方案</a>
      <a href="${href(root, '00-方案/01-48课知识地图.html')}">48 课地图</a>
      <a href="${href(root, '00-方案/03-B卷题型对照表.html')}">B 卷对照</a>
      <a href="${href(root, '课程/三上/index.html')}">课程</a>
      <a href="${href(root, 'index.html')}">首页</a>
    </nav>
  </div>
  <div class="progress"><span></span></div>
</header>`;
}

function footer(root) {
  return `<footer class="doc-footer">
  <span>为什么实验室 · 小学数学 · 三上 → 四下</span>
  <span><a href="${href(root, 'index.html')}">返回总览</a> · <a href="${href(root, 'README.html')}">使用说明</a></span>
</footer>
<div class="backtop"><a href="#top">↑ 回到顶部</a></div>`;
}

function shell({ root, title, kicker, subtitle, content, bodyClass }) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)} · 为什么实验室</title>
<link rel="stylesheet" href="${href(root, 'assets/doc.css')}">
</head>
<body class="doc-page ${bodyClass || ''}" id="top">
${topbar(root)}
<main class="page">
${content}
${footer(root)}
</main>
<script src="${href(root, 'assets/doc.js')}"></script>
</body>
</html>`;
}

function renderDoc(doc) {
  const abs = path.join(ROOT, doc.src);
  const md = fs.readFileSync(abs, 'utf8');
  const dir = path.dirname(doc.src);
  const out = doc.src.replace(/\.md$/, '.html');
  const root = rootRel(out);

  let body = marked.parse(md, { gfm: true, breaks: false });
  const h1 = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const title = doc.title || (h1 ? stripTags(h1[1]) : path.basename(doc.src, '.md'));
  if (h1) body = body.replace(h1[0], '');

  const meta = Object.assign({}, parseMeta(md), doc.facts || {});

  // 课程类页面：去掉顶部那张“课程信息”引用块，已在 facts 里展示
  if (doc.kind === 'lesson' || doc.kind === 'storyboard' || doc.kind === 'handout') {
    const bq = body.indexOf('<blockquote>');
    const h2 = body.indexOf('<h2');
    if (bq >= 0 && (h2 < 0 || bq < h2)) {
      body = body.replace(/<blockquote>[\s\S]*?<\/blockquote>\s*/, '');
    }
  }

  if (doc.kind === 'lesson' || doc.kind === 'handout') {
    body = body.replace(/^\s*(?:<p><strong>(?:大问题|本课要点|一句话原理|核心一句话|时长|材料|状态|今天的大问题)<\/strong>[：:][\s\S]*?<\/p>\s*)+/, '');
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

  // 课程信息
  const order = ['大问题', '今天的大问题', '本课要点', '一句话原理', '核心一句话', '时长', '材料', '状态'];
  const fullKeys = new Set(['大问题', '今天的大问题', '本课要点', '一句话原理', '核心一句话', '材料']);
  const seen = new Set();
  const facts = [];
  order.forEach(k => {
    if (!meta[k] || seen.has(k)) return;
    if (k === '大问题' && doc.kind === 'lesson') return;
    seen.add(k);
    const isFull = fullKeys.has(k) || meta[k].length > 58;
    facts.push(`<div class="fact${isFull ? ' full' : ''}"><span>${escapeHtml(k)}</span><strong>${escapeHtml(meta[k])}</strong></div>`);
    if (k === '时长' && doc.kind === 'lesson') {
      facts.push(`<div class="fact"><span>建议</span><strong>每周 1 课，允许一节课只做一个实验</strong></div>`);
    }
    if (k === '状态' && doc.kind === 'storyboard') {
      facts.push(`<div class="fact"><span>用途</span><strong>给家长和剪辑参考</strong></div>`);
    }
  });
  if (!facts.length && doc.kind === 'handout') {
    facts.push(`<div class="fact full"><span>建议</span><strong>A4 打印，先做后讲</strong></div>`);
  }

  // 视频
  const videoPath = path.join(ROOT, dir, '视频.mp4');
  const hasVideo = (doc.kind === 'lesson' || doc.kind === 'storyboard') && fs.existsSync(videoPath);
  let video = '';
  if (hasVideo) {
    const poster = fs.existsSync(path.join(ROOT, dir, 'poster.jpg')) ? 'poster.jpg' : '';
    video = `<div class="video-hero">
      <div class="video-frame">
        <video id="lessonVideo" preload="metadata" playsinline ${poster ? `poster="${poster}"` : ''}>
          <source src="视频.mp4" type="video/mp4">
          <track kind="subtitles" src="视频.srt" srclang="zh" label="中文">
        </video>
        <button class="video-play" data-target="lessonVideo" type="button">
          <span class="pill"><span class="circle">▶</span><span class="label">播放本课视频</span></span>
        </button>
      </div>
      <div class="cap"><span>成片 · 1280×720 · 中文配音</span><a href="视频.srt">下载字幕</a></div>
    </div>`;
  }

  let mediaPlaceholder = '';
  if (doc.kind === 'lesson' && !hasVideo && fs.existsSync(path.join(ROOT, dir, '视频稿与分镜.html'))) {
    mediaPlaceholder = `<div class="media-placeholder">
      <div class="ph-kicker">VIDEO · 待渲染</div>
      <h3>先看分镜稿</h3>
      <p>分镜和旁白已经写好，可以先按稿子讲一遍。</p>
      <a class="btn" href="视频稿与分镜.html">打开分镜稿</a>
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
  if (doc.kind === 'lesson') {
    if (hasVideo && fs.existsSync(path.join(ROOT, dir, '视频稿与分镜.html'))) actions.push('<a class="btn" href="视频稿与分镜.html">视频分镜</a>');
    if (fs.existsSync(path.join(ROOT, dir, '动手单.html'))) actions.push('<a class="btn" href="动手单.html">动手单</a>');
  }
  if (doc.kind === 'storyboard') {
    if (fs.existsSync(path.join(ROOT, dir, '讲授稿.html'))) actions.push('<a class="btn" href="讲授稿.html">讲授稿</a>');
    if (fs.existsSync(path.join(ROOT, dir, '动手单.html'))) actions.push('<a class="btn" href="动手单.html">动手单</a>');
  }
  if (doc.kind === 'handout') {
    if (fs.existsSync(path.join(ROOT, dir, '讲授稿.html'))) actions.push('<a class="btn" href="讲授稿.html">讲授稿</a>');
    if (fs.existsSync(path.join(ROOT, dir, '视频稿与分镜.html'))) actions.push('<a class="btn" href="视频稿与分镜.html">视频分镜</a>');
  }
  actions.push(`<a class="btn" href="${href(root, '课程/三上/index.html')}">课程目录</a>`);

  const tocHtml = toc.length && !doc.fullWidth
    ? `<aside class="toc">
        <div class="toc-title">本页目录</div>
        ${toc.map(t => `<a class="lvl${t.lvl}" href="#${t.id}">${t.text}</a>`).join('')}
      </aside>`
    : '';

  const heroCopy = `<div class="hero-copy">
    <div class="kicker">${escapeHtml(doc.kicker || '为什么实验室')}</div>
    <h1 class="doc-title">${escapeHtml(title)}</h1>
    ${doc.subtitle ? `<p class="doc-sub">${escapeHtml(doc.subtitle)}</p>` : ''}
    ${facts.length ? `<div class="facts">${facts.join('')}</div>` : ''}
    <div class="actions">${actions.join('')}</div>
  </div>`;
  const heroMedia = video || mediaPlaceholder;
  const hero = heroMedia
    ? `<section class="doc-hero"><div class="hero-grid">${heroCopy}<div class="hero-media">${heroMedia}</div></div></section>`
    : `<section class="doc-hero">${heroCopy}</section>`;
  const content = `${hero}
${note}
<div class="doc-layout${doc.fullWidth || !tocHtml ? ' no-toc' : ''}">
  <article class="article">
${body}
  </article>
  ${tocHtml}
</div>`;

  fs.mkdirSync(path.dirname(path.join(ROOT, out)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, out), shell({
    root, title, kicker: doc.kicker, subtitle: doc.subtitle,
    content, bodyClass: doc.kind || 'doc'
  }));
  console.log('✓', out);
}

function renderDocsHub() {
  const out = '00-方案/index.html';
  const root = rootRel(out);
  const cards = [
    ['01', '总方案', '课程怎么安排', '目标、课程结构、两年安排、家长做什么。', '00-总方案.html'],
    ['02', '48 课知识地图', '每一课，一个“为什么”', '原理内核、教材锚点、B 卷接口、动手实验、轻奥延伸。', '01-48课知识地图.html'],
    ['03', '覆盖核对', '71 个知识点都有落点', '对照 cn-math-taxonomy 的三、四年级清单。', '06-覆盖核对.html'],
    ['04', '每课标准流程', '70 分钟怎么跑', '开场、实验、视频、四个问题、三层挑战、复述。', '02-每课标准流程.html'],
    ['05', 'B 卷题型对照表', 'B 卷题对应课次', '40+ 题型对应课次。', '03-B卷题型对照表.html'],
    ['06', '视频生产说明', '一份 JSON，生成一集', '改旁白、改数字、改时长，重新跑一条命令。', '04-视频生产说明.html'],
    ['07', '入学诊断', '10 分钟，看孩子现在在哪', '8 个问题，只记录原话，不打分。', '05-入学诊断.html']
  ];
  const content = `<section class="hub-hero">
  <div class="hub-hero-grid">
    <div>
      <div class="kicker">DOCS · 方案与工具</div>
      <h1 class="doc-title">先读哪一份？</h1>
      <p class="doc-sub">先读总方案和 48 课地图；要上课，翻每课流程；要看孩子现在的位置，做入学诊断。</p>
    </div>
    <aside class="hub-side">
      <div class="side-label">推荐阅读顺序</div>
      <ol>
        <li>总方案：目标与两年安排</li>
        <li>48 课地图：两年怎么走</li>
        <li>覆盖核对：71 个知识点</li>
        <li>每课流程：一节课怎么跑</li>
        <li>入学诊断：孩子现在在哪</li>
        <li>第 1 课：本周就能开始</li>
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
  const html = shell({ root, title: '方案与工具', kicker: 'DOCS', subtitle: '', content, bodyClass: 'hub' });
  fs.writeFileSync(path.join(ROOT, out), html);
  console.log('✓', out);
}

function renderCourseHub() {
  const out = '课程/三上/index.html';
  const root = rootRel(out);
  const ready = LESSONS.filter(l => l.ready);
  const pending = LESSONS.filter(l => !l.ready);
  const row = l => l.ready
    ? `<a class="lesson-row" href="${l.dir}/讲授稿.html">
        <div class="no">${l.no}</div>
        <div><h3>${l.title} <span class="badge ${l.badge.includes('成片') ? 'red' : 'gold'}">${l.badge}</span></h3><p>${l.q}</p></div>
        <div class="meta">讲授稿 · 动手单 · 分镜 →</div>
      </a>`
    : `<div class="lesson-row">
        <div class="no">${l.no}</div>
        <div><h3>${l.title} <span class="badge">${l.badge}</span></h3><p>${l.q}</p></div>
        <div class="meta">已在地图，待写稿</div>
      </div>`;

  const content = `<section class="hub-hero">
  <div class="hub-hero-grid">
    <div>
      <div class="kicker">COURSE · 三上</div>
      <h1 class="doc-title">三年级上册 · 12 课</h1>
      <p class="doc-sub">第一单元四课已写完：位值、竖式、乘法、除法。后面 8 课已在地图里，按批次继续。</p>
      <div class="actions">
        <a class="btn primary" href="../../课程/三上/L01-满十进一/讲授稿.html">从第 1 课开始</a>
        <a class="btn" href="../../00-方案/01-48课知识地图.html">看完整地图</a>
        <a class="btn" href="../../00-方案/05-入学诊断.html">先做诊断</a>
      </div>
    </div>
    <aside class="hub-side">
      <div class="side-label">第一单元的关系</div>
      <div class="flow">位值 <span>→</span> 竖式 <span>→</span> 乘法 <span>→</span> 除法</div>
      <p>四课连起来，是运算的基础。先懂单位，再懂对齐；先懂阵列，再懂平均分。</p>
    </aside>
  </div>
</section>
<h2 style="font-family:'Songti SC',serif;font-size:26px;margin:38px 0 6px">第一单元 · 运算基础</h2>
<p style="font-size:13px;color:var(--muted);margin:0 0 14px">四课连起来，是运算的基础。</p>
${ready.map(row).join('')}
<h2 style="font-family:'Songti SC',serif;font-size:26px;margin:44px 0 6px">本学期后续</h2>
<p style="font-size:13px;color:var(--muted);margin:0 0 14px">标题和原理已定，稿子与视频按批次生产。</p>
${pending.map(row).join('')}`;
  const html = shell({ root, title: '三上 · 12 课', kicker: 'COURSE', subtitle: '', content, bodyClass: 'hub' });
  fs.mkdirSync(path.join(ROOT, '课程/三上'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, out), html);
  console.log('✓', out);
}

// 先渲染所有文档，最后生成 hub
DOCS.forEach(renderDoc);
renderDocsHub();
renderCourseHub();

// 首页里的 .md 链接统一换成 .html
const indexFile = path.join(ROOT, 'index.html');
if (fs.existsSync(indexFile)) {
  let s = fs.readFileSync(indexFile, 'utf8');
  s = s.replace(/href="([^"]+)\.md(#[^"]*)?"/g, 'href="$1.html$2"');
  fs.writeFileSync(indexFile, s);
  console.log('✓ index.html links → .html');
}
