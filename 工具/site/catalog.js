const fs = require('fs');
const path = require('path');
const { SEMESTERS, SEM_NAMES, LEARNING_GROUPS } = require('./config');

const SEM_RE = /三上|三下|四上|四下|五上|五下|六上|六下/g;
function expandSem(text) {
  return String(text).replace(SEM_RE, m => SEM_NAMES[m]);
}
function learningLabel(lesson) {
  return LEARNING_GROUPS.find(g => g.stage === lesson.stage && g.level === lesson.level).title;
}

function lessonsIn(group, lessons) { return lessons.filter(l => l.stage === group.stage && l.level === group.level); }

function loadCatalog(ROOT) {
  const DOCS = [{ src: 'README.md', kind: 'doc', kicker: '为什么实验室' }];
  const ALL_LESSONS = [];
  const learningPlan = JSON.parse(fs.readFileSync(path.join(ROOT, '课程/学习安排.json'), 'utf8')).lessons;
  const planById = new Map(learningPlan.map((item, order) => [item.id, { ...item, order }]));
  if (planById.size !== learningPlan.length) throw new Error('学习安排含重复课号');
  for (const sem of SEMESTERS) {
    const base = path.join(ROOT, '课程', sem);
    if (!fs.existsSync(base)) continue;
    const dirs = fs.readdirSync(base, { withFileTypes: true })
      .filter(d => d.isDirectory() && /^L\d{2}-/.test(d.name))
      .map(d => d.name)
      .sort();
    for (const dir of dirs) {
      const src = `课程/${sem}/${dir}/讲授稿.md`;
      if (!fs.existsSync(path.join(ROOT, src))) continue;
      const no = dir.slice(1, 3);
      const heading = fs.readFileSync(path.join(ROOT, src), 'utf8').match(/^#\s+(.+)/m);
      const title = heading[1].replace(/^第\s*\d+\s*课[：:]\s*/, '');
      const hasVideo = fs.existsSync(path.join(base, dir, '视频.mp4'));
      const plan = planById.get(`${sem}-L${no}`);
      if (!plan || plan.path !== src || !LEARNING_GROUPS.some(g => g.stage === plan.stage && g.level === plan.level) || !plan.prerequisites?.length) {
        throw new Error(`课程缺少有效学习安排：${src}`);
      }
      ALL_LESSONS.push({ ...plan, sem, dir, no, title, src, hasVideo, hub: '课程/index.html' });
    }
  }
  if (ALL_LESSONS.length !== learningPlan.length) throw new Error('学习安排含不存在的课程');
  ALL_LESSONS.sort((a, b) => a.order - b.order);

  for (const l of ALL_LESSONS) {
    for (const [name, kind] of [['讲授稿', 'lesson'], ['动手单', 'handout'], ['挑战单', 'handout'], ['视频稿与分镜', 'storyboard']]) {
      const src = `课程/${l.sem}/${l.dir}/${name}.md`;
      if (fs.existsSync(path.join(ROOT, src))) {
        DOCS.push({ src, kind, fullWidth: kind === 'storyboard',
          kicker: `${l.sem} · ${l.title}`, courseHub: l.hub });
      }
    }
  }
  return { ROOT, DOCS, ALL_LESSONS };
}

module.exports = { loadCatalog, lessonsIn, learningLabel, expandSem };
