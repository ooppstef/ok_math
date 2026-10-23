/* 六年级上 · 参数化练习（每一题都由代码现算） */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./practice.js'));
  else factory(root.MathPractice);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (MP) {
  'use strict';
  var int = MP.int, pick = MP.pick, mc = MP.mc, choice = MP.choice, fmt = MP.fmt, frac = MP.frac, gcd = MP.gcd, lcm = MP.lcm;

  var POINTS = {
    '六上-L01': ['分数乘法', '求一个数的几分之几', '约分'],
    '六上-L02': ['分数除法', '倒数', '工程问题'],
    '六上-L03': ['比', '比值', '比与除法'],
    '六上-L04': ['按比分配', '份数', '总量'],
    '六上-L05': ['位置与方向', '方向和距离', '相对位置'],
    '六上-L06': ['圆', '圆心', '半径', '直径'],
    '六上-L07': ['圆的面积', '化圆为方', '圆环'],
    '六上-L08': ['扇形', '弧', '圆心角'],
    '六上-L09': ['百分数', '百分率', '分数小数互化'],
    '六上-L10': ['百分数应用', '单位1', '增减'],
    '六上-L11': ['扇形统计图', '百分比', '整体与部分'],
    '六上-L12': ['数与形', '平方数', '奇偶'],
    '六上-L13': ['单位1', '分数应用', '已知部分求整体'],
    '六上-L14': ['分数混合运算', '运算顺序', '简便计算'],
    '六上-L15': ['百分率', '加权平均', '统计判断'],
    '六上-L16': ['连续变化', '逆推', '百分数']
  };
  function reg(id, make) { MP.register(id, POINTS[id], make); }
  var PI = 3.14;

  reg('六上-L01', function (r, i) {
    var a = int(r, 1, 5), b = int(r, 2, 6), c = int(r, 1, 5), d = int(r, 2, 6), mode = (i || 0) % 5;
    if (b <= a) b = a + 1;
    if (d <= c) d = c + 1;
    if (mode === 0) { var N = a * c, D = b * d; return mc(frac(a, b) + ' × ' + frac(c, d) + ' = ？', frac(N, D), [frac(N + 1, D), frac(N, D + 1), frac(N + 1, D + 1)], '分子乘分子，分母乘分母，再约分：' + frac(N, D) + '。', '分数乘法'); }
    if (mode === 1) { var total = b * int(r, 2, 6); return mc(total + ' 的 ' + frac(a, b) + ' 是多少？', total * a / b, [total / b, total * b / a, total - a], '把 ' + total + ' 平均分成 ' + b + ' 份，取 ' + a + ' 份：' + total + '÷' + b + '×' + a + '=' + (total * a / b) + '。', '求一个数的几分之几'); }
    if (mode === 2) return mc(frac(a, b) + ' × ' + b + ' = ？', a, [a * b, frac(a, b), b], '分母和整数约分：' + frac(a, b) + '×' + b + '=' + a + '。', '约分');
    if (mode === 3) return choice('一个正数乘真分数，积（ ）这个数。', ['小于', '大于', '等于', '无法比较'], '小于', '正数乘一个大于 0、小于 1 的数，积比原数小。', '分数乘法');
    return mc(frac(a, b) + ' × 1 = ？', frac(a, b), [frac(a + 1, b), frac(a, b + 1), frac(a + 1, b + 1)], '任何数乘 1 都得它本身。', '分数乘法');
  });

  reg('六上-L02', function (r, i) {
    var a = int(r, 1, 5), b = int(r, 2, 6), c = int(r, 1, 5), d = int(r, 2, 6), mode = (i || 0) % 5;
    if (b <= a) b = a + 1;
    if (d <= c) d = c + 1;
    if (mode === 0) { var N = a * d, D = b * c; return mc(frac(a, b) + ' ÷ ' + frac(c, d) + ' = ？', frac(N, D), [frac(N + 1, D), frac(N, D + 1), frac(N + 1, D + 1)], '除以一个分数，等于乘它的倒数：' + frac(a, b) + '×' + frac(d, c) + '=' + frac(N, D) + '。', '分数除法'); }
    if (mode === 1) return mc(frac(a, b) + ' 的倒数是多少？', frac(b, a), [frac(a, b), b, a], '分子分母交换位置，' + frac(a, b) + ' 的倒数是 ' + frac(b, a) + '。', '倒数');
    if (mode === 2) { var n = int(r, 2, 8); var N = a, D = b * n; return mc(frac(a, b) + ' ÷ ' + n + ' = ？', frac(N, D), [frac(N + 1, D), frac(N, D + 1), frac(N + 1, D + 1)], '除以整数等于乘它的倒数：' + frac(a, b) + '×' + frac(1, n) + '=' + frac(N, D) + '。', '分数除法'); }
    if (mode === 3) { var days = int(r, 3, 9); return mc('一项工程每天完成 ' + frac(1, days) + '，多少天完成？', days, [days + 1, days - 1, 1], '工作总量是 1，1÷' + frac(1, days) + '=' + days + ' 天。', '工程问题'); }
    return choice('修一条路，每天完成整项工程的 ' + frac(a, b) + '。这里把什么看作单位“1”？', ['整条路的工程量', '一天完成的工程量', '还没完成的工程量', '修路的天数'], '整条路的工程量', '每天完成的是整项工程的一部分，所以把全部工程量看作单位“1”。', '工程问题');
  });

  reg('六上-L03', function (r, i) {
    var a = int(r, 2, 9), b = int(r, 2, 9), k = int(r, 2, 5), mode = (i || 0) % 5;
    if (a === b) b += 1;
    if (mode === 0) return mc('把 ' + (a * k) + ':' + (b * k) + ' 化成最简整数比是（ ）。', (a / gcd(a, b)) + ':' + (b / gcd(a, b)), [b + ':' + a, (a * k) + ':' + b, a + ':' + (b * k)], '前项后项同时除以 ' + (k * gcd(a, b)) + '，得 ' + (a / gcd(a, b)) + ':' + (b / gcd(a, b)) + '。', '比');
    if (mode === 1) return mc(a + ':' + b + ' 的比值是多少？', frac(a, b), [frac(b, a), fmt(a / b + 1), a * b], '比值 = 前项÷后项 = ' + a + '÷' + b + '=' + frac(a, b) + '。', '比值');
    if (mode === 2) return choice(a + ':' + b + ' 可以写成（ ）。', [a + '÷' + b, a + '×' + b, a + '+' + b, b + '÷' + a], a + '÷' + b, '比的前项相当于被除数，后项相当于除数。', '比与除法');
    if (mode === 3) { var x = a * k; return mc(a + ':' + b + ' = ' + x + ':?，后项应填几？', b * k, [x, a, b], '前项乘 ' + k + '，后项也乘 ' + k + '，得 ' + (b * k) + '。', '比'); }
    return choice('比的后项可以是 0 吗？', ['不可以', '可以', '有时可以', '看情况'], '不可以', '后项相当于除数，除数不能为 0。', '比与除法');
  });

  reg('六上-L04', function (r, i) {
    var a = int(r, 1, 4), b = int(r, 2, 5), total = (a + b) * int(r, 2, 8), mode = (i || 0) % 5;
    if (a === b) b += 1; total = (a + b) * int(r, 2, 8);
    if (mode === 0) return mc('把 ' + total + ' 按 ' + a + ':' + b + ' 分配，两份分别是多少？', (total / (a + b) * a) + ' 和 ' + (total / (a + b) * b), [(total / (a + b)) + ' 和 ' + (total / (a + b)), frac(total, a) + ' 和 ' + frac(total, b), (total * a) + ' 和 ' + (total * b)], '总份数 ' + (a + b) + '，一份 ' + total + '÷' + (a + b) + '=' + (total / (a + b)) + '。', '按比分配');
    if (mode === 1) return mc('按 ' + a + ':' + b + ' 分配，第一份是 ' + (total / (a + b) * a) + '，第二份是多少？', total / (a + b) * b, [total / (a + b) * a, total, total / (a + b)], '总份数 ' + (a + b) + '，第二份占 ' + b + ' 份，得 ' + (total / (a + b) * b) + '。', '份数');
    if (mode === 2) return mc('两数比是 ' + a + ':' + b + '，第一份是 ' + (total / (a + b) * a) + '，总数是多少？', total, [total / (a + b) * b, total / (a + b), total * a], '第一份占 ' + a + ' 份，一份是 ' + (total / (a + b)) + '，总数 ' + total + '。', '总量');
    if (mode === 3) return mc('两数比是 ' + a + ':' + b + '，两份相差 ' + (total / (a + b) * Math.abs(a - b)) + '，总数是多少？', total, [total / (a + b) * b, total / (a + b), total * b], '相差 ' + Math.abs(a - b) + ' 份，一份是 ' + (total / (a + b)) + '，总数 ' + total + '。', '按比分配');
    return choice('按比分配时，第一步通常先求（ ）。', ['总份数和一份的量', '较大的数', '较小的数', '平均数'], '总份数和一份的量', '先求总份数，再求一份，最后分到各份。', '份数');
  });

  reg('六上-L05', function (r, i) {
    var d = int(r, 2, 9), mode = (i || 0) % 5;
    if (mode === 0) return choice('“北偏东 30°”表示从（ ）开始，向东偏 30°。', ['正北方向', '正东方向', '正南方向', '正西方向'], '正北方向', '北偏东，先指向北，再向东偏。', '方向和距离');
    if (mode === 1) return choice('A 在 B 的北偏东 30° 方向，那么 B 在 A 的（ ）方向。', ['南偏西 30°', '北偏西 30°', '南偏东 30°', '北偏东 30°'], '南偏西 30°', '方向相反、角度相同。', '相对位置');
    if (mode === 2) return mc('从学校向北走 ' + d + ' 千米，再向东走 ' + (d + 2) + ' 千米，一共走了多少千米？', 2 * d + 2, [d + 2, d * (d + 2), 2 * d], '两段路程相加：' + d + '+' + (d + 2) + '=' + (2 * d + 2) + ' 千米。', '位置与方向');
    if (mode === 3) return choice('只说方向，能确定一个点的位置吗？', ['不能，还要知道距离', '能', '一定能', '看方向'], '不能，还要知道距离', '方向和距离都确定，位置才唯一。', '方向和距离');
    return choice('地图上通常用“上北下南、左西右东”，东北方向在（ ）。', ['右上角', '左上角', '右下角', '左下角'], '右上角', '上北右东，东北在右上角。', '位置与方向');
  });

  reg('六上-L06', function (r, i) {
    var rr = int(r, 2, 9), mode = (i || 0) % 5;
    if (mode === 0) return mc('圆的半径是 ' + rr + ' 厘米，直径是多少？', 2 * rr, [rr, 4 * rr, rr + 2], '直径 = 半径×2 = ' + rr + '×2=' + (2 * rr) + ' 厘米。', '直径');
    if (mode === 1) return mc('圆的直径是 ' + (2 * rr) + ' 厘米，半径是多少？', rr, [2 * rr, 4 * rr, rr + 1], '半径 = 直径÷2 = ' + (2 * rr) + '÷2=' + rr + ' 厘米。', '半径');
    if (mode === 2) return mc('半径 ' + rr + ' 厘米的圆，周长是多少？（π 取 3.14）', fmt(2 * PI * rr), [fmt(PI * rr * rr), fmt(PI * rr), fmt(2 * rr)], '周长 = 2πr = 2×3.14×' + rr + '=' + fmt(2 * PI * rr) + ' 厘米。', '圆');
    if (mode === 3) return choice('画圆时，圆规针尖固定的位置是圆的（ ）。', ['圆心', '半径', '直径', '周长'], '圆心', '针尖固定在圆心，笔尖绕着它转。针尖的位置决定圆画在哪里。', '圆心');
    return choice('圆有几条对称轴？', ['无数条', '1 条', '2 条', '4 条'], '无数条', '任何一条过圆心的直线都是对称轴。', '圆');
  });

  reg('六上-L07', function (r, i) {
    var rr = int(r, 2, 9), R = rr + int(r, 1, 5), mode = (i || 0) % 5;
    if (mode === 0) return mc('半径 ' + rr + ' 厘米的圆，面积是多少？（π 取 3.14）', fmt(PI * rr * rr), [fmt(2 * PI * rr), fmt(PI * rr), fmt(2 * rr)], '面积 = πr² = 3.14×' + rr + '²=' + fmt(PI * rr * rr) + ' 平方厘米。', '圆的面积');
    if (mode === 1) return mc('直径 ' + (2 * rr) + ' 厘米的圆，面积是多少？（π 取 3.14）', fmt(PI * rr * rr), [fmt(PI * 2 * rr * 2 * rr), fmt(2 * PI * rr), fmt(PI * rr)], '先求半径 ' + rr + ' 厘米，再算 πr² = ' + fmt(PI * rr * rr) + '。', '圆的面积');
    if (mode === 2) return mc('外圆半径 ' + R + ' 厘米、内圆半径 ' + rr + ' 厘米的圆环，面积是多少？（π 取 3.14）', fmt(PI * (R * R - rr * rr)), [fmt(PI * (R * R + rr * rr)), fmt(PI * (R - rr) * (R - rr)), fmt(2 * PI * (R - rr))], '圆环面积 = π(R²−r²) = 3.14×(' + (R * R) + '−' + (rr * rr) + ')=' + fmt(PI * (R * R - rr * rr)) + '。', '圆环');
    if (mode === 3) return choice('半径扩大到原来的 2 倍，圆的面积扩大到原来的（ ）。', ['4 倍', '2 倍', '8 倍', '不变'], '4 倍', '面积与半径的平方成正比，2²=4。', '化圆为方');
    return choice('把圆平均分成若干份，拼成一个近似长方形，这个长方形的长相当于（ ）。', ['圆周长的一半', '圆的直径', '圆的半径', '圆的面积'], '圆周长的一半', '拼成的长方形长是 πr，正好是圆周长的一半。', '化圆为方');
  });

  reg('六上-L08', function (r, i) {
    var parts = pick(r, [2, 4, 8]), mode = (i || 0) % 5;
    if (mode === 0) return mc('把一个圆沿半径平均分成 ' + parts + ' 个扇形，每个扇形占整个圆的几分之几？', frac(1, parts), [frac(1, parts + 1), frac(1, parts + 2), frac(2, parts)], '平均分成 ' + parts + ' 份，每份就是整个圆的 ' + frac(1, parts) + '。', '扇形');
    if (mode === 1) return choice('圆心角的顶点在哪里？', ['圆心', '圆上', '圆外', '圆内任意一点'], '圆心', '两条半径在圆心相交，夹出的角叫圆心角。', '圆心角');
    if (mode === 2) return choice('扇形由两条半径和一段什么围成？', ['弧', '直径', '直线', '折线'], '弧', '两条半径是直边，圆上的一段弧是弯边。', '弧');
    if (mode === 3) return choice('同一个圆的两个扇形，一个占二分之一，另一个占四分之一，哪个面积大？', ['占二分之一的', '占四分之一的', '一样大', '无法比较'], '占二分之一的', '同一个圆里，二分之一包含两个四分之一，所以面积更大。', '扇形');
    return choice('同一个圆中，圆心角越大，所选扇形的面积怎样变？', ['越大', '越小', '不变', '无法比较'], '越大', '两条半径的开口张大，扇形占的部分也变大。', '圆心角');
  });
  reg('六上-L09', function (r, i) {
    var p = int(r, 5, 95), mode = (i || 0) % 5;
    if (mode === 0) return mc('0.' + (p < 10 ? '0' + p : p) + ' 写成百分数是（ ）。', p + '%', [p / 10 + '%', p * 10 + '%', p + '‰'], '小数乘 100 再加百分号：' + p + '%。', '分数小数互化');
    if (mode === 1) { var n = int(r, 1, 3), d = 4; var pv = n * 100 / d; return mc(frac(n, d) + ' 写成百分数是（ ）。', pv + '%', [(pv + 1) + '%', (pv - 1) + '%', (pv * 2) + '%'], frac(n, d) + '=' + (n / d) + '=' + pv + '%。', '百分数'); }
    if (mode === 2) { var total = int(r, 2, 10) * 10; return mc(total + ' 的 ' + p + '% 是多少？', total * p / 100, [total * p / 10, total / p, total - p], total + '×' + p + '%=' + (total * p / 100) + '。', '百分数'); }
    if (mode === 3) return choice(p + '% 表示（ ）。', ['百分之' + p, '千分之' + p, p + ' 个一', '百分之' + (p === 50 ? p + 1 : 100 - p)], '百分之' + p, '百分数表示一个数是另一个数的百分之几。', '百分率');
    return choice('百分数能带单位吗？', ['不能', '能', '有时能', '看情况'], '不能', '百分数表示两个数的倍比关系，不带单位。', '百分数');
  });

  reg('六上-L10', function (r, i) {
    var base = int(r, 20, 200), p = pick(r, [10, 20, 25, 30, 40, 50]), mode = (i || 0) % 5;
    if (mode === 0) return mc(base + ' 增加 ' + p + '% 后是多少？', base * (100 + p) / 100, [base * p / 100, base * (100 - p) / 100, base + p], '增加后的量 = ' + base + '×（1+' + p + '%）=' + (base * (100 + p) / 100) + '。', '百分数应用');
    if (mode === 1) return mc(base + ' 减少 ' + p + '% 后是多少？', base * (100 - p) / 100, [base * p / 100, base * (100 + p) / 100, base - p], '减少后的量 = ' + base + '×（1−' + p + '%）=' + (base * (100 - p) / 100) + '。', '增减');
    if (mode === 2) { var after = base * (100 + p) / 100; return mc('一个数增加 ' + p + '% 后是 ' + fmt(after) + '，原数是多少？', base, [after, after * (1 - p / 100), base + p], '原数 = ' + fmt(after) + '÷（1+' + p + '%）=' + base + '。', '单位1'); }
    if (mode === 3) { var price = int(r, 50, 300), off = pick(r, [6, 7, 8, 9]); return mc('原价 ' + price + ' 元，打 ' + off + ' 折后是多少元？', price * off / 10, [price * off / 100, price * (10 - off) / 10, price - off], '打 ' + off + ' 折就是原价的 ' + (off * 10) + '%，' + price + '×' + (off / 10) + '=' + (price * off / 10) + ' 元。', '百分数应用'); }
    return choice('“今年比去年增产 20%”，这里把（ ）看作单位“1”。', ['去年的产量', '今年的产量', '增产的部分', '总产量'], '去年的产量', '“比去年”中，去年是单位“1”。', '单位1');
  });

  reg('六上-L11', function (r, i) {
    var total = int(r, 2, 10) * 50, p = pick(r, [10, 20, 25, 30, 40, 50]), mode = (i || 0) % 5;
    if (mode === 0) return mc('扇形统计图中，某部分占 ' + p + '%，总数是 ' + total + '，这部分是多少？', total * p / 100, [total * p / 10, total - p, total / p], total + '×' + p + '%=' + (total * p / 100) + '。', '百分比');
    if (mode === 1) return mc('扇形统计图中，某部分占 ' + p + '%，其余部分一共占百分之几？', (100 - p) + '%', [(100 - p - 1) + '%', (100 + p) + '%', (100 - p + 1) + '%'], '整个圆代表 100%，其余部分占 100%−' + p + '%=' + (100 - p) + '%。', '扇形统计图');
    if (mode === 2) return choice('扇形统计图适合表示（ ）。', ['各部分占整体的百分比', '数量的增减变化', '具体数量的多少', '两个数的差'], '各部分占整体的百分比', '扇形统计图看部分与整体的关系。', '整体与部分');
    if (mode === 3) return choice('两个扇形统计图中，画得更大的扇形一定代表更多数量吗？', ['不一定，要用各自的总数乘所占百分比', '能，直接看扇形', '能，圆大的扇形一定大', '无法比较'], '不一定，要用各自的总数乘所占百分比', '图画得多大不代表数量多少；要分别用总数乘所占百分比，再比较。', '扇形统计图');
    return mc('扇形统计图中所有部分加起来是（ ）。', '100%', ['90%', '180%', '360%'], '各部分百分比之和是 100%。', '百分比');
  });

  reg('六上-L12', function (r, i) {
    var n = int(r, 3, 10), mode = (i || 0) % 5;
    if (mode === 0) return mc('1+3+5+…+（2×' + n + '−1）= ？', n * n, [n * (n + 1), 2 * n, n * n + n], '从 1 开始的连续奇数之和等于项数的平方：' + n + '²=' + (n * n) + '。', '平方数');
    if (mode === 1) return mc('按 1、4、9、16……排列，第 ' + n + ' 个平方数是多少？', n * n, [n * (n + 1), 2 * n, n * n + 1], '第 ' + n + ' 个平方数是 ' + n + '×' + n + '=' + (n * n) + '。', '平方数');
    if (mode === 2) return mc('在 ' + n + '×' + n + ' 的方格图外再添一层 L 形，需要添多少个小正方形？', 2 * n + 1, [2 * n, n * n, 2 * n - 1], '新一层每边 ' + (n + 1) + ' 个，L 形需要 2×' + n + '+1=' + (2 * n + 1) + ' 个。', '数与形');
    if (mode === 3) return choice('两个连续奇数的和一定是（ ）。', ['偶数', '奇数', '质数', '平方数'], '偶数', '奇数+奇数=偶数。', '奇偶');
    return mc('1+3+5+7+9 = ？', 25, [20, 30, 24], '5 个连续奇数相加，等于 5²=25。', '数与形');
  });

  reg('六上-L13', function (r, i) {
    var n = int(r, 1, 4), d = pick(r, [3, 4, 5, 6]), whole = d * int(r, 4, 12), mode = (i || 0) % 5;
    if (n >= d) n = d - 1;
    var part = whole * n / d;
    if (mode === 0) return mc('整体是 ' + whole + '，它的 ' + frac(n, d) + ' 是多少？', part, [whole / d, whole - part, whole * d / n], '求一个数的几分之几，用乘法：' + whole + '×' + frac(n, d) + '=' + part + '。', '分数应用');
    if (mode === 1) return mc('一个数的 ' + frac(n, d) + ' 是 ' + part + '，这个数是多少？', whole, [part, part * d / n, whole + n], '已知部分求整体，用除法：' + part + '÷' + frac(n, d) + '=' + whole + '。', '已知部分求整体');
    if (mode === 2) return mc('一个数的 ' + frac(n, d) + ' 是 ' + part + '，这个数的 ' + frac(1, d) + ' 是多少？', whole / d, [part, whole, part / d], '先求整体 ' + whole + '，再求它的 ' + frac(1, d) + '：' + whole + '÷' + d + '=' + (whole / d) + '。', '单位1');
    if (mode === 3) return choice('“男生人数是女生的 ' + frac(n, d) + '”，单位“1”是（ ）。', ['女生人数', '男生人数', '全班人数', '男女生之差'], '女生人数', '“是女生的几分之几”，女生是单位“1”。', '单位1');
    return mc('比 ' + whole + ' 多它的 ' + frac(n, d) + ' 的数是多少？', whole + part, [part, whole - part, whole * n], '先求多的部分 ' + part + '，再加上整体 ' + whole + '，得 ' + (whole + part) + '。', '分数应用');
  });

  reg('六上-L14', function (r, i) {
    var a = int(r, 1, 5), b = int(r, 2, 6), c = int(r, 1, 5), d = int(r, 2, 6), mode = (i || 0) % 5;
    if (b <= a) b = a + 1;
    if (d <= c) d = c + 1;
    if (mode === 0) { var N = a * 2 * d + c * b, D = b * 2 * d; return mc(frac(a, b) + ' + ' + frac(c, d) + ' × ' + frac(1, 2) + ' = ？', frac(N, D), [frac(N + 1, D), frac(N, D + 1), frac(N + 1, D + 1)], '先算乘法 ' + frac(c, 2 * d) + '，再与 ' + frac(a, b) + ' 相加，得 ' + frac(N, D) + '。', '运算顺序'); }
    if (mode === 1) return mc('(' + frac(a, b) + ' + ' + frac(c, d) + ') × ' + lcm(b, d) + ' = ？', a * (lcm(b, d) / b) + c * (lcm(b, d) / d), [a + c, a * c, lcm(b, d)], '用分配律：' + a + '×' + (lcm(b, d) / b) + '+' + c + '×' + (lcm(b, d) / d) + '=' + (a * (lcm(b, d) / b) + c * (lcm(b, d) / d)) + '。', '简便计算');
    if (mode === 2) { var N = a * (c + 1), D = b * d; return mc(frac(a, b) + ' × ' + frac(c, d) + ' + ' + frac(a, b) + ' × ' + frac(1, d) + ' = ？', frac(N, D), [frac(N + 1, D), frac(N, D + 1), frac(N + 1, D + 1)], '提取 ' + frac(a, b) + '：' + frac(a, b) + '×(' + frac(c, d) + '+' + frac(1, d) + ')=' + frac(N, D) + '。', '简便计算'); }
    if (mode === 3) return choice('分数混合运算的顺序是（ ）。', ['先乘除后加减，有括号先算括号', '从左往右', '先加减后乘除', '先算分母'], '先乘除后加减，有括号先算括号', '和整数混合运算顺序相同。', '运算顺序');
    var N = b * d - a * c, D = b * d;
    return mc('1 − ' + frac(a, b) + ' × ' + frac(c, d) + ' = ？', frac(N, D), [frac(N + 1, D), frac(N, D + 1), frac(N + 1, D + 1)], '先算乘法得 ' + frac(a * c, b * d) + '，再用 1 减，得 ' + frac(N, D) + '。', '分数混合运算');
  });

  reg('六上-L15', function (r, i) {
    var a = int(r, 20, 40), b = int(r, 20, 40), pa = int(r, 60, 95), pb = int(r, 60, 95), mode = (i || 0) % 5;
    if (mode === 0) { var passed = Math.round(a * pa / 100), roundedRate = Math.round(passed / a * 100); return mc(a + ' 人中有 ' + passed + ' 人达标，达标率约是多少（四舍五入到 1%）？', roundedRate + '%', [(roundedRate + 1) + '%', (roundedRate - 1) + '%', (roundedRate + 2) + '%'], '达标率 = ' + passed + '÷' + a + '×100%，约是 ' + roundedRate + '%。', '百分率'); }
    if (mode === 1) return choice('两个班人数不相同，合起来的达标率应该怎样算？', ['总达标人数÷总人数×100%', '两个达标率相加后除以 2', '用较高的那个达标率', '用较低的那个达标率'], '总达标人数÷总人数×100%', '先合计达标人数和总人数，再相除，不能把两个班当作人数相同的两份。', '加权平均');
    if (mode === 2) { var total = a + b, pass = Math.round(a * pa / 100) + Math.round(b * pb / 100); var rate = Math.round(pass / total * 100); return mc('一班 ' + a + ' 人达标 ' + Math.round(a * pa / 100) + ' 人，二班 ' + b + ' 人达标 ' + Math.round(b * pb / 100) + ' 人。两班合起来的达标率约是多少（四舍五入到 1%）？', rate + '%', [(rate + 1) + '%', (rate - 1) + '%', (rate + 2) + '%'], '总达标 ' + pass + ' 人，总人数 ' + total + '，达标率约是 ' + rate + '%。', '百分率'); }
    if (mode === 3) return choice('比较两个班的达标情况，只看达标率而不看人数，可能（ ）。', ['得出片面结论', '一定正确', '没有影响', '更准确'], '得出片面结论', '人数很少时，一个学生的变化就会让百分率大幅波动。', '统计判断');
    var students = 40, percent = pick(r, [60, 65, 70, 75, 80, 85, 90, 95]);
    return mc('某班 ' + students + ' 人，达标率 ' + percent + '%，达标人数是多少？', students * percent / 100, [students, students * (100 - percent) / 100, percent], students + '×' + percent + '%=' + (students * percent / 100) + ' 人。', '百分率');
  });

  reg('六上-L16', function (r, i) {
    var base = int(r, 50, 200), p = pick(r, [10, 20, 25, 50]), mode = (i || 0) % 5;
    if (mode === 0) { return mc('一个数先增加 ' + p + '%，再减少 ' + p + '%，最后是原来的百分之几？', fmt((100 + p) * (100 - p) / 100) + '%', ['100%', (100 + p) + '%', (100 - p) + '%'], '先乘（1+' + p + '%），再乘（1−' + p + '%），结果是原来的 ' + fmt((100 + p) * (100 - p) / 100) + '%。', '连续变化'); }
    if (mode === 1) { var after = base * (100 + p) / 100; return mc('一个数增加 ' + p + '% 后是 ' + fmt(after) + '，原数是多少？', base, [after, after * (1 - p / 100), base + p], '原数 = ' + fmt(after) + '÷（1+' + p + '%）=' + base + '。', '逆推'); }
    if (mode === 2) { var after2 = base * (100 - p) / 100; return mc('一个数减少 ' + p + '% 后是 ' + fmt(after2) + '，原数是多少？', base, [after2, after2 * (1 + p / 100), base - p], '原数 = ' + fmt(after2) + '÷（1−' + p + '%）=' + base + '。', '逆推'); }
    if (mode === 3) return choice('“先涨 20% 再降 20%”，最后的价格与原价相比（ ）。', ['比原价低', '比原价高', '一样', '无法判断'], '比原价低', '两次的 20% 对应的整体不同，最后是原价的 96%。', '连续变化');
    return choice('连续变化问题中，每次变化对应的“1”是（ ）。', ['变化前的量', '最初的总量', '变化后的量', '固定的数'], '变化前的量', '每一次变化都以变化前的量为单位“1”。', '百分数');
  });

  return MP;
});
