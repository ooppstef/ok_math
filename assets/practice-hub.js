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
        ? '可以再练练下面标出的知识点，点课名开始。'
        : '暂时没有需要重练的知识点。以后做错题，会把对应的知识点记在这里。';
    }
  }

  var clear = document.querySelector('[data-practice-clear]');
  if (clear) {
    clear.addEventListener('click', function () {
      if (window.confirm('清空这个浏览器里的全部练习记录？')) {
        MP.clearAll();
        render();
      }
    });
  }

  render();
  window.addEventListener('pageshow', render);
})();
