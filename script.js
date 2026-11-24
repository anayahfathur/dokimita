/* ==========================================================
   SCRIPT WEBSITE DOKIMITA
   Isi: menu HP, animasi muncul, cari/filter menu, keranjang pesanan WhatsApp.
   Nomor WhatsApp & alamat store diubah di bagian KONFIGURASI di bawah ini.
   ========================================================== */
(function () {
  'use strict';

  /* ---------- KONFIGURASI ---------- */
  var WA_NUMBER = '6282158764991';
  var STORAGE_KEY = 'dokimita-pesanan-v1';
  var MURAH_BATAS = 20000; // filter "Di bawah Rp20rb"
  /* --------------------------------- */

  var doc = document;
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function rupiah(n) { return 'Rp' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function el(tag, cls, text) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  /* ==========================================================
     1. HEADER: menu HP, bayangan saat scroll, tombol ke atas, menu aktif
     ========================================================== */
  var header = $('.top');
  var burger = $('#burger');
  var nav = $('#nav');
  var toTop = $('#totop');

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('open');
    if (burger) { burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Buka menu'); }
  }
  if (burger && nav) {
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeNav(); });
    doc.addEventListener('click', function (e) { if (!e.target.closest('.top')) closeNav(); });
  }

  var sectionIds = ['beranda', 'produk', 'tentang', 'testimoni', 'kontak'];
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.pageYOffset || doc.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', y > 8);
    if (toTop) toTop.classList.toggle('show', y > 700);
    var current = sectionIds[0];
    sectionIds.forEach(function (id) {
      var s = doc.getElementById(id);
      if (s && s.getBoundingClientRect().top <= 150) current = id;
    });
    $$('.menu a').forEach(function (a) {
      var on = a.getAttribute('href') === '#' + current;
      if (!a.classList.contains('cta-nav')) a.classList.toggle('aktif', on);
    });
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ==========================================================
     2. ANIMASI MUNCUL SAAT SCROLL
     ========================================================== */
  (function () {
    var targets = $$('.judul, .fav, .menu-wrap, .cerita .wrap > *, .step, .testi, .cta-box, .kartu, .catatan-order, .band .aksi');
    if (!targets.length) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;
    targets.forEach(function (t) {
      var sibs = $$(':scope > *', t.parentNode).filter(function (s) { return targets.indexOf(s) > -1; });
      var d = Math.min(sibs.indexOf(t) * 0.08, 0.4);
      t.style.setProperty('--d', d + 's');
      t.classList.add('rv');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target;
        t.classList.add('in');
        io.unobserve(t);
        // lepas kelas animasi setelah selesai supaya efek hover tetap jalan
        window.setTimeout(function () { t.classList.remove('rv', 'in'); t.style.removeProperty('--d'); }, 1200);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (t) { io.observe(t); });
  })();

  /* ==========================================================
     3. CARI & FILTER MENU
     ========================================================== */
  (function () {
    var rows = $$('.row[data-name]');
    var input = $('#cariMenu');
    var chips = $$('.fchip');
    var hint = $('#hasil');
    var pD = $('.p-d'), pT = $('.p-t');
    var tabD = $('#tab-d'), tabT = $('#tab-t');
    if (!rows.length || !input) return;
    var q = '', filt = 'semua';

    function apply() {
      var cD = 0, cT = 0;
      rows.forEach(function (r) {
        var name = r.getAttribute('data-name').toLowerCase();
        var price = parseInt(r.getAttribute('data-price'), 10) || 0;
        var tags = ' ' + (r.getAttribute('data-tags') || '') + ' ';
        var okQ = !q || name.indexOf(q) > -1 || tags.indexOf(' ' + q + ' ') > -1;
        var okF = filt === 'semua' || (filt === 'murah' ? price < MURAH_BATAS : tags.indexOf(' ' + filt + ' ') > -1);
        var show = okQ && okF;
        r.classList.toggle('sembunyi', !show);
        if (show) { if (pD.contains(r)) cD++; else cT++; }
      });
      pD.classList.toggle('nol', cD === 0);
      pT.classList.toggle('nol', cT === 0);
      if (tabD.checked && cD === 0 && cT > 0) tabT.checked = true;
      else if (tabT.checked && cT === 0 && cD > 0) tabD.checked = true;
      if (hint) {
        hint.textContent = (q || filt !== 'semua')
          ? (cD + cT) + ' menu cocok (Dorayaki ' + cD + ', Takoyaki ' + cT + ')'
          : '';
      }
    }
    input.addEventListener('input', function () { q = input.value.trim().toLowerCase(); apply(); });
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        filt = c.getAttribute('data-filter');
        chips.forEach(function (x) { x.classList.toggle('aktif', x === c); x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        apply();
      });
    });
  })();

  /* ==========================================================
     4. KERANJANG PESANAN -> WHATSAPP
     ========================================================== */
  (function () {
    var buttons = $$('a.add[data-name]');
    if (!buttons.length) return;

    // katalog harga dibaca dari tombol di halaman (satu sumber data)
    var catalog = {};
    buttons.forEach(function (b) {
      var name = b.getAttribute('data-name');
      var price = parseInt(b.getAttribute('data-price'), 10);
      if (name && price > 0) catalog[name] = { price: price, unit: b.getAttribute('data-unit') || 'pcs' };
    });

    var cartbar = $('#cartbar'), sheet = $('#sheet'), backdrop = $('#sheetBackdrop');
    var list = $('#cartList'), kirim = $('#kirim'), toast = $('#toast');
    var nameInput = $('#custName'), noteInput = $('#custNote');
    var cart = [];

    function save() { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) {} }
    function load() {
      try {
        var d = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
        if (!Array.isArray(d)) return [];
        return d.filter(function (it) { return it && catalog[it.name]; }).map(function (it) {
          var qty = Math.max(1, Math.min(99, parseInt(it.qty, 10) || 1));
          return { name: it.name, price: catalog[it.name].price, unit: catalog[it.name].unit, qty: qty };
        });
      } catch (e) { return []; }
    }
    function count() { return cart.reduce(function (s, i) { return s + i.qty; }, 0); }
    function total() { return cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0); }
    function find(name) { for (var i = 0; i < cart.length; i++) if (cart[i].name === name) return cart[i]; return null; }

    function buildMessage() {
      var lines = ['Halo Dokimita, saya mau pesan:', ''];
      cart.forEach(function (it, i) {
        lines.push((i + 1) + '. ' + it.qty + 'x ' + it.name + ' (' + rupiah(it.price) + '/' + it.unit + ') = ' + rupiah(it.price * it.qty));
      });
      lines.push('', 'Total: ' + rupiah(total()));
      var nm = nameInput.value.trim(), nt = noteInput.value.trim();
      if (nm) lines.push('Nama: ' + nm);
      if (nt) lines.push('Catatan: ' + nt);
      lines.push('', 'Saya ambil di store ya. Terima kasih!');
      return lines.join('\n');
    }
    function updateLink() {
      if (!cart.length) { kirim.setAttribute('href', '#'); kirim.setAttribute('aria-disabled', 'true'); return; }
      kirim.setAttribute('href', 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(buildMessage()));
      kirim.setAttribute('aria-disabled', 'false');
    }

    function render() {
      var n = count(), t = total();
      $('#cartCount').textContent = n;
      $('#cartTotal').textContent = rupiah(t);
      $('#sheetTotal').textContent = rupiah(t);
      cartbar.classList.toggle('show', n > 0);
      doc.body.classList.toggle('has-cart', n > 0);
      while (list.firstChild) list.removeChild(list.firstChild);
      if (!cart.length) {
        var li0 = el('li', 'kosongcart', 'Belum ada pesanan. Tap tombol + pada menu untuk menambah.');
        list.appendChild(li0);
      }
      cart.forEach(function (it) {
        var li = el('li', 'ci');
        li.setAttribute('data-name', it.name);
        var t1 = el('div', 't');
        t1.appendChild(el('b', '', it.name));
        t1.appendChild(el('small', '', rupiah(it.price) + ' / ' + it.unit));
        var r = el('div', 'r');
        r.appendChild(el('span', 'sub', rupiah(it.price * it.qty)));
        var q = el('div', 'qty');
        var minus = el('button', '', '−'); minus.type = 'button'; minus.setAttribute('data-act', 'dec'); minus.setAttribute('aria-label', 'Kurangi ' + it.name);
        var num = el('span', '', String(it.qty));
        var plus = el('button', '', '+'); plus.type = 'button'; plus.setAttribute('data-act', 'inc'); plus.setAttribute('aria-label', 'Tambah ' + it.name);
        q.appendChild(minus); q.appendChild(num); q.appendChild(plus);
        r.appendChild(q);
        li.appendChild(t1); li.appendChild(r);
        list.appendChild(li);
      });
      updateLink();
      save();
      if (!cart.length && sheet.classList.contains('open')) closeSheet();
    }

    var toastTimer;
    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add('show');
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(function () { toast.classList.remove('show'); }, 1800);
    }

    function add(name) {
      var it = find(name);
      if (it) it.qty = Math.min(99, it.qty + 1);
      else cart.push({ name: name, price: catalog[name].price, unit: catalog[name].unit, qty: 1 });
      render();
      cartbar.classList.remove('bump'); void cartbar.offsetWidth; cartbar.classList.add('bump');
      showToast('✓ ' + name + ' ditambahkan');
    }

    function openSheet() {
      sheet.classList.add('open'); backdrop.classList.add('open');
      sheet.setAttribute('aria-hidden', 'false');
      doc.body.classList.add('sheet-open');
      window.setTimeout(function () { var c = $('#sheetClose'); if (c) c.focus(); }, 50);
    }
    function closeSheet() {
      sheet.classList.remove('open'); backdrop.classList.remove('open');
      sheet.setAttribute('aria-hidden', 'true');
      doc.body.classList.remove('sheet-open');
      var o = $('#cartOpen'); if (o && cart.length) o.focus();
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        add(b.getAttribute('data-name'));
        if (!b.hasAttribute('data-label')) b.setAttribute('data-label', b.textContent);
        b.textContent = b.classList.contains('plus') ? '✓' : '✓ Ditambah';
        b.classList.add('added');
        window.setTimeout(function () { b.textContent = b.getAttribute('data-label'); b.classList.remove('added'); }, 900);
      });
    });

    list.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-act]');
      if (!btn) return;
      var li = btn.closest('li');
      var it = find(li.getAttribute('data-name'));
      if (!it) return;
      if (btn.getAttribute('data-act') === 'inc') it.qty = Math.min(99, it.qty + 1);
      else { it.qty -= 1; if (it.qty <= 0) cart.splice(cart.indexOf(it), 1); }
      render();
    });

    $('#cartOpen').addEventListener('click', openSheet);
    $('#sheetClose').addEventListener('click', closeSheet);
    backdrop.addEventListener('click', closeSheet);
    $('#cartClear').addEventListener('click', function () {
      if (cart.length && window.confirm('Kosongkan semua pesanan?')) { cart = []; render(); }
    });
    nameInput.addEventListener('input', updateLink);
    noteInput.addEventListener('input', updateLink);
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (sheet.classList.contains('open')) closeSheet(); closeNav(); }
    });

    cart = load();
    render();
  })();
})();
