const DOCS = [
  {
    src: '00-方案/07-三至六年级B卷课程审查.md', kind: 'doc', kicker: 'REVIEW · 历史审查',
    subtitle: '早期课程审查记录。', fullWidth: true
  },
  {
    src: '00-方案/20-96课文本初稿全量复审.md', kind: 'doc', kicker: 'REVIEW · 历史审查',
    subtitle: '96 课文本初稿审查记录。', fullWidth: true
  },
  {
    src: '00-方案/30-课程范围与知识点核对.md', kind: 'doc', kicker: 'COVERAGE · 课程范围',
    subtitle: '125 课的知识覆盖、提高与轻奥范围。', fullWidth: true
  },
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
const LEARNING_GROUPS = [
  { stage: '3–4', level: '基础', title: '三、四年级 · 基础' },
  { stage: '3–4', level: '提高', title: '三、四年级 · 提高选学' },
  { stage: '3–4', level: '轻奥', title: '三、四年级 · 轻奥选学' },
  { stage: '5–6', level: '基础', title: '五、六年级 · 基础' },
  { stage: '5–6', level: '提高', title: '五、六年级 · 提高选学' },
  { stage: '5–6', level: '轻奥', title: '五、六年级 · 轻奥选学' }
];

const DOC_CARDS = [
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
    ['22', '全新课程复审', '128 课历史审查', '从课标重查前置、练习和成片；最新范围见知识点核对。', '29-全量课程重新审查.html'],
    ['23', '课程范围与知识点核对', '125 课够到什么程度', '基础、提高与轻奥的覆盖；删除三课后的内容承接。', '30-课程范围与知识点核对.html']
  ];

module.exports = { DOCS, DOC_CARDS, SEMESTERS, SEM_NAMES, LEARNING_GROUPS };
