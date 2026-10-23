(function () {
  'use strict';
  var MP = window.MathPractice;
  if (!MP) return;

  function render() {
    var list = MP.weakSummary();
    var byLesson = Object.create(null);
    list.forEach(function (w) { (byLesson[w.lesson] || (byLesson[w.lesson] = [])).push(w); });

    Array.prototype.forEach.call(document.querySelectorAll('[data-weak-for]'), function (el) {
      var arr = byLesson[el.getAttribute('data-weak-for')] || [];
      el.textContent = arr.length ? arr.map(function (w) { return w.point; }).join('、') : '';
      el.classList.toggle('has-weak', arr.length > 0);
    });

    var total = document.querySelector('[data-practice-total]');
    if (total) total.textContent = String(list.length);
    var detail = document.querySelector('[data-practice-detail]');
    if (detail) {
      detail.textContent = list.length
        ? '下面标出的课还有知识点没有消掉，点课名进入练习。'
        : '还没有薄弱点。做错一题就会记在这里，同一知识点连对 2 次才消除。';
    }
  }

  var clear = document.querySelector('[data-practice-clear]');
  if (clear) {
    clear.addEventListener('click', function () {
      if (window.confirm('清空这台设备上的全部练习记录？')) {
        MP.clearAll();
        render();
      }
    });
  }

  render();
  window.addEventListener('pageshow', render);
})();
