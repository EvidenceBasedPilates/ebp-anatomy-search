/* ============================================================
 * Evidence-Based Pilates · Member Area Search · v4 (Sheet-backed)
 * ============================================================
 * Hosted on GitHub Pages. Loaded into ClickFunnels via a single
 * <script src="..."></script> tag in the member funnel's footer.
 *
 * Data lives in a published Google Sheet (CSV). To update the
 * search index, edit the sheet. No code changes required.
 *
 * CONFIG: set SHEET_CSV_URL below to your published-to-web
 * Google Sheet CSV URL. Instructions in README.
 * ============================================================ */

(function () {
  'use strict';

  /* ---------- CONFIG ---------- */
  var SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT-HVy1QvBwlq9p9FEuGwVsV-EKe5QA5cm4u38YRAAfUk826JfdYT20nm_Y2VQmQllUv1odBXNIccA8/pub?gid=0&single=true&output=csv';
  var CACHE_MINUTES = 10;             // how long to keep lessons in browser memory
  var SCRIPT_VERSION = '4.0.0';

  console.log('[EBP-Search] v' + SCRIPT_VERSION + ' script loaded');

  /* ---------- INJECT STYLES ---------- */
  var styleEl = document.createElement('style');
  styleEl.setAttribute('data-ebp-search', 'true');
  styleEl.textContent = [
    "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap');",
    "#ebp-search-root{--ebp-bg:#FAF8F3;--ebp-card:#FFFFFF;--ebp-text:#1C1B17;--ebp-text-muted:#6B6862;--ebp-text-subtle:#A8A49C;--ebp-border:#EAE5DA;--ebp-border-soft:#F2EEE5;--ebp-accent:#2D5F4D;--ebp-accent-hover:#1E4738;--ebp-accent-soft:#E8F0EC;--ebp-shadow:0 20px 60px rgba(28,27,23,0.14),0 4px 12px rgba(28,27,23,0.05);--ebp-shadow-btn:0 10px 28px rgba(45,95,77,0.35),0 2px 6px rgba(45,95,77,0.18);--ebp-radius:14px;--ebp-font-display:'Fraunces',Georgia,'Times New Roman',serif;--ebp-font-body:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',system-ui,sans-serif}",
    "#ebp-search-root,#ebp-search-root *,#ebp-search-root *::before,#ebp-search-root *::after{box-sizing:border-box}",
    "#ebp-search-trigger{position:fixed;bottom:24px;left:24px;z-index:2147483646;width:56px;height:56px;border-radius:50%;background:var(--ebp-accent);color:white;border:none;cursor:pointer;box-shadow:var(--ebp-shadow-btn);display:flex;align-items:center;justify-content:center;transition:transform 0.18s cubic-bezier(.2,.8,.2,1),background 0.18s ease;font-family:var(--ebp-font-body);padding:0}",
    "#ebp-search-trigger:hover{transform:translateY(-2px) scale(1.04);background:var(--ebp-accent-hover)}",
    "#ebp-search-trigger:active{transform:translateY(0) scale(1)}",
    "#ebp-search-trigger svg{width:22px;height:22px;pointer-events:none}",
    "#ebp-search-backdrop{position:fixed;inset:0;background:rgba(28,27,23,0.42);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:2147483646;opacity:0;transition:opacity 0.22s ease;pointer-events:none}",
    "#ebp-search-backdrop[data-open='true']{opacity:1;pointer-events:auto}",
    "#ebp-search-modal{position:fixed;top:72px;left:50%;transform:translateX(-50%) translateY(-12px);width:calc(100% - 32px);max-width:680px;max-height:calc(100vh - 120px);background:var(--ebp-card);border-radius:var(--ebp-radius);box-shadow:var(--ebp-shadow);z-index:2147483647;opacity:0;pointer-events:none;transition:opacity 0.22s ease,transform 0.22s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;overflow:hidden;font-family:var(--ebp-font-body)}",
    "#ebp-search-modal[data-open='true']{opacity:1;pointer-events:auto;transform:translateX(-50%) translateY(0)}",
    "#ebp-search-header{padding:22px 24px 18px;border-bottom:1px solid var(--ebp-border-soft)}",
    "#ebp-search-heading{font-family:var(--ebp-font-display);font-size:13px;font-weight:500;color:var(--ebp-text-muted);text-transform:uppercase;letter-spacing:0.14em;margin:0 0 14px}",
    "#ebp-search-input-wrapper{display:flex;align-items:center;gap:12px}",
    "#ebp-search-input-wrapper > svg{width:20px;height:20px;color:var(--ebp-text-muted);flex-shrink:0}",
    "#ebp-search-input{flex:1;border:none;outline:none;font-size:18px;color:var(--ebp-text);font-family:var(--ebp-font-body);background:transparent;padding:4px 0;letter-spacing:-0.01em}",
    "#ebp-search-input::placeholder{color:var(--ebp-text-subtle)}",
    "#ebp-search-esc{background:var(--ebp-bg);border:1px solid var(--ebp-border);border-radius:5px;padding:3px 8px;font-size:11px;color:var(--ebp-text-muted);font-family:var(--ebp-font-body)}",
    "#ebp-search-categories{display:flex;flex-wrap:wrap;gap:6px;padding:14px 24px;border-bottom:1px solid var(--ebp-border-soft);background:var(--ebp-bg)}",
    "#ebp-search-categories:empty{display:none}",
    ".ebp-cat-pill{background:transparent;border:1px solid var(--ebp-border);color:var(--ebp-text-muted);padding:4px 11px;border-radius:999px;font-size:12px;cursor:pointer;transition:all 0.14s ease;font-family:var(--ebp-font-body)}",
    ".ebp-cat-pill:hover{border-color:var(--ebp-accent);color:var(--ebp-accent);background:var(--ebp-accent-soft)}",
    ".ebp-cat-pill[data-active='true']{background:var(--ebp-accent);border-color:var(--ebp-accent);color:white}",
    "#ebp-search-results{flex:1;overflow-y:auto;padding:6px 0 10px;min-height:200px}",
    "#ebp-search-results::-webkit-scrollbar{width:8px}",
    "#ebp-search-results::-webkit-scrollbar-thumb{background:var(--ebp-border);border-radius:4px}",
    ".ebp-result{display:block;padding:14px 24px;text-decoration:none;color:inherit;border-left:3px solid transparent;transition:background 0.12s ease,border-color 0.12s ease}",
    ".ebp-result + .ebp-result{border-top:1px solid var(--ebp-border-soft)}",
    ".ebp-result:hover,.ebp-result[data-focused='true']{background:var(--ebp-bg);border-left-color:var(--ebp-accent)}",
    ".ebp-result-breadcrumb{font-size:10.5px;color:var(--ebp-text-muted);text-transform:uppercase;letter-spacing:0.1em;margin:0 0 5px 0;font-weight:500}",
    ".ebp-result-title{font-family:var(--ebp-font-display);font-size:18px;font-weight:500;color:var(--ebp-text);line-height:1.25;margin:0 0 5px 0}",
    ".ebp-result-desc{font-size:13px;color:var(--ebp-text-muted);line-height:1.55;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}",
    ".ebp-result mark{background:var(--ebp-accent-soft);color:var(--ebp-accent-hover);padding:0 2px;border-radius:2px;font-weight:600}",
    ".ebp-no-results{padding:56px 24px;text-align:center;color:var(--ebp-text-muted);font-size:14px;line-height:1.6}",
    ".ebp-no-results-title{font-family:var(--ebp-font-display);font-style:italic;font-size:22px;color:var(--ebp-text);margin:0 0 8px;font-weight:400}",
    ".ebp-loading{padding:56px 24px;text-align:center;color:var(--ebp-text-muted);font-size:14px}",
    "#ebp-search-footer{padding:11px 24px;border-top:1px solid var(--ebp-border-soft);background:var(--ebp-bg);font-size:11px;color:var(--ebp-text-muted);display:flex;justify-content:space-between;align-items:center}",
    "#ebp-search-brand{font-family:var(--ebp-font-display);font-style:italic;color:var(--ebp-text-muted);font-size:12px}",
    "@media (max-width:640px){#ebp-search-modal{top:12px;max-height:calc(100vh - 24px);width:calc(100% - 20px);border-radius:12px}#ebp-search-trigger{width:50px;height:50px;bottom:18px;left:18px}#ebp-search-header{padding:18px 18px 14px}#ebp-search-categories{padding:12px 18px}.ebp-result{padding:14px 18px}#ebp-search-footer{padding:10px 18px;font-size:10.5px}#ebp-search-footer-left{display:none}}"
  ].join('');
  document.head.appendChild(styleEl);

  /* ---------- INJECT DOM ---------- */
  function buildDom() {
    var root = document.createElement('div');
    root.id = 'ebp-search-root';
    root.innerHTML = [
      '<button id="ebp-search-trigger" type="button" aria-label="Open lesson search">',
      '  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="20" y1="20" x2="16.65" y2="16.65"></line></svg>',
      '</button>',
      '<div id="ebp-search-backdrop"></div>',
      '<div id="ebp-search-modal" role="dialog" aria-label="Search lessons" aria-modal="true">',
      '  <div id="ebp-search-header">',
      '    <div id="ebp-search-heading">Lesson Library</div>',
      '    <div id="ebp-search-input-wrapper">',
      '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="20" y1="20" x2="16.65" y2="16.65"></line></svg>',
      '      <input id="ebp-search-input" type="text" placeholder="Search lessons, modules, or topics..." autocomplete="off" spellcheck="false" />',
      '      <span id="ebp-search-esc">ESC</span>',
      '    </div>',
      '  </div>',
      '  <div id="ebp-search-categories"></div>',
      '  <div id="ebp-search-results"><div class="ebp-loading">Loading lesson library...</div></div>',
      '  <div id="ebp-search-footer">',
      '    <span id="ebp-search-footer-left">arrows navigate, enter opens, esc closes</span>',
      '    <span id="ebp-search-brand">Evidence-Based Pilates</span>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(root);
    return root;
  }

  /* ---------- CSV PARSER ---------- */
  function parseCSV(text) {
    var rows = [];
    var row = [];
    var field = '';
    var inQuotes = false;
    var i = 0;
    while (i < text.length) {
      var c = text.charAt(i);
      if (inQuotes) {
        if (c === '"') {
          if (text.charAt(i + 1) === '"') {
            field += '"';
            i += 2;
            continue;
          }
          inQuotes = false;
          i++;
          continue;
        }
        field += c;
        i++;
        continue;
      }
      if (c === '"') { inQuotes = true; i++; continue; }
      if (c === ',') { row.push(field); field = ''; i++; continue; }
      if (c === '\n' || c === '\r') {
        if (c === '\r' && text.charAt(i + 1) === '\n') i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        i++;
        continue;
      }
      field += c;
      i++;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function rowsToLessons(rows) {
    if (!rows.length) return [];
    var headers = rows[0].map(function (h) { return String(h).toLowerCase().replace(/^\s+|\s+$/g, ''); });
    var idx = {
      title: headers.indexOf('title'),
      course: headers.indexOf('course'),
      module: headers.indexOf('module'),
      description: headers.indexOf('description'),
      categories: headers.indexOf('categories'),
      url: headers.indexOf('url')
    };
    var lessons = [];
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];
      var title = idx.title >= 0 ? (row[idx.title] || '').trim() : '';
      var url = idx.url >= 0 ? (row[idx.url] || '').trim() : '';
      if (!title || !url) continue;
      var catsRaw = idx.categories >= 0 ? (row[idx.categories] || '') : '';
      var cats = catsRaw.split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(function (s) { return s.length > 0; });
      lessons.push({
        title: title,
        course: idx.course >= 0 ? (row[idx.course] || '').trim() : '',
        module: idx.module >= 0 ? (row[idx.module] || '').trim() : '',
        description: idx.description >= 0 ? (row[idx.description] || '').trim() : '',
        categories: cats,
        url: url
      });
    }
    return lessons;
  }

  /* ---------- FETCH LESSONS ---------- */
  var lessonsCache = null;
  var cacheTime = 0;

  function fetchLessons(callback) {
    var now = Date.now();
    if (lessonsCache && (now - cacheTime) < CACHE_MINUTES * 60000) {
      callback(null, lessonsCache);
      return;
    }
    if (SHEET_CSV_URL === 'REPLACE_WITH_YOUR_PUBLISHED_CSV_URL') {
      callback(new Error('SHEET_CSV_URL not configured. Edit search.js.'), null);
      return;
    }
    var url = SHEET_CSV_URL + (SHEET_CSV_URL.indexOf('?') >= 0 ? '&' : '?') + 'cb=' + now;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var lessons = rowsToLessons(parseCSV(xhr.responseText));
          lessonsCache = lessons;
          cacheTime = Date.now();
          console.log('[EBP-Search] Loaded ' + lessons.length + ' lessons');
          callback(null, lessons);
        } catch (e) {
          callback(e, null);
        }
      } else {
        callback(new Error('Failed to fetch lessons: HTTP ' + xhr.status), null);
      }
    };
    xhr.send();
  }

  /* ---------- SEARCH ENGINE ---------- */
  function normalize(str) {
    if (!str) return '';
    var s = String(str).toLowerCase();
    var out = '';
    var prevSpace = true;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      var c = s.charCodeAt(i);
      var isWordChar = (c >= 97 && c <= 122) || (c >= 48 && c <= 57) || c === 45;
      if (isWordChar) { out += ch; prevSpace = false; }
      else if (!prevSpace) { out += ' '; prevSpace = true; }
    }
    if (out.length && out.charAt(out.length - 1) === ' ') out = out.substring(0, out.length - 1);
    return out;
  }

  function splitWords(s) {
    if (!s) return [];
    var parts = s.split(' ');
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].length >= 2) out.push(parts[i]);
    }
    return out;
  }

  function scoreMatch(query, lesson) {
    var q = normalize(query);
    if (!q) return 0;
    var fTitle = normalize(lesson.title);
    var fModule = normalize(lesson.module);
    var fCourse = normalize(lesson.course);
    var fDesc = normalize(lesson.description);
    var fCats = normalize((lesson.categories || []).join(' '));
    var queryWords = splitWords(q);
    if (!queryWords.length) return 0;
    var score = 0;
    if (fTitle.indexOf(q) !== -1) score += 100;
    if (fTitle.indexOf(q) === 0) score += 50;
    if (fModule.indexOf(q) !== -1) score += 40;
    if (fCourse.indexOf(q) !== -1) score += 30;
    if (fCats.indexOf(q) !== -1) score += 30;
    if (fDesc.indexOf(q) !== -1) score += 20;
    for (var i = 0; i < queryWords.length; i++) {
      var word = queryWords[i];
      if (fTitle.indexOf(word) !== -1) score += 15;
      if (fModule.indexOf(word) !== -1) score += 8;
      if (fCourse.indexOf(word) !== -1) score += 6;
      if (fCats.indexOf(word) !== -1) score += 6;
      if (fDesc.indexOf(word) !== -1) score += 3;
      var tokens = (fTitle + ' ' + fModule + ' ' + fCats).split(' ');
      for (var t = 0; t < tokens.length; t++) {
        if (tokens[t].length > word.length && tokens[t].indexOf(word) === 0) score += 3;
      }
    }
    return score;
  }

  function searchLessons(allLessons, query, activeCategory) {
    var candidates = allLessons;
    if (activeCategory) {
      var filtered = [];
      for (var i = 0; i < candidates.length; i++) {
        var cats = candidates[i].categories || [];
        for (var j = 0; j < cats.length; j++) {
          if (normalize(cats[j]) === normalize(activeCategory)) { filtered.push(candidates[i]); break; }
        }
      }
      candidates = filtered;
    }
    if (!query || !query.replace(' ', '').length) {
      var sortable = candidates.slice();
      sortable.sort(function (a, b) {
        var ak = (a.course || '') + (a.module || '') + (a.title || '');
        var bk = (b.course || '') + (b.module || '') + (b.title || '');
        return ak < bk ? -1 : (ak > bk ? 1 : 0);
      });
      return sortable;
    }
    var scored = [];
    for (var k = 0; k < candidates.length; k++) {
      var s = scoreMatch(query, candidates[k]);
      if (s > 0) scored.push({ lesson: candidates[k], score: s });
    }
    scored.sort(function (a, b) { return b.score - a.score; });
    var out = [];
    for (var m = 0; m < scored.length; m++) out.push(scored[m].lesson);
    return out;
  }

  function getAllCategories(allLessons) {
    var counts = {};
    for (var i = 0; i < allLessons.length; i++) {
      var cats = allLessons[i].categories || [];
      for (var j = 0; j < cats.length; j++) {
        counts[cats[j]] = (counts[cats[j]] || 0) + 1;
      }
    }
    var arr = [];
    for (var k in counts) {
      if (Object.prototype.hasOwnProperty.call(counts, k)) arr.push(k);
    }
    arr.sort(function (a, b) {
      var diff = counts[b] - counts[a];
      if (diff !== 0) return diff;
      return a < b ? -1 : (a > b ? 1 : 0);
    });
    return arr;
  }

  function escapeHtml(str) {
    if (!str) return '';
    var s = String(str);
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (c === '&') out += '&amp;';
      else if (c === '<') out += '&lt;';
      else if (c === '>') out += '&gt;';
      else if (c === '"') out += '&quot;';
      else if (c === "'") out += '&#39;';
      else out += c;
    }
    return out;
  }

  function highlightQuery(text, query) {
    if (!text) return '';
    if (!query) return escapeHtml(text);
    var trimmed = query.replace(' ', '');
    if (!trimmed.length) return escapeHtml(text);
    var safeText = escapeHtml(text);
    var rawWords = query.split(' ');
    var words = [];
    for (var i = 0; i < rawWords.length; i++) {
      var w = rawWords[i];
      if (w.length >= 2) words.push(w);
    }
    if (!words.length) return safeText;
    words.sort(function (a, b) { return b.length - a.length; });
    var lowText = safeText.toLowerCase();
    var result = '';
    var idx = 0;
    while (idx < safeText.length) {
      var matched = false;
      for (var j = 0; j < words.length; j++) {
        var wLow = words[j].toLowerCase();
        if (lowText.substr(idx, wLow.length) === wLow) {
          result += '<mark>' + safeText.substr(idx, words[j].length) + '</mark>';
          idx += words[j].length;
          matched = true;
          break;
        }
      }
      if (!matched) { result += safeText.charAt(idx); idx++; }
    }
    return result;
  }

  /* ---------- UI WIRING ---------- */
  function init() {
    console.log('[EBP-Search] init running');
    buildDom();

    var trigger = document.getElementById('ebp-search-trigger');
    var backdrop = document.getElementById('ebp-search-backdrop');
    var modal = document.getElementById('ebp-search-modal');
    var input = document.getElementById('ebp-search-input');
    var categoriesEl = document.getElementById('ebp-search-categories');
    var resultsEl = document.getElementById('ebp-search-results');

    if (!trigger || !modal || !input) {
      console.error('[EBP-Search] DOM build failed');
      return;
    }
    console.log('[EBP-Search] DOM ready, binding events');

    var allLessons = [];
    var activeCategory = null;
    var focusedIndex = -1;
    var currentResults = [];

    function renderCategories() {
      if (!allLessons.length) { categoriesEl.innerHTML = ''; return; }
      var cats = getAllCategories(allLessons);
      var html = '';
      for (var i = 0; i < cats.length; i++) {
        var active = activeCategory === cats[i] ? 'true' : 'false';
        html += '<button class="ebp-cat-pill" data-cat="' + escapeHtml(cats[i]) + '" data-active="' + active + '">' + escapeHtml(cats[i]) + '</button>';
      }
      categoriesEl.innerHTML = html;
    }

    function renderResults() {
      if (!allLessons.length) {
        resultsEl.innerHTML = '<div class="ebp-loading">Loading lesson library...</div>';
        return;
      }
      var query = input.value;
      currentResults = searchLessons(allLessons, query, activeCategory);
      focusedIndex = -1;
      if (!currentResults.length) {
        var q = query.replace(' ', '').length ? query : '';
        var msg = 'Nothing found' + (q ? ' for "' + escapeHtml(q) + '"' : '') + '.';
        var hint = 'Try different keywords' + (activeCategory ? ', or clear the category filter' : '') + '.';
        resultsEl.innerHTML = '<div class="ebp-no-results"><div class="ebp-no-results-title">' + msg + '</div>' + hint + '</div>';
        return;
      }
      var html = '';
      for (var i = 0; i < currentResults.length; i++) {
        var l = currentResults[i];
        html += '<a class="ebp-result" href="' + escapeHtml(l.url) + '" data-index="' + i + '">';
        var bc = (l.course && l.module) ? (escapeHtml(l.course) + ' - ' + escapeHtml(l.module)) : escapeHtml(l.course || l.module || '');
        if (bc) html += '<div class="ebp-result-breadcrumb">' + bc + '</div>';
        html += '<div class="ebp-result-title">' + highlightQuery(l.title, query) + '</div>';
        if (l.description) html += '<div class="ebp-result-desc">' + highlightQuery(l.description, query) + '</div>';
        html += '</a>';
      }
      resultsEl.innerHTML = html;
    }

    function loadAndRender() {
      fetchLessons(function (err, lessons) {
        if (err) {
          console.error('[EBP-Search] Lesson load failed:', err.message);
          resultsEl.innerHTML = '<div class="ebp-no-results"><div class="ebp-no-results-title">Search is temporarily unavailable.</div>Please refresh the page in a moment.</div>';
          return;
        }
        allLessons = lessons;
        renderCategories();
        renderResults();
      });
    }

    function openSearch() {
      backdrop.setAttribute('data-open', 'true');
      modal.setAttribute('data-open', 'true');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { input.focus(); }, 60);
      if (!allLessons.length) loadAndRender(); else renderResults();
    }

    function closeSearch() {
      backdrop.setAttribute('data-open', 'false');
      modal.setAttribute('data-open', 'false');
      document.body.style.overflow = '';
      input.blur();
    }

    function isOpen() { return modal.getAttribute('data-open') === 'true'; }

    function updateFocus() {
      var nodes = resultsEl.querySelectorAll('.ebp-result');
      for (var i = 0; i < nodes.length; i++) {
        var idx = parseInt(nodes[i].getAttribute('data-index'), 10);
        nodes[i].setAttribute('data-focused', idx === focusedIndex ? 'true' : 'false');
      }
      var focused = resultsEl.querySelector('.ebp-result[data-focused="true"]');
      if (focused && focused.scrollIntoView) focused.scrollIntoView({ block: 'nearest' });
    }

    trigger.addEventListener('click', function (e) { e.preventDefault(); openSearch(); });

    document.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== document) {
        if (t.id === 'ebp-search-trigger') {
          if (!isOpen()) { e.preventDefault(); openSearch(); }
          return;
        }
        if (t.classList && t.classList.contains('ebp-cat-pill')) {
          var c = t.getAttribute('data-cat');
          activeCategory = (activeCategory === c) ? null : c;
          renderCategories();
          renderResults();
          return;
        }
        t = t.parentNode;
      }
    });

    backdrop.addEventListener('click', closeSearch);
    input.addEventListener('input', renderResults);

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        focusedIndex = Math.min(focusedIndex + 1, currentResults.length - 1);
        updateFocus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        focusedIndex = Math.max(focusedIndex - 1, -1);
        updateFocus();
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        var link = resultsEl.querySelector('[data-index="' + focusedIndex + '"]');
        if (link) link.click();
      } else if (e.key === 'Escape') {
        closeSearch();
      }
    });

    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (isOpen()) { closeSearch(); } else { openSearch(); }
      } else if (e.key === 'Escape' && isOpen()) {
        closeSearch();
      }
    });

    // Preload lessons on init so first open is instant
    loadAndRender();
    console.log('[EBP-Search] ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }
})();
