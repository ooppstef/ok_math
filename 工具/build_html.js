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
    src: '00-方案/29-全量课程重新审查.md', kind: 'doc', kicker: 'REVIEW · 全新复审',
    subtitle: '128 课的学段、前置、内容修复与验证边界。', fullWidth: true
  },
  {
    src: '00-方案/28-原理视频制作与验收.md', kind: 'doc', kicker: 'VIDEO · 制作记录',
    subtitle: '51 课原理动画、指定音色与实际成片核验。', fullWidth: true
  },
  {
    src: '00-方案/27-数学原理全量优化与复核.md', kind: 'doc', kicker: 'REVIEW · 数学原理',
    subtitle: '128 课的模型、变化过程、视频取舍与复核记录。', fullWidth: true
  },
  {
    src: 'README.md', kind: 'doc', kicker: 'START HERE · 使用说明',
    subtitle: '三至六年级的数学讲解、例题与练习。'
  },
  {
    src: '00-方案/00-总方案.md', kind: 'doc', kicker: 'PLAN · 总方案',
    subtitle: '128 课的目标、学习顺序与使用方法。'
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
    src: '00-方案/25-课程补齐与制作记录.md', kind: 'doc', kicker: 'COURSES · 课程补齐',
    subtitle: '新增课程、知识点入口、重点课分镜与复验记录。',
    fullWidth: true
  },
  {
    src: '00-方案/26-视频必要性复核.md', kind: 'doc', kicker: 'VIDEO · 视频取舍',
    subtitle: '哪些课保留分镜，哪些课用图文即可。', fullWidth: true
  },
  {
    src: '00-方案/06-覆盖核对.md', kind: 'doc', kicker: 'COVERAGE · 三、四年级',
    subtitle: '三、四年级 71 个知识点，逐个找到落点。',
    fullWidth: true
  },
  {
    src: '00-方案/02-每课标准流程.md', kind: 'doc', kicker: 'METHOD · 上课流程',
    subtitle: '从具体问题、图中变化，到算式与条件检查。'
  },
  {
    src: '00-方案/03-B卷题型对照表.md', kind: 'doc', kicker: 'B-PAPER · 对照表',
    subtitle: '40+ 题型对应课次。',
    fullWidth: true
  },
  {
    src: '00-方案/04-视频生产说明.md', kind: 'doc', kicker: 'VIDEO · 生产线',
    subtitle: '先核对原理与动作，再制作样片、接入配音。'
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
    src: '课程/三上/L13-混合运算与括号/讲授稿.md', kind: 'lesson', kicker: 'LESSON 13 · 三上',
    subtitle: '一个算式里，哪一步先算？',
    courseHub: '课程/三上/index.html'
  },
  {
    src: '课程/三上/L14-吨、千克、克/讲授稿.md', kind: 'lesson', kicker: 'LESSON 14 · 三上',
    subtitle: '1 吨到底有多重？',
    courseHub: '课程/三上/index.html'
  },
  {
    src: '课程/三上/L15-角与直角/讲授稿.md', kind: 'lesson', kicker: 'LESSON 15 · 三上',
    subtitle: '角的大小，看边还是看开口？',
    courseHub: '课程/三上/index.html'
  },
  {
    src: '课程/三上/L16-调查与记录/讲授稿.md', kind: 'lesson', kicker: 'LESSON 16 · 三上',
    subtitle: '每个人的回答，怎样记清楚？',
    courseHub: '课程/三上/index.html'
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
const learningPlan = JSON.parse(fs.readFileSync(path.join(ROOT, '课程/学习安排.json'), 'utf8')).lessons;
const planById = new Map(learningPlan.map((item, order) => [item.id, { ...item, order }]));
if (planById.size !== learningPlan.length) throw new Error('学习安排含重复课号');
const LEARNING_GROUPS = [
  { stage: '3–4', level: '基础', title: '三、四年级 · 基础' },
  { stage: '3–4', level: '提高', title: '三、四年级 · 提高选学' },
  { stage: '5–6', level: '基础', title: '五、六年级 · 基础' },
  { stage: '5–6', level: '提高', title: '五、六年级 · 提高选学' }
];
function stageName(stage) { return stage === '3–4' ? '三、四年级' : '五、六年级'; }
function learningLabel(lesson) { return `${stageName(lesson.stage)} · ${lesson.level === '提高' ? '提高选学' : '基础'}`; }

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
function lessonsIn(group) { return ALL_LESSONS.filter(l => l.stage === group.stage && l.level === group.level); }

const knownDocs = new Set(DOCS.map(d => d.src));
for (const l of ALL_LESSONS) {
  if (!knownDocs.has(l.src)) {
    DOCS.push({
      src: l.src, kind: 'lesson', kicker: `LESSON ${l.no} · ${l.sem}`,
      subtitle: '', courseHub: l.hub
    });
  }
  const storyboard = `课程/${l.sem}/${l.dir}/视频稿与分镜.md`;
  if (!knownDocs.has(storyboard) && fs.existsSync(path.join(ROOT, storyboard))) {
    DOCS.push({
      src: storyboard, kind: 'storyboard', fullWidth: true,
      kicker: `STORYBOARD · ${l.sem} ${l.no}`, subtitle: '', courseHub: l.hub
    });
  }
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

function renderDoc(doc) {
  const abs = path.join(ROOT, doc.src);
  const md = fs.readFileSync(abs, 'utf8');
  const dir = path.dirname(doc.src);
  const out = doc.src.replace(/\.md$/, '.html');
  const root = rootRel(out);

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
    if (fs.existsSync(path.join(ROOT, dir, '挑战单.html'))) actions.push('<a class="btn" href="挑战单.html">挑战单</a>');
  }
  if (doc.kind === 'storyboard') {
    if (fs.existsSync(path.join(ROOT, dir, '讲授稿.html'))) actions.push('<a class="btn" href="讲授稿.html">课程讲解</a>');
    if (fs.existsSync(path.join(ROOT, dir, '动手单.html'))) actions.push('<a class="btn" href="动手单.html">动手单</a>');
  }
  if (doc.kind === 'handout') {
    if (fs.existsSync(path.join(ROOT, dir, '讲授稿.html'))) actions.push('<a class="btn" href="讲授稿.html">课程讲解</a>');
    if (selfName !== '动手单.md' && fs.existsSync(path.join(ROOT, dir, '动手单.html'))) actions.push('<a class="btn" href="动手单.html">动手单</a>');
    if (selfName !== '挑战单.md' && fs.existsSync(path.join(ROOT, dir, '挑战单.html'))) actions.push('<a class="btn" href="挑战单.html">挑战单</a>');
  }
  const learning = doc.kind === 'lesson' || doc.kind === 'handout';
  const courseHub = learning ? '课程/index.html' : (doc.courseHub || '课程/index.html');
  actions.push(`<a class="btn" href="${href(root, courseHub)}">课程目录</a>`);

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

  fs.mkdirSync(path.dirname(path.join(ROOT, out)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, out), shell({
    root, title, kicker: expandSem(doc.kicker || ''), subtitle: doc.subtitle,
    content, bodyClass: doc.kind || 'doc', learning
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
    ['09', '每课标准流程', '从问题走到算式', '图、文字、动作和练习怎样对应。', '02-每课标准流程.html'],
    ['10', 'B 卷题型对照表', '三、四年级 B 卷题', '40+ 题型对应课次。', '03-B卷题型对照表.html'],
    ['11', '视频生产说明', '原理动画与配音', '分镜、局部样片、正式声音和成片复核。', '04-视频生产说明.html'],
    ['12', '入学诊断', '10 分钟，看孩子现在在哪', '8 个问题，只记录原话，不打分。', '05-入学诊断.html'],
    ['13', '研究依据', '为什么是 96 课', '课标、教材目录、taxonomy 和取舍。', '13-研究依据.html'],
    ['14', '教材版本映射', '先确认学校教材', '出版社、版次、当前单元和已学内容。', '19-教材版本映射.html'],
    ['15', '96 课全量复审', '修复前的 18 项问题', '保留审查时的发现与修改要求。', '20-96课文本初稿全量复审.html'],
    ['16', '修复与循环复验', '当前处理结果', '逐项修复位置、审查轮次与验证证据。', '21-课程修复与循环复验.html'],
    ['17', '成都教材对齐研究', '新教材、课量与视频优先级', '北师大版新教材目录、知识点缺口与扩展方案。', '22-成都教材对齐与课程扩展研究.html'],
    ['18', '课程补齐与制作记录', '128 课与重点分镜', '新增 28 课、三上学习入口与本轮复验。', '25-课程补齐与制作记录.html'],
    ['19', '早期视频取舍', '历史记录', '当前安排见 27 号全量复核。', '26-视频必要性复核.html'],
    ['20', '数学原理全量优化', '128 课逐课记录', '原理、配图、分镜和内容复验。', '27-数学原理全量优化与复核.html'],
    ['21', '原理视频制作', '51 课动画与配音', '指定音色、画面修正与成片核验。', '28-原理视频制作与验收.html'],
    ['22', '全新课程复审', '当前学习安排与修复', '从课标重查128课、前置、练习和成片。', '29-全量课程重新审查.html']
  ];
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
  const html = shell({ root, title: '方案与工具', kicker: 'DOCS', subtitle: '', content, bodyClass: 'hub' });
  fs.writeFileSync(path.join(ROOT, out), html);
  console.log('✓', out);
}

function renderAutoHubs() {
  for (const sem of SEMESTERS) {
    const lessons = ALL_LESSONS.filter(l => l.sem === sem).sort((a, b) => a.no.localeCompare(b.no));
    if (!lessons.length) continue;
    const out = `课程/${sem}/index.html`;
    const root = rootRel(out);
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
    const html = shell({ root, title: SEM_NAMES[sem], content, bodyClass: 'hub course-hub', learning: true });
    fs.mkdirSync(path.join(ROOT, '课程', sem), { recursive: true });
    fs.writeFileSync(path.join(ROOT, out), html);
    console.log('✓', out);
  }
}

function renderCourseIndex() {
  const out = '课程/index.html';
  const root = rootRel(out);
  const content = `<section class="hub-hero">
  <h1 class="doc-title">课程目录</h1>
</section>
${LEARNING_GROUPS.map(group => `<section class="learning-group">
  <h2>${group.title}</h2>
  <div class="lesson-list">${lessonsIn(group).map((l, i) => `<a class="lesson-row" href="${href(root, l.src.replace(/\.md$/, '.html'))}"><span class="no">${String(i + 1).padStart(2, '0')}</span><h3>${escapeHtml(l.title)}${videoBadge(l)}</h3></a>`).join('')}</div>
</section>`).join('')}`;
  const html = shell({ root, title: '课程目录', content, bodyClass: 'hub course-hub', learning: true });
  fs.mkdirSync(path.join(ROOT, '课程'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, out), html);
  console.log('✓', out);
}

// 先渲染所有文档，最后生成 hub
DOCS.forEach(renderDoc);
renderDocsHub();
renderAutoHubs();
renderCourseIndex();

// 首页与学期目录共用课程清单，新增课不再手工登记两遍。
const indexFile = path.join(ROOT, 'index.html');
if (fs.existsSync(indexFile)) {
  let s = fs.readFileSync(indexFile, 'utf8');
  const terms = LEARNING_GROUPS.map((group, i) => `      <section class="term">
        <div class="term-head">
          <span class="term-no">${String(i + 1).padStart(2, '0')}</span>
          <h3>${group.title}</h3>
        </div>
        <ol class="term-list">
${lessonsIn(group).map((l, j) => `          <li><a class="lesson" href="${escapeHtml(l.src.replace(/\.md$/, '.html'))}"><span class="lesson-no">${String(j + 1).padStart(2, '0')}</span><span class="lesson-name">${escapeHtml(l.title)}${videoBadge(l)}</span></a></li>`).join('\n')}
        </ol>
      </section>`).join('\n');
  s = s.replace(/<section id="courses">[\s\S]*?(?=  <div class="backtop">)/,
    `<section id="courses">\n${terms}\n  </section>\n\n`);
  s = s.replace(/href="([^"]+)\.md(#[^"]*)?"/g, 'href="$1.html$2"');
  fs.writeFileSync(indexFile, s);
  console.log('✓ index.html 课程目录');
}
