/* 六年级下 · 参数化练习（每一题都由代码现算） */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./practice.js'));
  else factory(root.MathPractice);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (MP) {
  'use strict';
  var int = MP.int, pick = MP.pick, mc = MP.mc, choice = MP.choice, fmt = MP.fmt;

  var POINTS = {
    '六下-L01': ['负数', '数轴', '相反意义'],
    '六下-L02': ['折扣', '利率', '税率'],
    '六下-L03': ['圆柱', '侧面积', '表面积'],
    '六下-L04': ['圆柱体积', '底面积乘高', '切拼'],
    '六下-L05': ['圆锥体积', '三分之一', '等底等高'],
    '六下-L06': ['比例', '比值相等', '比例填数'],
    '六下-L07': ['正比例', '比值一定', '图像'],
    '六下-L08': ['乘积一定', '倍数关系', '数量变化'],
    '六下-L09': ['比例尺', '图上距离', '实际距离'],
    '六下-L10': ['鸽巢原理', '最不利', '抽屉'],
    '六下-L11': ['统计图选择', '条形', '折线', '扇形'],
    '六下-L12': ['知识整理', '综合应用', '运算'],
    '六下-L13': ['切拼', '表面积变化', '体积不变'],
    '六下-L14': ['比例', '行程', '速度比'],
    '六下-L15': ['统计调查', '平均数', '估算'],
    '六下-L16': ['综合应用', '方案设计', '数量关系']
  };
  function reg(id, make) { MP.register(id, POINTS[id], make); }
  var PI = 3.14;

  reg('六下-L01', function (r, i) {
    var a = int(r, 1, 9), b = int(r, 1, 9), mode = (i || 0) % 5;
    if (a === b) b = b === 9 ? 8 : b + 1;
    if (mode === 0) { var big = Math.max(a, b), small = Math.min(a, b); return choice('−' + small + ' 和 −' + big + ' 哪个大？', ['−' + small, '−' + big, '一样大', '无法比较'], '−' + small, '负数在数轴上越靠右越大，−' + small + ' 在 −' + big + ' 的右边。', '负数'); }
    if (mode === 1) return mc('温度从 −' + a + '℃ 上升到 ' + b + '℃，上升了多少度？', a + b, [b - a, a - b, a * b], '先升到 0℃，要上升 ' + a + '℃；再上升 ' + b + '℃，一共上升 ' + (a + b) + '℃。', '相反意义');
    if (mode === 2) return choice('如果收入 100 元记作 +100 元，那么支出 100 元记作（ ）。', ['−100 元', '+100 元', '0 元', '200 元'], '−100 元', '收入和支出是相反意义的量。', '相反意义');
    if (mode === 3) return choice('在数轴上，−2 在 −5 的（ ）。', ['右边', '左边', '同一点', '无法确定'], '右边', '数轴上右边的数比左边的大，−2 > −5。', '数轴');
    return mc('数轴上 −' + a + ' 到 0 的距离是多少个单位长度？', a, ['−' + a, 0, a + 1], '从 −' + a + ' 向右走 ' + a + ' 个单位长度，就到 0。', '数轴');
  });

  reg('六下-L02', function (r, i) {
    var price = int(r, 50, 300), off = pick(r, [6, 7, 8, 9]), mode = (i || 0) % 5;
    if (mode === 0) return choice('打 ' + off + ' 折表示按原价的（ ）出售。', [(off * 10) + '%', off + '%', (100 - off * 10) + '%', (off * 100) + '%'], (off * 10) + '%', '几折就是原价的百分之几十。', '折扣');
    if (mode === 1) return mc('原价 ' + price + ' 元，打 ' + off + ' 折后是多少元？', price * off / 10, [price * off / 100, price * (10 - off) / 10, price - off], '现价 = 原价×折扣 = ' + price + '×' + (off / 10) + '=' + (price * off / 10) + ' 元。', '折扣');
    if (mode === 2) { var sale = price * off / 10; return mc('一件商品打 ' + off + ' 折后是 ' + fmt(sale) + ' 元，原价是多少元？', price, [sale, sale * off / 10, sale + off], '原价 = 现价÷折扣 = ' + fmt(sale) + '÷' + (off / 10) + '=' + price + ' 元。', '折扣'); }
    if (mode === 3) { var principal = int(r, 1, 5) * 1000, rate = pick(r, [2, 2.5, 3, 4]), years = int(r, 2, 5); return mc('本金 ' + principal + ' 元，年利率 ' + rate + '%，存 ' + years + ' 年，按本金计算单利，利息是多少元？', principal * rate / 100 * years, [principal * rate / 100, principal * rate * years, principal + principal * rate / 100 * years], '利息 = 本金×利率×时间 = ' + principal + '×' + rate + '%×' + years + '=' + (principal * rate / 100 * years) + ' 元。', '利率'); }
    var income = int(r, 2, 10) * 1000, tax = pick(r, [3, 5, 10]);
    return mc('收入 ' + income + ' 元，题设税率为 ' + tax + '%，全部收入按此税率缴税，应缴多少元？', income * tax / 100, [income * tax, income / tax, income - tax], '税额 = 收入×税率 = ' + income + '×' + tax + '%=' + (income * tax / 100) + ' 元。', '税率');
  });

  reg('六下-L03', function (r, i) {
    var rr = int(r, 2, 9), h = int(r, 3, 12), mode = (i || 0) % 5;
    var lateral = 2 * PI * rr * h, base = PI * rr * rr;
    if (mode === 0) return mc('圆柱底面半径 ' + rr + ' 厘米、高 ' + h + ' 厘米，侧面积是多少？（π 取 3.14）', fmt(lateral), [fmt(base), fmt(2 * base + lateral), fmt(PI * rr * h)], '侧面积 = 底面周长×高 = 2×3.14×' + rr + '×' + h + '=' + fmt(lateral) + ' 平方厘米。', '侧面积');
    if (mode === 1) return mc('圆柱底面半径 ' + rr + ' 厘米、高 ' + h + ' 厘米，表面积是多少？（π 取 3.14）', fmt(2 * base + lateral), [fmt(base + lateral), fmt(lateral), fmt(2 * base)], '表面积 = 两个底面积 + 侧面积 = ' + fmt(2 * base) + '+' + fmt(lateral) + '=' + fmt(2 * base + lateral) + ' 平方厘米。', '表面积');
    if (mode === 2) return mc('无盖圆柱形水桶，底面半径 ' + rr + ' 厘米、高 ' + h + ' 厘米，需要多少铁皮？（π 取 3.14）', fmt(base + lateral), [fmt(2 * base + lateral), fmt(lateral), fmt(base)], '无盖只要一个底面：' + fmt(base) + '+' + fmt(lateral) + '=' + fmt(base + lateral) + ' 平方厘米。', '表面积');
    if (mode === 3) return choice('把圆柱侧面沿高剪开展平，得到一个（ ）。', ['长方形', '三角形', '梯形', '圆'], '长方形', '侧面沿高展开是长方形，长是底面周长，宽是高。', '侧面积');
    return mc('圆柱底面直径 ' + (2 * rr) + ' 厘米、高 ' + h + ' 厘米，侧面积是多少？（π 取 3.14）', fmt(PI * 2 * rr * h), [fmt(PI * rr * h), fmt(PI * rr * rr), fmt(2 * PI * rr + h)], '侧面积 = πdh = 3.14×' + (2 * rr) + '×' + h + '=' + fmt(PI * 2 * rr * h) + ' 平方厘米。', '圆柱');
  });

  reg('六下-L04', function (r, i) {
    var rr = int(r, 2, 8), h = int(r, 3, 12), mode = (i || 0) % 5;
    var base = PI * rr * rr, vol = base * h;
    if (mode === 0) return mc('圆柱底面半径 ' + rr + ' 厘米、高 ' + h + ' 厘米，体积是多少？（π 取 3.14）', fmt(vol), [fmt(base), fmt(2 * PI * rr * h), fmt(base * h / 3)], '体积 = 底面积×高 = 3.14×' + rr + '²×' + h + '=' + fmt(vol) + ' 立方厘米。', '圆柱体积');
    if (mode === 1) return mc('圆柱底面直径 ' + (2 * rr) + ' 厘米、高 ' + h + ' 厘米，体积是多少？（π 取 3.14）', fmt(vol), [fmt(PI * 2 * rr * 2 * rr * h), fmt(2 * PI * rr * h), fmt(vol / 3)], '先求半径 ' + rr + '，再算 πr²h = ' + fmt(vol) + '。', '圆柱体积');
    if (mode === 2) return mc('圆柱体积 ' + fmt(vol) + ' 立方厘米，底面积 ' + fmt(base) + ' 平方厘米，高是多少？', h, [fmt(vol), fmt(base), h + 1], '高 = 体积÷底面积 = ' + fmt(vol) + '÷' + fmt(base) + '=' + h + ' 厘米。', '底面积乘高');
    if (mode === 3) return choice('把圆柱切拼成近似的长方体，体积（ ）。', ['不变', '变大', '变小', '无法确定'], '不变', '切拼只改变形状，不改变体积。', '切拼');
    return choice('圆柱底面积不变，高变成原来的 2 倍，体积会怎样？', ['变成原来的 2 倍', '变成原来的 4 倍', '变成原来的一半', '不变'], '变成原来的 2 倍', '每一层的大小没变，层数变成了 2 倍，体积也变成 2 倍。', '圆柱体积');
  });

  reg('六下-L05', function (r, i) {
    var rr = int(r, 2, 8), h = 3 * int(r, 1, 4), mode = (i || 0) % 5;
    var cone = PI * rr * rr * h / 3, cyl = PI * rr * rr * h;
    if (mode === 0) return mc('圆锥底面半径 ' + rr + ' 厘米、高 ' + h + ' 厘米，体积是多少？（π 取 3.14）', fmt(cone), [fmt(cyl), fmt(PI * rr * rr), fmt(cone * 2)], '圆锥体积 = 底面积×高÷3 = ' + fmt(cone) + ' 立方厘米。', '圆锥体积');
    if (mode === 1) return mc('等底等高的圆柱体积是 ' + fmt(cyl) + ' 立方厘米，圆锥体积是多少？', fmt(cone), [fmt(cyl), fmt(cyl * 2), fmt(cyl / 2)], '圆锥体积是等底等高圆柱的三分之一：' + fmt(cone) + '。', '三分之一');
    if (mode === 2) return choice('圆锥体积公式是（ ）。', ['底面积×高÷3', '底面积×高', '底面积×高÷2', '底面周长×高'], '底面积×高÷3', '圆锥体积是与它等底等高圆柱体积的三分之一。', '圆锥体积');
    if (mode === 3) return mc('圆锥体积 ' + fmt(cone) + ' 立方厘米，底面积 ' + fmt(PI * rr * rr) + ' 平方厘米，高是多少？', h, [h * 3, h / 3, h + 1], '高 = 体积×3÷底面积 = ' + h + ' 厘米。', '等底等高');
    return choice('圆锥的高是（ ）。', ['从顶点到底面圆心的距离', '底面直径', '底面半径', '侧面长度'], '从顶点到底面圆心的距离', '圆锥的高是从顶点垂直到底面的距离。', '等底等高');
  });

  reg('六下-L06', function (r, i) {
    var a = int(r, 2, 9), b = int(r, 2, 9), k = int(r, 2, 5), mode = (i || 0) % 5;
    if (a === b) b = b === 9 ? 8 : b + 1;
    if (mode === 0) return mc(a + ':' + b + ' = □:' + (b * k) + '，□ 里填几？', a * k, [a, b * k, a + k], '后项变成原来的 ' + k + ' 倍，前项也要变成 ' + k + ' 倍：' + a + '×' + k + '=' + (a * k) + '。', '比例填数');
    if (mode === 1) return mc(a + ':' + b + ' = ' + (a * k) + ':□，□ 里填几？', b * k, [a * k, b, a], '前项变成原来的 ' + k + ' 倍，后项也要变成 ' + k + ' 倍：' + b + '×' + k + '=' + (b * k) + '。', '比例填数');
    if (mode === 2) return choice(a + ':' + b + ' 与 ' + (a * k) + ':' + (b * k) + ' 的比值相比，怎样？', ['相等', '前一个大', '后一个大', '无法比较'], '相等', '前项、后项都乘同一个非零数，比值不变。', '比值相等');
    if (mode === 3) return choice('下面哪一组能组成比例？', [a + ':' + b + ' 和 ' + (a * k) + ':' + (b * k), a + ':' + b + ' 和 ' + (a + k) + ':' + (b + k), a + ':' + b + ' 和 ' + (a * k) + ':' + b, a + ':' + b + ' 和 ' + a + ':' + (b + k)], a + ':' + b + ' 和 ' + (a * k) + ':' + (b * k), '前项后项同时乘 ' + k + '，比值相等，能组成比例。', '比例');
    return choice('表示两个比相等的式子叫作什么？', ['比例', '乘法算式', '差', '百分率'], '比例', '比如 2:3=4:6，表示这两个比相等。', '比例');
  });
  reg('六下-L07', function (r, i) {
    var k = int(r, 2, 6), x = int(r, 2, 8), mode = (i || 0) % 5;
    if (mode === 0) return mc('y 与 x 成正比例，x=' + x + ' 时 y=' + (k * x) + '。x=' + (x + 1) + ' 时 y 是多少？', k * (x + 1), [k * x + 1, k + x, k * x], '正比例中 y÷x=' + k + '，所以 y=' + k + '×' + (x + 1) + '=' + (k * (x + 1)) + '。', '正比例');
    if (mode === 1) return mc('y 与 x 成正比例，x=' + x + ' 时 y=' + (k * x) + '。比值是多少？', k, [x, k * x, k + x], '比值 = y÷x = ' + (k * x) + '÷' + x + '=' + k + '。', '比值一定');
    if (mode === 2) return choice('下面哪组量成正比例？', ['单价一定，总价和数量', '路程一定，速度和时间', '长方形面积一定，长和宽', '总页数一定，已看页数和未看页数'], '单价一定，总价和数量', '总价÷数量=单价（一定），所以成正比例。', '正比例');
    if (mode === 3) return choice('正比例的图像是一条（ ）。', ['过原点的直线', '曲线', '折线', '不过原点的直线'], '过原点的直线', 'y=kx 的图像是过原点的直线。', '图像');
    return mc('x 和 y 成正比例，x 扩大到原来的 2 倍，y（ ）。', '也扩大到原来的 2 倍', ['缩小到一半', '不变', '扩大 4 倍'], '正比例中 y 与 x 的比值不变，x 乘 2，y 也乘 2。', '正比例');
  });

  reg('六下-L08', function (r, i) {
    var length = int(r, 3, 9), width = int(r, 2, 6), area = length * width, mode = (i || 0) % 5;
    if (mode === 0) return mc('长方形面积是 ' + area + ' 平方厘米，长是 ' + length + ' 厘米，宽是多少厘米？', width, [area, length + width, width + 1], '面积不变，用面积除以长：' + area + '÷' + length + '=' + width + ' 厘米。', '乘积一定');
    if (mode === 1) return mc('长方形长 ' + length + ' 厘米、宽 ' + (2 * width) + ' 厘米。面积不变，长变成原来的 2 倍，宽要变成多少厘米？', width, [2 * width, 4 * width, width + 1], '长变成 2 倍，宽要变成原来的一半，长与宽的乘积才不变。', '倍数关系');
    if (mode === 2) return mc('同一段路，原来每小时走 30 千米，要 ' + (2 * width) + ' 小时。改为每小时 60 千米，需要几小时？', width, [2 * width, 4 * width, width + 1], '路程没变，每小时走的路程变成 2 倍，所需时间就是原来的一半：' + (2 * width) + '÷2=' + width + ' 小时。', '倍数关系');
    if (mode === 3) return choice('长方形长与宽的和不变，面积一定不变吗？', ['不一定', '一定不变', '一定变大', '一定变小'], '不一定', '例如长宽是 6 和 4，面积是 24；改成 7 和 3，和仍是 10，面积却是 21。', '数量变化');
    return choice('下面哪种情况下，两个量的乘积保持不变？', ['长方形面积不变时的长和宽', '长方形周长不变时的长和宽', '总页数不变时的已读页数和未读页数', '两人总钱数不变时各自的钱数'], '长方形面积不变时的长和宽', '长×宽=面积。面积不变，乘积就不变；其余条件保持的是和。', '乘积一定');
  });
  reg('六下-L09', function (r, i) {
    var scale = pick(r, [1000, 2000, 10000, 100000, 500000]), cm = int(r, 2, 9), mode = (i || 0) % 5;
    var actualCm = cm * scale;
    if (mode === 0) return mc('比例尺 1:' + scale + '，图上 ' + cm + ' 厘米表示实际多少千米？', fmt(actualCm / 100000), [fmt(actualCm / 1000), fmt(cm * scale / 10000), fmt(cm * scale)], '实际距离 = 图上距离×比例尺分母 = ' + cm + '×' + scale + ' 厘米 = ' + fmt(actualCm / 100000) + ' 千米。', '实际距离');
    if (mode === 1) { var km = int(r, 2, 9); return mc('比例尺 1:' + scale + '，实际 ' + km + ' 千米在图上应画多少厘米？', fmt(km * 100000 / scale), [fmt(km * 1000 / scale), fmt(km * scale / 100000), fmt(km)], '图上距离 = 实际距离÷比例尺分母 = ' + km + ' 千米 = ' + (km * 100000) + ' 厘米，除以 ' + scale + ' 得 ' + fmt(km * 100000 / scale) + ' 厘米。', '图上距离'); }
    if (mode === 2) return choice('比例尺 1:' + scale + ' 表示（ ）。', ['图上 1 厘米代表实际 ' + scale + ' 厘米', '图上 ' + scale + ' 厘米代表实际 1 厘米', '图上 1 厘米代表实际 ' + scale + ' 千米', '图上距离是实际距离的 ' + scale + ' 倍'], '图上 1 厘米代表实际 ' + scale + ' 厘米', '比例尺是图上距离与实际距离的比。', '比例尺');
    if (mode === 3) return mc('图上距离 ' + cm + ' 厘米，实际距离 ' + fmt(actualCm / 100000) + ' 千米，比例尺是多少？', '1:' + scale, ['1:' + (scale / 10), scale + ':1', '1:' + (scale * 10)], '先统一单位，再化简比，得 1:' + scale + '。', '比例尺');
    return choice('缩小比例尺的前项通常是（ ）。', ['1', '0', '图上距离', '实际距离'], '1', '缩小比例尺通常写成 1:... 的形式。', '比例尺');
  });

  reg('六下-L10', function (r, i) {
    var holes = int(r, 3, 6), pigeons = holes + int(r, 1, 5), mode = (i || 0) % 5;
    if (mode === 0) return mc(pigeons + ' 只鸽子飞进 ' + holes + ' 个鸽巢，至少有一个鸽巢里飞进几只？', Math.ceil(pigeons / holes), [Math.floor(pigeons / holes), pigeons - holes, holes], '平均分：' + pigeons + '÷' + holes + '=' + Math.floor(pigeons / holes) + '……' + (pigeons % holes) + '，至少有一个巢里有 ' + Math.ceil(pigeons / holes) + ' 只。', '鸽巢原理');
    if (mode === 1) { var colors = int(r, 2, 4); return mc('有 ' + colors + ' 种颜色的袜子，至少摸出几只才能保证有一双同色？', colors + 1, [colors, colors + 2, 2], '最不利情况先每种颜色各摸 1 只，共 ' + colors + ' 只，再摸 1 只必有同色，所以 ' + (colors + 1) + ' 只。', '最不利'); }
    if (mode === 2) return mc('13 个人中，至少有几人生日在同一个月？', 2, [1, 3, 12], '13÷12=1……1，至少 2 人同月。', '抽屉');
    if (mode === 3) return choice('鸽巢原理研究的是（ ）。', ['把多于巢数的物体放进巢里，至少有一个巢放多个', '怎样平均分', '怎样算平均数', '怎样画统计图'], '把多于巢数的物体放进巢里，至少有一个巢放多个', '这就是抽屉原理。', '鸽巢原理');
    return choice('用“最不利原则”时，先要考虑（ ）。', ['最坏的情况', '最好的情况', '平均情况', '任意情况'], '最坏的情况', '保证问题要看最不利的情况。', '最不利');
  });

  reg('六下-L11', function (r, i) {
    var mode = (i || 0) % 5;
    if (mode === 0) return choice('要比较四个班的人数多少，最好选（ ）。', ['条形统计图', '折线统计图', '扇形统计图', '统计表'], '条形统计图', '条形统计图便于比较数量的多少。', '条形');
    if (mode === 1) return choice('要表示一周气温的变化趋势，最好选（ ）。', ['折线统计图', '条形统计图', '扇形统计图', '统计表'], '折线统计图', '折线统计图能看出增减变化趋势。', '折线');
    if (mode === 2) return choice('要表示各部分占整体的百分比，最好选（ ）。', ['扇形统计图', '条形统计图', '折线统计图', '统计表'], '扇形统计图', '扇形统计图看部分与整体的关系。', '扇形');
    if (mode === 3) return choice('扇形统计图不能直接看出（ ）。', ['具体数量的多少', '各部分百分比', '整体与部分的关系', '哪部分最大'], '具体数量的多少', '扇形统计图只给百分比，具体数量还要结合总数。', '统计图选择');
    return choice('三种统计图各有侧重，选图前先要明确（ ）。', ['想从数据里知道什么', '图好不好看', '颜色搭配', '纸张大小'], '想从数据里知道什么', '先明确问题，再选能回答问题的统计图。', '统计图选择');
  });

  reg('六下-L12', function (r, i) {
    var a = int(r, 2, 9), b = int(r, 2, 9), c = int(r, 2, 9), mode = (i || 0) % 5;
    if (mode === 0) { var dd = int(r, 2, (a + b) * c); return mc('(' + a + ' + ' + b + ') × ' + c + ' − ' + dd + ' = ？', (a + b) * c - dd, [a + b * c - dd, (a + b) * (c - dd), a * b + c - dd], '先算括号 ' + (a + b) + '，乘 ' + c + ' 得 ' + ((a + b) * c) + '，再减 ' + dd + ' 得 ' + ((a + b) * c - dd) + '。', '运算'); }
    if (mode === 1) { var len = int(r, 4, 12), w = int(r, 2, 9); return mc('长方形长 ' + len + ' 厘米、宽 ' + w + ' 厘米，面积是多少？', len * w, [2 * (len + w), len + w, len * w / 2], '面积 = 长×宽 = ' + len + '×' + w + '=' + (len * w) + ' 平方厘米。', '综合应用'); }
    if (mode === 2) { var total = int(r, 2, 10) * 50, p = pick(r, [20, 25, 40, 50]); return mc(total + ' 的 ' + p + '% 是多少？', total * p / 100, [total * p / 10, total - p, total / p], total + '×' + p + '%=' + (total * p / 100) + '。', '综合应用'); }
    if (mode === 3) { var x = int(r, 2, 9), y = int(r, 2, 9), k = int(r, 2, 5); if (x === y) y += 1; return mc('把 ' + (x + y) * k + ' 按 ' + x + ':' + y + ' 分配，较大的一份是多少？', (x + y) * k / (x + y) * Math.max(x, y), [(x + y) * k / (x + y) * Math.min(x, y), (x + y) * k, k], '总份数 ' + (x + y) + '，一份 ' + k + '，较大的一份 ' + (k * Math.max(x, y)) + '。', '综合应用'); }
    var n = int(r, 3, 6), avg = int(r, 60, 90);
    return mc(n + ' 个数的平均数是 ' + avg + '，它们的总和是多少？', n * avg, [avg + n, avg * (n - 1), n * avg + n], '总和 = 平均数×个数 = ' + avg + '×' + n + '=' + (n * avg) + '。', '知识整理');
  });

  reg('六下-L13', function (r, i) {
    var a = int(r, 3, 8), b = int(r, 3, 8), c = int(r, 3, 8), mode = (i || 0) % 5;
    if (mode === 0) return mc('把长 ' + a + ' 厘米、宽 ' + b + ' 厘米、高 ' + c + ' 厘米' + ' 的长方体沿平行于宽和高的方向切成两个小长方体，表面积增加多少平方厘米？', 2 * b * c, [b * c, 4 * b * c, a * b * c], '切开后多出两个切面，每个切面 ' + b + '×' + c + '=' + (b * c) + '，共增加 ' + (2 * b * c) + '。', '切拼');
    if (mode === 1) return mc('两个完全一样的长方体，宽 ' + b + ' 厘米、高 ' + c + ' 厘米。把它们的宽×高面完全贴合，表面积比原来两个的表面积之和少多少平方厘米？', 2 * b * c, [b * c, 4 * b * c, 2 * (a * b + b * c + a * c)], '拼在一起遮住两个宽×高面，少 ' + (2 * b * c) + '。', '表面积变化');
    if (mode === 2) return choice('把长方体切开后，体积（ ）。', ['不变', '变大', '变小', '无法确定'], '不变', '切拼只改变表面积，体积不变。', '体积不变');
    if (mode === 3) return mc('把圆柱沿底面直径竖直切成两半，表面积增加多少平方厘米？（半径 ' + a + ' 厘米，高 ' + b + ' 厘米）', 2 * (2 * a) * b, [(2 * a) * b, 2 * a * b, 2 * PI * a * b], '增加两个长方形切面，每个长 ' + (2 * a) + '、宽 ' + b + '，共 ' + (2 * (2 * a) * b) + '。', '切拼');
    return choice('切拼问题中，表面积变化的关键是（ ）。', ['看增加了还是减少了几个面', '看体积变没变', '看长度', '看颜色'], '看增加了还是减少了几个面', '切开增加面，拼合减少面。', '表面积变化');
  });

  reg('六下-L14', function (r, i) {
    var v1 = int(r, 2, 6), v2 = int(r, 3, 8), t = int(r, 2, 5), mode = (i || 0) % 5;
    if (v1 === v2) v2 += 1;
    if (mode === 0) return choice('两车速度比是 ' + v1 + ':' + v2 + '，行驶同样时间，路程比是（ ）。', [v1 + ':' + v2, v2 + ':' + v1, v1 + ':' + (v1 + v2), '无法确定'], v1 + ':' + v2, '时间相同，路程比等于速度比。', '速度比');
    if (mode === 1) return choice('两车速度比是 ' + v1 + ':' + v2 + '，行驶同样路程，时间比是（ ）。', [v2 + ':' + v1, v1 + ':' + v2, v1 + ':' + (v1 + v2), '无法确定'], v2 + ':' + v1, '路程相同，时间比等于速度的反比。', '比例');
    if (mode === 2) { var s = (v1 + v2) * t; return mc('两车从相距 ' + s + ' 千米的两地同时出发，相向而行，速度分别是 ' + v1 + ' 和 ' + v2 + ' 千米/时，几小时相遇？', t, [s / v1, s / v2, t + 1], '相遇时间 = 路程÷速度和 = ' + s + '÷(' + v1 + '+' + v2 + ')=' + t + ' 小时。', '行程'); }
    if (mode === 3) { var scale = pick(r, [100000, 200000, 500000]); var cm = int(r, 2, 8); return mc('比例尺 1:' + scale + '，图上 ' + cm + ' 厘米表示实际多少千米？', fmt(cm * scale / 100000), [fmt(cm * scale / 1000), fmt(cm * scale / 10000), fmt(cm * scale)], '实际距离 = ' + cm + '×' + scale + ' 厘米 = ' + fmt(cm * scale / 100000) + ' 千米。', '比例'); }
    return mc('甲、乙速度比 ' + v1 + ':' + v2 + '，两人行驶时间相同。甲行 ' + (v1 * t) + ' 千米时，乙行多少千米？', v2 * t, [v1 * t, v2, v1 + v2], '时间相同，路程比等于速度比：乙行 ' + v2 + '×' + t + '=' + (v2 * t) + ' 千米。', '速度比');
  });

  reg('六下-L15', function (r, i) {
    var days = int(r, 3, 7), avg = int(r, 8, 20), mode = (i || 0) % 5;
    if (mode === 0) return mc(days + ' 天平均每天用水 ' + avg + ' 升，一共用水多少升？', days * avg, [avg + days, avg * (days - 1), days * avg + days], '总用水量 = 平均数×天数 = ' + avg + '×' + days + '=' + (days * avg) + ' 升。', '平均数');
    if (mode === 1) { var total = days * avg; return mc(days + ' 天共用水 ' + total + ' 升，平均每天用水多少升？', avg, [total, total / (days + 1), avg + 1], '平均数 = 总用水量÷天数 = ' + total + '÷' + days + '=' + avg + ' 升。', '统计调查'); }
    if (mode === 2) return choice('调查校园用水量时，只记录一天的数据，能代表一周的情况吗？', ['不能，要多记录几天', '能，一天就够', '能，因为每天都一样', '无法判断'], '不能，要多记录几天', '一天可能有偶然性，多记录几天再取平均数更可靠。', '统计调查');
    if (mode === 3) return choice('用样本估计总体时，样本应该（ ）。', ['有代表性', '越少越好', '只选特殊的一天', '随便选'], '有代表性', '样本要有代表性，估计才可靠。', '估算');
    return mc('一个水龙头每分钟漏水 ' + avg + ' 毫升，' + days + ' 分钟漏多少毫升？', avg * days, [avg + days, avg * days * 60, avg], '漏水量 = 每分钟漏水量×时间 = ' + avg + '×' + days + '=' + (avg * days) + ' 毫升。', '估算');
  });

  reg('六下-L16', function (r, i) {
    var price = int(r, 5, 30), qty = int(r, 3, 10), people = int(r, 20, 60), mode = (i || 0) % 5;
    if (mode === 0) return mc('每张门票 ' + price + ' 元，' + people + ' 人参观，买门票一共要多少元？', price * people, [price + people, price * (people + 1), price * people / 2], '总价 = 单价×人数 = ' + price + '×' + people + '=' + (price * people) + ' 元。', '数量关系');
    if (mode === 1) { var a = int(r, 4, 12), b = int(r, 3, 9); return mc('一块长方形菜地长 ' + a + ' 米、宽 ' + b + ' 米，面积是多少平方米？', a * b, [2 * (a + b), a + b, a * b / 2], '面积 = 长×宽 = ' + a + '×' + b + '=' + (a * b) + ' 平方米。', '综合应用'); }
    if (mode === 2) { var total = int(r, 2, 10) * 100, p = pick(r, [20, 25, 40, 50]); return mc('计划植树 ' + total + ' 棵，完成了 ' + p + '%，完成了多少棵？', total * p / 100, [total * p / 10, total - p, total / p], '完成数量 = 总数×完成率 = ' + total + '×' + p + '%=' + (total * p / 100) + ' 棵。', '方案设计'); }
    if (mode === 3) { var boys = int(r, 2, 6), girls = int(r, 2, 6); if (boys === girls) girls += 1; return mc('男生 ' + boys + ' 份、女生 ' + girls + ' 份，全班 ' + (boys + girls) * 5 + ' 人，男生有多少人？', boys * 5, [girls * 5, boys + girls, 5], '总份数 ' + (boys + girls) + '，一份 5 人，男生 ' + boys + '×5=' + (boys * 5) + ' 人。', '方案设计'); }
    var cost = price * qty;
    return mc('买 ' + qty + ' 件商品共 ' + cost + ' 元，平均每件多少元？', price, [cost, price + qty, price - 1], '单价 = 总价÷数量 = ' + cost + '÷' + qty + '=' + price + ' 元。', '数量关系');
  });

  return MP;
});
