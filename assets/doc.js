(function () {
  // 阅读进度
  var bar = document.querySelector('.progress span');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
    if (bar) bar.style.width = (p * 100).toFixed(2) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 目录高亮
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  if (links.length) {
    var heads = links.map(function (a) {
      var id = a.getAttribute('href');
      return id && id.charAt(0) === '#' ? document.getElementById(id.slice(1)) : null;
    }).filter(Boolean);

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var id = '#' + e.target.id;
          links.forEach(function (l) {
            l.classList.toggle('active', l.getAttribute('href') === id);
          });
        });
      }, { rootMargin: '-90px 0px -72% 0px', threshold: 0 });
      heads.forEach(function (h) { obs.observe(h); });
    }
  }

  // 视频：先显示封面，点击后再加载控件并播放
  document.querySelectorAll('.video-play').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var v = document.getElementById(btn.dataset.target);
      if (!v) return;
      btn.classList.add('hidden');
      v.controls = true;
      v.play();
    });
  });

  // 打印
  document.querySelectorAll('.print-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { window.print(); });
  });
})();
