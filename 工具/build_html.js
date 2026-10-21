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
    subtitle: '三到六年级，96 节课，每课一个为什么。'
  },
  {
    src: '00-方案/00-总方案.md', kind: 'doc', kicker: 'PLAN · 总方案',
    subtitle: '目标、课程结构、两年安排、家长做什么。'
  },
  {
    src: '00-方案/01-48课知识地图.md', kind: 'doc', kicker: 'MAP · 三、四年级',
    subtitle: '三上到四下，48 课全表。',
    fullWidth: true
  },
  {
    src: '00-方案/08-五六年级48课地图.md', kind: 'doc', kicker: 'MAP · 五、六年级',
    subtitle: '五上到六下，48 课全表。',
    fullWidth: true
  },
  {
    src: '00-方案/09-96课总图.md', kind: 'doc', kicker: 'OVERVIEW · 96 课总图',
    subtitle: '八个学期，一条线看完整。',
    fullWidth: true
  },
  {
    src: '00-方案/10-五六年级覆盖核对.md', kind: 'doc', kicker: 'COVERAGE · 五、六年级',
    subtitle: '85 个知识点，逐个找到落点。',
    fullWidth: true
  },
  {
    src: '00-方案/11-五六年级B卷题型表.md', kind: 'doc', kicker: 'B-PAPER · 五、六年级',
    subtitle: '五、六年级 B 卷题型对应课次。',
    fullWidth: true
  },
  {
    src: '00-方案/12-课程审查清单.md', kind: 'doc', kicker: 'REVIEW · 审查清单',
    subtitle: '人工 review 时看什么。',
    fullWidth: true
  },
  {
    src: '00-方案/13-研究依据.md', kind: 'doc', kicker: 'RESEARCH · 研究依据',
    subtitle: '用了哪些材料，做了什么取舍。',
    fullWidth: true
  },
  {
    src: '00-方案/19-教材版本映射.md', kind: 'doc', kicker: 'MAPPING · 教材版本',
    subtitle: '先确认学校教材，再把单元映射到课次。',
    fullWidth: true
  },
  {
    src: '00-方案/21-课程修复与循环复验.md', kind: 'doc', kicker: 'REVIEW · 修复与复验',
    subtitle: '问题处理位置、循环审查记录与验证边界。',
    fullWidth: true
  },
  {
    src: '00-方案/22-成都教材对齐与课程扩展研究.md', kind: 'doc', kicker: 'RESEARCH · 教材对齐',
    subtitle: '成都北师大版新教材、课量缺口、视频优先级与知识点补齐方案。',
    fullWidth: true
  },
  {
    src: '00-方案/06-覆盖核对.md', kind: 'doc', kicker: 'COVERAGE · 三、四年级',
    subtitle: '三、四年级 71 个知识点，逐个找到落点。',
    fullWidth: true
  },
  {
    src: '00-方案/02-每课标准流程.md', kind: 'doc', kicker: 'METHOD · 上课流程',
    subtitle: '75 分钟怎么跑，话怎么说，孩子卡住时怎么接。'
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
    subtitle: '十个一怎样变成一个十？'
  },
  {
    src: '课程/三上/L01-满十进一/视频稿与分镜.md', kind: 'storyboard', fullWidth: true, kicker: 'STORYBOARD · 第 1 课',
    subtitle: '分镜、旁白、暂停点。',
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
  },
  {
    src: '课程/三上/L04-除法的两张脸/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 第 4 课',
    subtitle: '打印出来，直接做。'
  },

  {
    src: '课程/五上/L01-小数乘法/讲授稿.md', kind: 'lesson', kicker: 'LESSON 01 · 五上',
    subtitle: '0.3×0.4 为什么是 0.12？',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L01-小数乘法/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五上 01',
    subtitle: '方格纸涂一涂，再算。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L01-小数乘法/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五上 01',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L02-小数除法/讲授稿.md', kind: 'lesson', kicker: 'LESSON 02 · 五上',
    subtitle: '1.2÷0.3 为什么可以写成 12÷3？',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L02-小数除法/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五上 02',
    subtitle: '量纸条，换单位，再算。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L02-小数除法/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五上 02',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L03-循环小数/讲授稿.md', kind: 'lesson', kicker: 'LESSON 03 · 五上',
    subtitle: '为什么余数一重复，商就重复？',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L03-循环小数/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五上 03',
    subtitle: '列竖式，圈余数。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L03-循环小数/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五上 03',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L04-数对/讲授稿.md', kind: 'lesson', kicker: 'LESSON 04 · 五上',
    subtitle: '(3,4) 和 (4,3) 为什么不是同一个点？',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L04-数对/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五上 04',
    subtitle: '画格子，贴两个点。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L04-数对/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五上 04',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L05-可能性/讲授稿.md', kind: 'lesson', kicker: 'LESSON 05 · 五上',
    subtitle: '可能性大，就一定会发生吗？',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L05-可能性/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五上 05',
    subtitle: '摸 20 次，记录并放回。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L05-可能性/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五上 05',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L06-字母表示数/讲授稿.md', kind: 'lesson', kicker: 'LESSON 06 · 五上',
    subtitle: '正方形的个数变了，怎样用一个式子表示？',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L06-字母表示数/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五上 06',
    subtitle: '摆正方形，找 3n+1。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L06-字母表示数/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五上 06',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L07-等式与方程/讲授稿.md', kind: 'lesson', kicker: 'LESSON 07 · 五上',
    subtitle: '天平为什么能帮你解方程？',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L07-等式与方程/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五上 07',
    subtitle: '用天平解 x+3=8。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L07-等式与方程/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五上 07',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L08-列方程/讲授稿.md', kind: 'lesson', kicker: 'LESSON 08 · 五上',
    subtitle: '方程是“顺着说”还是“倒着走”？',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L08-列方程/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五上 08',
    subtitle: '画线段图，列方程。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L08-列方程/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五上 08',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L09-平行四边形面积/讲授稿.md', kind: 'lesson', kicker: 'LESSON 09 · 五上',
    subtitle: '为什么是底×高？',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L09-平行四边形面积/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五上 09',
    subtitle: '剪一剪，拼成长方形。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L09-平行四边形面积/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五上 09',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L10-三角形面积/讲授稿.md', kind: 'lesson', kicker: 'LESSON 10 · 五上',
    subtitle: '为什么要除以 2？',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L10-三角形面积/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五上 10',
    subtitle: '两个三角形拼平行四边形。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L10-三角形面积/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五上 10',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L11-梯形面积/讲授稿.md', kind: 'lesson', kicker: 'LESSON 11 · 五上',
    subtitle: '为什么是（上底+下底）×高÷2？',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L11-梯形面积/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五上 11',
    subtitle: '两个梯形拼平行四边形。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L11-梯形面积/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五上 11',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L12-植树/讲授稿.md', kind: 'lesson', kicker: 'LESSON 12 · 五上',
    subtitle: '那个“1”到底加在哪？',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L12-植树/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五上 12',
    subtitle: '摆一摆，分段和端点。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五上/L12-植树/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五上 12',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五上/index.html'
  },
  {
    src: '课程/五下/L01-因数与倍数/讲授稿.md', kind: 'lesson', kicker: 'LESSON 01 · 五下',
    subtitle: '为什么质数只能排成一行？',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L01-因数与倍数/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五下 01',
    subtitle: '摆长方形，找因数和倍数。',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L01-因数与倍数/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五下 01',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L02-2-5-3的倍数/讲授稿.md', kind: 'lesson', kicker: 'LESSON 02 · 五下',
    subtitle: '为什么有的看个位，有的看数字和？',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L02-2-5-3的倍数/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五下 02',
    subtitle: '拆数位，找倍数特征。',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L02-2-5-3的倍数/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五下 02',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L03-公因数与公倍数/讲授稿.md', kind: 'lesson', kicker: 'LESSON 03 · 五下',
    subtitle: '共同的积木与共同的节奏，怎么找？',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L03-公因数与公倍数/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五下 03',
    subtitle: '铺正方形，找共同节奏。',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L03-公因数与公倍数/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五下 03',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L04-观察物体/讲授稿.md', kind: 'lesson', kicker: 'LESSON 04 · 五下',
    subtitle: '为什么一个方向不够？',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L04-观察物体/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五下 04',
    subtitle: '搭 T 形，画三视图。',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L04-观察物体/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五下 04',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L05-旋转/讲授稿.md', kind: 'lesson', kicker: 'LESSON 05 · 五下',
    subtitle: '转完之后，什么变了，什么没变？',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L05-旋转/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五下 05',
    subtitle: '绕点 O 转 90°。',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L05-旋转/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五下 05',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L06-长方体与正方体/讲授稿.md', kind: 'lesson', kicker: 'LESSON 06 · 五下',
    subtitle: '6 个面、12 条棱、8 个顶点怎么数？',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L06-长方体与正方体/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五下 06',
    subtitle: '吸管搭框架，数面棱顶点。',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L06-长方体与正方体/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五下 06',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L07-表面积/讲授稿.md', kind: 'lesson', kicker: 'LESSON 07 · 五下',
    subtitle: '为什么要先“展开”？',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L07-表面积/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五下 07',
    subtitle: '剪开纸盒，算六个面。',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L07-表面积/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五下 07',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L08-体积与容积/讲授稿.md', kind: 'lesson', kicker: 'LESSON 08 · 五下',
    subtitle: '体积是装了多少个单位立方体？',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L08-体积与容积/动手单.md', kind: 'handout', kicker: 'WORKSHEET · 五下 08',
    subtitle: '摆单位立方体，量水位。',
    courseHub: '课程/五下/index.html'
  },
  {
    src: '课程/五下/L08-体积与容积/挑战单.md', kind: 'handout', kicker: 'CHALLENGE · 五下 08',
    subtitle: '分三组练习，做完可以核对答案和解法。',
    courseHub: '课程/五下/index.html'
  }
];

const SEMESTERS = ['三上', '三下', '四上', '四下', '五上', '五下', '六上', '六下'];
const SEM_NAMES = { '三上': '三年级上期', '三下': '三年级下期', '四上': '四年级上期', '四下': '四年级下期', '五上': '五年级上期', '五下': '五年级下期', '六上': '六年级上期', '六下': '六年级下期' };
const SEM_RE = /三上|三下|四上|四下|五上|五下|六上|六下/g;
function expandSem(text) {
  return String(text).replace(SEM_RE, m => SEM_NAMES[m]);
}
const ALL_LESSONS = [];

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
    const title = dir.replace(/^L\d{2}-/, '');
    ALL_LESSONS.push({ sem, dir, no, title, src, hub: `课程/${sem}/index.html` });
  }
}

const knownDocs = new Set(DOCS.map(d => d.src));
for (const l of ALL_LESSONS) {
  if (knownDocs.has(l.src)) continue;
  DOCS.push({
    src: l.src, kind: 'lesson', kicker: `LESSON ${l.no} · ${l.sem}`,
    subtitle: '', courseHub: l.hub
  });
}

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

function topbar(root) {
  return `<header class="topbar">
  <div class="inner">
    <a class="brand" href="${href(root, 'index.html')}"><span class="mark">M</span><span>为什么实验室 · 小学数学</span></a>
    <nav class="nav">
      <a href="${href(root, '00-方案/00-总方案.html')}">总方案</a>
      <a href="${href(root, '00-方案/09-96课总图.html')}">96 课地图</a>
      <a href="${href(root, '00-方案/03-B卷题型对照表.html')}">B 卷对照</a>
      <a href="${href(root, '课程/index.html')}">课程</a>
      <a href="${href(root, 'index.html')}">首页</a>
    </nav>
  </div>
  <div class="progress"><span></span></div>
</header>`;
}

function shell({ root, title, kicker, subtitle, content, bodyClass }) {
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
${topbar(root)}
<main class="page">
${content}
<div class="backtop"><a href="#top">↑ 回到顶部</a></div>
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

  // 课程类页面：去掉顶部的课程信息引用块
  if (doc.kind === 'lesson' || doc.kind === 'storyboard' || doc.kind === 'handout') {
    const bq = body.indexOf('<blockquote>');
    const h2 = body.indexOf('<h2');
    if (bq >= 0 && (h2 < 0 || bq < h2)) {
      body = body.replace(/<blockquote>[\s\S]*?<\/blockquote>\s*/, '');
    }
  }

  if (doc.kind === 'lesson' || doc.kind === 'handout') {
    body = body.replace(/^\s*(?:<p><strong>(?:大问题|本课要点|一句话原理|核心一句话|时长|材料|状态|今天的大问题|对应课|用法)<\/strong>[：:][\s\S]*?<\/p>\s*)+/, '');
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
  const selfName = path.basename(doc.src);
  if (doc.kind === 'lesson') {
    if (hasVideo && fs.existsSync(path.join(ROOT, dir, '视频稿与分镜.html'))) actions.push('<a class="btn" href="视频稿与分镜.html">视频分镜</a>');
    if (fs.existsSync(path.join(ROOT, dir, '挑战单.html'))) actions.push('<a class="btn" href="挑战单.html">挑战单</a>');
  }
  if (doc.kind === 'storyboard') {
    if (fs.existsSync(path.join(ROOT, dir, '讲授稿.html'))) actions.push('<a class="btn" href="讲授稿.html">讲授稿</a>');
    if (fs.existsSync(path.join(ROOT, dir, '动手单.html'))) actions.push('<a class="btn" href="动手单.html">动手单</a>');
  }
  if (doc.kind === 'handout') {
    if (fs.existsSync(path.join(ROOT, dir, '讲授稿.html'))) actions.push('<a class="btn" href="讲授稿.html">讲授稿</a>');
    if (selfName !== '动手单.md' && fs.existsSync(path.join(ROOT, dir, '动手单.html'))) actions.push('<a class="btn" href="动手单.html">动手单</a>');
    if (selfName !== '挑战单.md' && fs.existsSync(path.join(ROOT, dir, '挑战单.html'))) actions.push('<a class="btn" href="挑战单.html">挑战单</a>');
    if (fs.existsSync(path.join(ROOT, dir, '视频稿与分镜.html'))) actions.push('<a class="btn" href="视频稿与分镜.html">视频分镜</a>');
  }
  actions.push(`<a class="btn" href="${href(root, doc.courseHub || '课程/index.html')}">课程目录</a>`);

  const tocHtml = toc.length && !doc.fullWidth
    ? `<aside class="toc">
        <div class="toc-title">本页目录</div>
        ${toc.map(t => `<a class="lvl${t.lvl}" href="#${t.id}">${t.text}</a>`).join('')}
      </aside>`
    : '';

  const heroCopy = `<div class="hero-copy">
    <div class="hero-main">
      <div class="kicker">${escapeHtml(expandSem(doc.kicker || '为什么实验室'))}</div>
      <h1 class="doc-title">${escapeHtml(title)}</h1>
${doc.subtitle ? `      <p class="doc-sub">${escapeHtml(doc.subtitle)}</p>\n` : ''}      <div class="actions">${actions.join('')}</div>    </div>
  </div>`;
  const heroMedia = video || mediaPlaceholder;
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

  fs.mkdirSync(path.dirname(path.join(ROOT, out)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, out), shell({
    root, title, kicker: expandSem(doc.kicker || ''), subtitle: doc.subtitle,
    content, bodyClass: doc.kind || 'doc'
  }));
  console.log('✓', out);
}

function renderDocsHub() {
  const out = '00-方案/index.html';
  const root = rootRel(out);
  const cards = [
    ['01', '总方案', '课程怎么安排', '目标、课程结构、四个学年安排、家长做什么。', '00-总方案.html'],
    ['02', '三、四年级地图', '48 课，每一课一个“为什么”', '原理内核、教材锚点、B 卷接口、直观例子、轻奥延伸。', '01-48课知识地图.html'],
    ['03', '五、六年级地图', '48 课，接到六年级', '小数、方程、分数、比、圆、比例。', '08-五六年级48课地图.html'],
    ['04', '96 课总图', '八个学期，一条线', '一张表看完整，再看 8 条线索怎么长。', '09-96课总图.html'],
    ['05', '三、四年级覆盖', '71 个知识点都有落点', '对照 cn-math-taxonomy 的三、四年级清单。', '06-覆盖核对.html'],
    ['06', '五、六年级覆盖', '85 个知识点都有落点', '对照 cn-math-taxonomy 的五、六年级清单。', '10-五六年级覆盖核对.html'],
    ['07', '五、六年级 B 卷', 'B 卷题对应课次', '小数、分数、比例、几何、数论。', '11-五六年级B卷题型表.html'],
    ['08', '课程审查清单', '人工 review 看什么', '数学、语言、答案、边界和独立验收。', '12-课程审查清单.html'],
    ['09', '每课标准流程', '旧版 75 分钟流程（历史参考）', '课程已改为视频/文本讲解；本页保留旧流程。', '02-每课标准流程.html'],
    ['10', 'B 卷题型对照表', '三、四年级 B 卷题', '40+ 题型对应课次。', '03-B卷题型对照表.html'],
    ['11', '视频生产说明', '等课稿审完再做', '一份 JSON，生成一集。', '04-视频生产说明.html'],
    ['12', '入学诊断', '10 分钟，看孩子现在在哪', '8 个问题，只记录原话，不打分。', '05-入学诊断.html'],
    ['13', '研究依据', '为什么是 96 课', '课标、教材目录、taxonomy 和取舍。', '13-研究依据.html'],
    ['14', '教材版本映射', '先确认学校教材', '出版社、版次、当前单元和已学内容。', '19-教材版本映射.html'],
    ['15', '96 课全量复审', '修复前的 18 项问题', '保留审查时的发现与修改要求。', '20-96课文本初稿全量复审.html'],
    ['16', '修复与循环复验', '当前处理结果', '逐项修复位置、审查轮次与验证证据。', '21-课程修复与循环复验.html'],
    ['17', '成都教材对齐研究', '新教材、课量与视频优先级', '北师大版新教材目录、知识点缺口与扩展方案。', '22-成都教材对齐与课程扩展研究.html']
  ];
  const content = `<section class="hub-hero">
  <div class="hub-hero-grid">
    <div>
      <div class="kicker">DOCS · 方案与工具</div>
      <h1 class="doc-title">先读哪一份？</h1>
      <p class="doc-sub">先读总方案和 96 课总图；再看三、四年级和五、六年级两张地图；上课前翻每课流程。</p>
    </div>
    <aside class="hub-side">
      <div class="side-label">推荐阅读顺序</div>
      <ol>
        <li>总方案：目标与四个学年</li>
        <li>96 课总图：一条线看完整</li>
        <li>三、四年级地图：48 课</li>
        <li>五、六年级地图：48 课</li>
        <li>覆盖核对：156 个知识点</li>
        <li>审查清单：先审再拍视频</li>
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

function renderAutoHubs() {
  for (const sem of SEMESTERS) {
    const lessons = ALL_LESSONS.filter(l => l.sem === sem);
    if (!lessons.length) continue;
    const out = `课程/${sem}/index.html`;
    const root = rootRel(out);
    const rows = lessons.map(l => `<a class="lesson-row" href="${l.dir}/讲授稿.html">
        <div class="no">${l.no}</div>
        <div><h3>${escapeHtml(l.title)} <span class="badge gold">待教师复核</span></h3></div>
        <div class="meta">讲解稿 →</div>
      </a>`).join('');
    const content = `<section class="hub-hero">
  <div class="hub-hero-grid">
    <div>
      <div class="kicker">COURSE · ${SEM_NAMES[sem]}</div>
      <h1 class="doc-title">${SEM_NAMES[sem]}</h1>
      <p class="doc-sub">文本稿已齐，修订与复验见方案区记录；教师复核和学生试用尚未完成。</p>
      <div class="actions">
        <a class="btn primary" href="${lessons[0].dir}/讲授稿.html">从第 1 课开始</a>
        <a class="btn" href="${root}/00-方案/09-96课总图.html">看 96 课总图</a>
      </div>
    </div>
    <aside class="hub-side">
      <div class="side-label">阅读顺序</div>
      <p>按课次往下读，先看讲解和例题，再自己做练习。对答案时，也看看哪里容易弄错。</p>
    </aside>
  </div>
</section>
<h2 class="hub-section">${SEM_NAMES[sem]}</h2>
<p class="hub-section-sub">先按实际先修知识选择课次，选学内容可跳过。</p>
${rows}`;
    const html = shell({ root, title: SEM_NAMES[sem], kicker: 'COURSE', subtitle: '', content, bodyClass: 'hub' });
    fs.mkdirSync(path.join(ROOT, '课程', sem), { recursive: true });
    fs.writeFileSync(path.join(ROOT, out), html);
    console.log('✓', out);
  }
}

function renderCourseIndex() {
  const out = '课程/index.html';
  const root = rootRel(out);
  const cards = [
    ['三年级上期', '三年级上期', '位值、竖式、乘除、周长。文本稿，待教师复核。', '三上/index.html', '待教师复核'],
    ['三年级下期', '三年级下期', '面积、小数、年月日、搭配。文本稿，待教师复核。', '三下/index.html', '待教师复核'],
    ['四年级上期', '四年级上期', '大数、角度、积商规律、优化。文本稿，待教师复核。', '四上/index.html', '待教师复核'],
    ['四年级下期', '四年级下期', '运算律、小数、三角形、统计。文本稿，待教师复核。', '四下/index.html', '待教师复核'],
    ['五年级上期', '五年级上期', '小数、方程、面积、植树。文本稿，待教师复核。', '五上/index.html', '待教师复核'],
    ['五年级下期', '五年级下期', '因数倍数、长方体、分数。文本稿，待教师复核。', '五下/index.html', '待教师复核'],
    ['六年级上期', '六年级上期', '分数乘除、比、圆、百分数。文本稿，待教师复核。', '六上/index.html', '待教师复核'],
    ['六年级下期', '六年级下期', '负数、圆柱圆锥、比例、鸽巢。文本稿，待教师复核。', '六下/index.html', '待教师复核']
  ];
  const content = `<section class="hub-hero">
  <div class="hub-hero-grid">
    <div>
      <div class="kicker">COURSE · 课程目录</div>
      <h1 class="doc-title">从哪一册开始？</h1>
      <p class="doc-sub">96 课讲解稿已齐，按学期进入；文本修订记录见方案区，教师复核和学生试用待开展。</p>
      <div class="actions">
        <a class="btn primary" href="五上/L01-小数乘法/讲授稿.html">五年级上期第 1 课</a>
        <a class="btn" href="三上/L01-满十进一/讲授稿.html">三年级上期第 1 课</a>
        <a class="btn" href="../00-方案/09-96课总图.html">96 课总图</a>
      </div>
    </div>
    <aside class="hub-side">
      <div class="side-label">生产顺序</div>
      <ol>
        <li>96 课文本初稿：已完成</li>
        <li>文本审查与修订：见 21 号复验记录</li>
        <li>教师复核：待开展</li>
        <li>学生试教、独立验收：未开始</li>
        <li>视频：只保留已有两段</li>
      </ol>
    </aside>
  </div>
</section>
<div class="hub-grid">
${cards.map(c => `<a class="hub-card" href="${c[3]}">
  <div class="num">${c[0]} · ${c[4]}</div>
  <h3>${c[1]}</h3>
  <p>${c[2]}</p>
  <span class="go">打开 →</span>
</a>`).join('')}
</div>`;
  const html = shell({ root, title: '课程目录', kicker: 'COURSE', subtitle: '', content, bodyClass: 'hub' });
  fs.mkdirSync(path.join(ROOT, '课程'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, out), html);
  console.log('✓', out);
}

// 先渲染所有文档，最后生成 hub
DOCS.forEach(renderDoc);
renderDocsHub();
renderAutoHubs();
renderCourseIndex();

// 首页里的 .md 链接统一换成 .html
const indexFile = path.join(ROOT, 'index.html');
if (fs.existsSync(indexFile)) {
  let s = fs.readFileSync(indexFile, 'utf8');
  s = s.replace(/href="([^"]+)\.md(#[^"]*)?"/g, 'href="$1.html$2"');
  fs.writeFileSync(indexFile, s);
  console.log('✓ index.html links → .html');
}
