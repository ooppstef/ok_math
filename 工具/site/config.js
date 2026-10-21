const SEMESTERS = ['三上', '三下', '四上', '四下', '五上', '五下', '六上', '六下'];
const SEM_NAMES = { '三上': '三年级上期', '三下': '三年级下期', '四上': '四年级上期', '四下': '四年级下期', '五上': '五年级上期', '五下': '五年级下期', '六上': '六年级上期', '六下': '六年级下期' };
const LEARNING_GROUPS = [
  { stage: '3–4', level: '基础', title: '三、四年级 · 基础' },
  { stage: '3–4', level: '提高', title: '三、四年级 · 提高选学' },
  { stage: '3–4', level: '轻奥', title: '三、四年级 · 轻奥选学' },
  { stage: '5–6', level: '基础', title: '五、六年级 · 基础' },
  { stage: '5–6', level: '提高', title: '五、六年级 · 提高选学' },
  { stage: '5–6', level: '轻奥', title: '五、六年级 · 轻奥选学' }
];

module.exports = { SEMESTERS, SEM_NAMES, LEARNING_GROUPS };
