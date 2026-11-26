/* ACPS Cultural Club — shared script (mobile menu + scroll reveal) */
(function () {
  /* Mobile menu */
  var btn = document.querySelector('.menu-btn');
  var links = document.querySelector('.nav-links');
  if (btn && links) {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        links.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  }

  /* Segment filter (events page) */
  var chips = document.querySelectorAll('.seg-chip');
  var segs = document.querySelectorAll('.seg-card');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      segs.forEach(function (card) {
        var show = f === 'all' || card.getAttribute('data-cat') === f;
        card.hidden = !show;
        if (show) {
          card.classList.add('in-view');
          card.classList.remove('pop');
          void card.offsetWidth;
          card.classList.add('pop');
        }
      });
    });
  });

  /* Scroll reveal */
  var cards = document.querySelectorAll(
    '.highlight-card, .member-card, .advisor-card, .gallery-tile, .photo-card, .event-row, ' +
    '.seg-card, .cat-card, .summit-facts > div, .register-box, .mission-grid > div, .teaser-grid > div, .contact-grid > div, .info-item'
  );
  var heads = document.querySelectorAll('section h2, .sub-head');

  if (!('IntersectionObserver' in window)) {
    cards.forEach(function (el) { el.classList.add('in-view'); });
    heads.forEach(function (el) { el.classList.add('in-view'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        el.classList.add('in-view');
        io.unobserve(el);
        setTimeout(function () { el.style.transitionDelay = ''; }, 1000);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  cards.forEach(function (el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 4) * 0.06 + 's';
    io.observe(el);
  });
  heads.forEach(function (el) { io.observe(el); });

})();


/* Gallery lightbox: click a photo to view it large */
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('.photo-card'));
  if (!cards.length) return;

  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Photo viewer');
  box.innerHTML =
    '<button class="lb-close" aria-label="Close">&times;</button>' +
    '<button class="lb-prev" aria-label="Previous photo">&#8249;</button>' +
    '<img alt="">' +
    '<button class="lb-next" aria-label="Next photo">&#8250;</button>' +
    '<div class="lightbox-cap"></div>';
  document.body.appendChild(box);

  var img = box.querySelector('img');
  var cap = box.querySelector('.lightbox-cap');
  var group = [], index = 0, opener = null;

  function show(i) {
    index = (i + group.length) % group.length;
    var src = group[index].querySelector('img');
    var album = group[index].closest('.album');
    var title = album ? album.querySelector('h2').textContent : '';
    img.src = src.currentSrc || src.src;
    img.alt = src.alt || title;
    cap.innerHTML = '';
    cap.appendChild(document.createTextNode(title));
    if (group.length > 1) {
      var s = document.createElement('small');
      s.textContent = (index + 1) + ' / ' + group.length;
      cap.appendChild(s);
    }
  }
  function open(card) {
    var grid = card.parentElement;
    group = cards.filter(function (c) { return c.parentElement === grid; });
    opener = card;
    box.classList.toggle('single', group.length < 2);
    show(group.indexOf(card));
    box.classList.add('open');
    document.body.classList.add('lb-lock');
    box.querySelector('.lb-close').focus();
  }
  function close() {
    box.classList.remove('open');
    document.body.classList.remove('lb-lock');
    if (opener) opener.focus();
  }

  cards.forEach(function (card) {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'View photo larger');
    card.addEventListener('click', function () { open(card); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); }
    });
  });

  box.addEventListener('click', function (e) {
    if (e.target === box) close();
  });
  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', function () { show(index - 1); });
  box.querySelector('.lb-next').addEventListener('click', function () { show(index + 1); });
  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft' && group.length > 1) show(index - 1);
    else if (e.key === 'ArrowRight' && group.length > 1) show(index + 1);
  });
})();
