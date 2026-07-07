/* ==========================================================================
   Conveyancing Guard — shared client-side logic
   Plain JS, no build step, no bundler. Loaded as a classic script (not
   type="module") on purpose: Chrome blocks ES module imports under the
   file:// origin, and this app must keep working when opened by double-
   clicking an HTML file, not just when served over http(s).
   All state lives in sessionStorage — nothing is ever sent anywhere.
   ========================================================================== */

(function () {
  'use strict';

  var CG = {};

  /* ------------------------------------------------------------------ *
   * Demo examples — canned, hand-written scenarios shown via the three
   * demo buttons. These bypass the scoring engine entirely so judges see
   * a consistent, deliberately-chosen result every time.
   * ------------------------------------------------------------------ */
  CG.EXAMPLES = {
    sus: {
      text: "Hi, please note our bank has changed due to a compliance audit. Kindly send the completion funds to our new account today to avoid delay. Sort code and account attached. Regards, Smith Conveyancing",
      q1: 'no', q2: 'yes', risk: 'red', label: 'High risk', sub: 'Does not match the transaction', score: 92,
      reasons: [
        { neg: true, text: 'Sender domain differs slightly from prior correspondence' },
        { neg: true, text: 'Bank account has not been used before in this transaction' },
        { neg: true, text: 'Message uses urgency language: send today, avoid delay' }
      ],
      action: 'Call the client on the number already in your file, never a number from this email. Do not transfer until confirmed.'
    },
    legit: {
      text: "Hi, as discussed on our call yesterday, completion is confirmed for Friday. Please proceed with the transfer to the account on file as usual. Thanks, Jones and Co",
      q1: 'yes', q2: 'yes', risk: 'green', label: 'Low risk', sub: 'Matches established patterns', score: 8,
      reasons: [
        { neg: false, text: 'Sender domain matches prior correspondence' },
        { neg: false, text: 'Account has been used before in this transaction' },
        { neg: false, text: 'No urgency or pressure language present' }
      ],
      action: 'No red flags found. Proceed as normal, and keep verifying large or unusual requests by phone.'
    },
    border: {
      text: "Hi, quick update, our accounts team asked me to confirm the sort code before you send funds. Let me know if you need anything else.",
      q1: 'no', q2: 'no', risk: 'amber', label: 'Medium risk', sub: 'Unusual request, needs verification', score: 54,
      reasons: [
        { neg: true, text: 'Bank account has not been used before in this transaction' },
        { neg: true, text: 'Amount does not match what was expected' },
        { neg: false, text: 'Tone is consistent but request is unusual' }
      ],
      action: 'Pause and verify directly with the client by phone before proceeding.'
    }
  };

  /* ------------------------------------------------------------------ *
   * Red-flag phrases seen in real payment-diversion fraud attempts.
   * `cat` groups phrases so the engine can tell a bank-detail-change
   * signal apart from generic urgency/secrecy language (used to decide
   * whether the "known fraud pattern" banner should fire).
   * ------------------------------------------------------------------ */
  CG.RED_FLAG_PHRASES = [
    { p: 'bank has changed', cat: 'bank-change', msg: 'Message references a change of bank details' },
    { p: 'account has changed', cat: 'bank-change', msg: 'Message references a change of bank details' },
    { p: 'change of bank', cat: 'bank-change', msg: 'Message references a change of bank details' },
    { p: 'new account', cat: 'bank-change', msg: 'Message references a new account' },
    { p: 'updated account', cat: 'bank-change', msg: 'Message references updated account details' },
    { p: 'updated bank', cat: 'bank-change', msg: 'Message references updated bank details' },
    { p: 'sort code', cat: 'bank-change', msg: 'Message asks to confirm or change sort code details' },
    { p: 'urgent', cat: 'urgency', msg: 'Message uses urgency language' },
    { p: 'immediately', cat: 'urgency', msg: 'Message uses urgency language' },
    { p: 'avoid delay', cat: 'urgency', msg: 'Message pressures against delay' },
    { p: 'as soon as possible', cat: 'urgency', msg: 'Message pressures for quick action' },
    { p: 'asap', cat: 'urgency', msg: 'Message pressures for quick action' },
    { p: 'compliance audit', cat: 'urgency', msg: 'Message cites a compliance or audit reason for change, a common fraud pretext' },
    { p: 'kindly', cat: 'urgency', msg: 'Message uses unusually formal, pressured phrasing often seen in fraud attempts' },
    { p: 'confidential', cat: 'secrecy', msg: 'Message asks for confidentiality around the payment' },
    { p: "don't call", cat: 'secrecy', msg: 'Message discourages phone verification, a major red flag' },
    { p: 'do not call', cat: 'secrecy', msg: 'Message discourages phone verification, a major red flag' }
  ];

  CG.DEFAULT_THRESHOLDS = { medium: 35, high: 65 };
  CG.SETTINGS_KEY = 'cg.settings.v1';
  CG.HISTORY_KEY = 'cg.history.v1';
  CG.HISTORY_MAX = 200;
  CG.HISTORY_PAGE_SIZE = 10;

  /* ------------------------------------------------------------------ *
   * Settings (sessionStorage-backed, read fresh on every use — no cache)
   * ------------------------------------------------------------------ */

  CG.getThresholds = function () {
    try {
      var raw = sessionStorage.getItem(CG.SETTINGS_KEY);
      if (!raw) return { medium: CG.DEFAULT_THRESHOLDS.medium, high: CG.DEFAULT_THRESHOLDS.high };
      var parsed = JSON.parse(raw);
      var medium = Number(parsed.medium);
      var high = Number(parsed.high);
      if (!isFinite(medium) || !isFinite(high) || medium < 1 || high > 99 || medium >= high) {
        return { medium: CG.DEFAULT_THRESHOLDS.medium, high: CG.DEFAULT_THRESHOLDS.high };
      }
      return { medium: medium, high: high };
    } catch (e) {
      return { medium: CG.DEFAULT_THRESHOLDS.medium, high: CG.DEFAULT_THRESHOLDS.high };
    }
  };

  CG.setThresholds = function (t) {
    var medium = Math.max(1, Math.min(98, Math.round(t.medium)));
    var high = Math.max(2, Math.min(99, Math.round(t.high)));
    if (medium >= high) medium = high - 1;
    sessionStorage.setItem(CG.SETTINGS_KEY, JSON.stringify({ medium: medium, high: high }));
    return { medium: medium, high: high };
  };

  /* ------------------------------------------------------------------ *
   * History (sessionStorage-backed — cleared when the tab closes)
   * ------------------------------------------------------------------ */

  CG.getHistory = function () {
    try {
      var raw = sessionStorage.getItem(CG.HISTORY_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  CG.addHistoryEntry = function (entry) {
    var list = CG.getHistory();
    list.unshift(entry);
    if (list.length > CG.HISTORY_MAX) list = list.slice(0, CG.HISTORY_MAX);
    sessionStorage.setItem(CG.HISTORY_KEY, JSON.stringify(list));
    return list;
  };

  CG.clearHistory = function () {
    sessionStorage.setItem(CG.HISTORY_KEY, JSON.stringify([]));
  };

  /* ------------------------------------------------------------------ *
   * Scoring engine
   * ------------------------------------------------------------------ */

  CG.computeConfidence = function (signalCount, score, thresholds) {
    var boundaryDistance = Math.min(Math.abs(score - thresholds.medium), Math.abs(score - thresholds.high));
    if (signalCount >= 3 && boundaryDistance >= 15) return 'high';
    if (signalCount <= 1 && boundaryDistance < 8) return 'low';
    return 'medium';
  };

  CG.analyze = function (text, q1, q2) {
    var thresholds = CG.getThresholds();
    var lower = text.toLowerCase();
    var score = 12;
    var reasons = [];

    if (q1 === 'no') {
      score += 32;
      reasons.push({ neg: true, text: 'Bank account has not been used before in this transaction' });
    } else {
      reasons.push({ neg: false, text: 'Account matches one used before in this transaction' });
    }

    if (q2 === 'no') {
      score += 22;
      reasons.push({ neg: true, text: 'Amount does not match what was expected' });
    } else {
      reasons.push({ neg: false, text: 'Amount matches what was expected' });
    }

    var matchedCats = {};
    var seenMsgs = {};
    var matchedCount = 0;
    CG.RED_FLAG_PHRASES.forEach(function (f) {
      if (lower.indexOf(f.p) !== -1 && !seenMsgs[f.msg]) {
        seenMsgs[f.msg] = true;
        matchedCats[f.cat] = true;
        matchedCount++;
        score += 9;
        reasons.push({ neg: true, text: f.msg });
      }
    });

    if (matchedCount === 0 && q1 === 'yes' && q2 === 'yes') {
      reasons.push({ neg: false, text: 'No urgency or pressure language detected' });
    }

    score = Math.min(97, Math.max(4, score));

    var risk, label, sub, action;
    if (score >= thresholds.high) {
      risk = 'red'; label = 'High risk'; sub = 'Does not match the transaction';
      action = 'Call the client or firm on a number already in your file, never a number from this message. Do not transfer until verbally confirmed.';
    } else if (score >= thresholds.medium) {
      risk = 'amber'; label = 'Medium risk'; sub = 'Unusual request, needs verification';
      action = 'Pause and verify directly with the client by phone before proceeding.';
    } else {
      risk = 'green'; label = 'Low risk'; sub = 'Matches established patterns';
      action = 'No red flags found. Proceed as normal, and keep verifying large or unusual requests by phone.';
    }

    var signalCount = matchedCount + (q1 === 'no' ? 1 : 0) + (q2 === 'no' ? 1 : 0);
    var confidence = CG.computeConfidence(signalCount, score, thresholds);
    var patternMatch = !!(q1 === 'no' && q2 === 'yes' && matchedCats['bank-change']);

    return { risk: risk, label: label, sub: sub, score: score, reasons: reasons, action: action, confidence: confidence, patternMatch: patternMatch };
  };

  CG.analyzeDemo = function (key) {
    var ex = CG.EXAMPLES[key];
    return {
      risk: ex.risk, label: ex.label, sub: ex.sub, score: ex.score,
      reasons: ex.reasons, action: ex.action,
      confidence: 'high',
      patternMatch: key === 'sus'
    };
  };

  /* ------------------------------------------------------------------ *
   * Utilities
   * ------------------------------------------------------------------ */

  CG.escapeHtml = function (str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  CG.formatTime = function (ts) { return new Date(ts).toLocaleTimeString(); };
  CG.formatDateTime = function (ts) { return new Date(ts).toLocaleString(); };

  CG.uid = function () {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  };

  CG.capitalize = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

  /* ------------------------------------------------------------------ *
   * Nav: re-derives the active tab from body[data-page] at runtime, so
   * a stale hardcoded aria-current in the markup self-corrects.
   * ------------------------------------------------------------------ */

  CG.initNav = function () {
    var page = document.body.getAttribute('data-page');
    var links = document.querySelectorAll('.nav-link');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('data-nav') === page) {
        links[i].setAttribute('aria-current', 'page');
      } else {
        links[i].removeAttribute('aria-current');
      }
    }
  };

  /* ==================================================================== *
   * index.html — New Check
   * ==================================================================== */

  CG.initIndexPage = function () {
    var state = { q1: 'no', q2: 'yes' };

    var emailText = document.getElementById('emailText');
    var charCount = document.getElementById('charCount');
    var resultEmpty = document.getElementById('resultEmpty');
    var resultContent = document.getElementById('resultContent');
    var circle = document.getElementById('circle');
    var vLabel = document.getElementById('vLabel');
    var vSub = document.getElementById('vSub');
    var vScore = document.getElementById('vScore');
    var vConfidence = document.getElementById('vConfidence');
    var patternBanner = document.getElementById('patternBanner');
    var reasonsList = document.getElementById('reasonsList');
    var actionText = document.getElementById('actionText');
    var checkedTime = document.getElementById('checkedTime');
    var recentList = document.getElementById('recentList');
    var recentCount = document.getElementById('recentCount');

    if (!emailText) return;

    emailText.addEventListener('input', function () {
      charCount.textContent = emailText.value.length;
    });

    var togs = document.querySelectorAll('.tog');
    togs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var q = btn.getAttribute('data-q');
        var v = btn.getAttribute('data-v');
        setTog(q, v);
      });
    });

    function setTog(q, v) {
      document.querySelectorAll('.tog[data-q="' + q + '"]').forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-v') === v ? 'true' : 'false');
      });
      if (q === '1') state.q1 = v; else state.q2 = v;
    }

    document.querySelectorAll('.demobtn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        loadExample(btn.getAttribute('data-demo'));
      });
    });

    document.getElementById('checkBtn').addEventListener('click', runCheck);
    var backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.addEventListener('click', backToInput);

    function loadExample(key) {
      var ex = CG.EXAMPLES[key];
      emailText.value = ex.text;
      charCount.textContent = ex.text.length;
      setTog('1', ex.q1);
      setTog('2', ex.q2);
      runCheck();
    }

    function runCheck() {
      var raw = emailText.value.trim();
      if (!raw) {
        alert('Paste an email or message first, or try a demo example.');
        return;
      }
      var lower = raw.toLowerCase();
      var matchedKey = null;
      Object.keys(CG.EXAMPLES).forEach(function (k) {
        if (CG.EXAMPLES[k].text.toLowerCase() === lower) matchedKey = k;
      });

      var result = matchedKey ? CG.analyzeDemo(matchedKey) : CG.analyze(raw, state.q1, state.q2);
      renderResult(result);

      CG.addHistoryEntry({
        id: CG.uid(),
        ts: Date.now(),
        risk: result.risk, label: result.label, score: result.score,
        preview: raw.slice(0, 80) + (raw.length > 80 ? '…' : ''),
        fullText: raw,
        reasons: result.reasons, action: result.action,
        confidence: result.confidence, patternMatch: result.patternMatch,
        source: matchedKey ? 'demo' : 'custom',
        demoKey: matchedKey || null,
        q1: matchedKey ? CG.EXAMPLES[matchedKey].q1 : state.q1,
        q2: matchedKey ? CG.EXAMPLES[matchedKey].q2 : state.q2
      });
      renderRecent();
    }

    function renderResult(result) {
      circle.className = 'circle ' + result.risk;
      circle.textContent = result.risk === 'green' ? '✓' : '⚠';
      vLabel.textContent = result.label;
      vSub.textContent = result.sub;
      vScore.textContent = result.score + '/100';
      vConfidence.className = 'pill pill-confidence-' + result.confidence;
      vConfidence.textContent = 'Confidence: ' + CG.capitalize(result.confidence);

      patternBanner.hidden = !result.patternMatch;

      reasonsList.innerHTML = result.reasons.map(function (r) {
        return '<div class="reason ' + (r.neg ? 'neg' : 'pos') + '"><span class="dot"></span><span>' + CG.escapeHtml(r.text) + '</span></div>';
      }).join('');

      actionText.textContent = result.action;
      checkedTime.textContent = 'Checked ' + CG.formatDateTime(Date.now());

      resultEmpty.style.display = 'none';
      resultContent.style.display = 'block';
    }

    function renderRecent() {
      var entries = CG.getHistory();
      recentCount.textContent = entries.length + ' this session';
      if (entries.length === 0) {
        recentList.innerHTML = '<div class="logempty">No checks yet. Run a check to see it here.</div>';
        return;
      }
      recentList.innerHTML = entries.slice(0, 5).map(function (e) {
        return '<div class="logrow"><span class="badge ' + e.risk + '">' + CG.escapeHtml(e.label) + '</span>' +
          '<span class="preview">' + CG.escapeHtml(e.preview) + '</span>' +
          '<span class="logtime">' + CG.formatTime(e.ts) + '</span></div>';
      }).join('');
    }

    function backToInput() {
      resultEmpty.style.display = 'block';
      resultContent.style.display = 'none';
    }

    renderRecent();
  };

  /* ==================================================================== *
   * history.html
   * ==================================================================== */

  CG.initHistoryPage = function () {
    var tableBody = document.getElementById('historyBody');
    if (!tableBody) return;

    var searchInput = document.getElementById('historySearch');
    var tabs = document.querySelectorAll('.tab');
    var emptyNoHistory = document.getElementById('emptyNoHistory');
    var emptyNoResults = document.getElementById('emptyNoResults');
    var tableScroll = document.getElementById('historyTableScroll');
    var pagination = document.getElementById('pagination');
    var pageLabel = document.getElementById('pageLabel');
    var prevBtn = document.getElementById('prevPage');
    var nextBtn = document.getElementById('nextPage');
    var clearFiltersBtn = document.getElementById('clearFilters');

    var state = { search: '', risk: 'all', page: 0, expandedId: null };

    searchInput.addEventListener('input', function () {
      state.search = searchInput.value.trim().toLowerCase();
      state.page = 0;
      render();
    });

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        state.risk = tab.getAttribute('data-risk');
        state.page = 0;
        render();
      });
    });

    prevBtn.addEventListener('click', function () {
      if (state.page > 0) { state.page--; render(); }
    });
    nextBtn.addEventListener('click', function () {
      state.page++; render();
    });
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', function () {
        state.search = ''; state.risk = 'all'; state.page = 0;
        searchInput.value = '';
        render();
      });
    }

    function getFilteredBySearch(all) {
      if (!state.search) return all;
      return all.filter(function (e) {
        return (e.preview + ' ' + e.fullText).toLowerCase().indexOf(state.search) !== -1;
      });
    }

    function getFilteredByRisk(list) {
      if (state.risk === 'all') return list;
      return list.filter(function (e) { return e.risk === state.risk; });
    }

    var totalMeta = document.getElementById('totalMeta');

    function render() {
      var all = CG.getHistory();
      var searched = getFilteredBySearch(all);
      var filtered = getFilteredByRisk(searched);

      if (totalMeta) totalMeta.textContent = all.length + (all.length === 1 ? ' check total' : ' checks total');

      var counts = { all: searched.length, red: 0, amber: 0, green: 0 };
      searched.forEach(function (e) { counts[e.risk] = (counts[e.risk] || 0) + 1; });
      tabs.forEach(function (tab) {
        var riskKey = tab.getAttribute('data-risk');
        tab.setAttribute('aria-selected', riskKey === state.risk ? 'true' : 'false');
        var countEl = tab.querySelector('.count');
        if (countEl) countEl.textContent = '(' + counts[riskKey] + ')';
      });

      if (all.length === 0) {
        tableScroll.style.display = 'none';
        pagination.style.display = 'none';
        emptyNoHistory.style.display = 'block';
        emptyNoResults.style.display = 'none';
        return;
      }
      emptyNoHistory.style.display = 'none';

      if (filtered.length === 0) {
        tableScroll.style.display = 'none';
        pagination.style.display = 'none';
        emptyNoResults.style.display = 'block';
        return;
      }
      emptyNoResults.style.display = 'none';
      tableScroll.style.display = 'block';

      var totalPages = Math.max(1, Math.ceil(filtered.length / CG.HISTORY_PAGE_SIZE));
      if (state.page >= totalPages) state.page = totalPages - 1;
      var start = state.page * CG.HISTORY_PAGE_SIZE;
      var pageItems = filtered.slice(start, start + CG.HISTORY_PAGE_SIZE);

      pagination.style.display = totalPages > 1 ? 'flex' : 'none';
      pageLabel.textContent = 'Page ' + (state.page + 1) + ' of ' + totalPages;
      prevBtn.disabled = state.page === 0;
      nextBtn.disabled = state.page >= totalPages - 1;

      tableBody.innerHTML = pageItems.map(function (e) {
        var expanded = state.expandedId === e.id;
        var row = '<tr data-id="' + e.id + '" tabindex="0" aria-expanded="' + expanded + '">' +
          '<td class="col-time" data-label="Time">' + CG.formatTime(e.ts) + '</td>' +
          '<td data-label="Risk"><span class="badge ' + e.risk + '">' + CG.escapeHtml(e.label) + '</span></td>' +
          '<td class="col-score" data-label="Score">' + e.score + '/100</td>' +
          '<td class="col-preview" data-label="Message">' + CG.escapeHtml(e.preview) + '</td>' +
          '<td class="col-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></td>' +
          '</tr>';
        if (expanded) {
          row += '<tr class="detail-row"><td colspan="5">' + renderDetail(e) + '</td></tr>';
        }
        return row;
      }).join('');

      tableBody.querySelectorAll('tr[data-id]').forEach(function (tr) {
        function toggle() {
          var id = tr.getAttribute('data-id');
          state.expandedId = state.expandedId === id ? null : id;
          render();
        }
        tr.addEventListener('click', toggle);
        tr.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(); }
        });
      });
    }

    function renderDetail(e) {
      var reasonsHtml = e.reasons.map(function (r) {
        return '<div class="reason ' + (r.neg ? 'neg' : 'pos') + '"><span class="dot"></span><span>' + CG.escapeHtml(r.text) + '</span></div>';
      }).join('');
      var patternHtml = e.patternMatch
        ? '<div class="pattern-banner"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5 22 20H2z"/><path d="M12 9.5v5"/><circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none"/></svg><span><b>Matches a known payment-diversion fraud pattern.</b></span></div>'
        : '';
      return '<div class="detail-grid">' +
        '<div class="detail-block"><h6>Reasons</h6><div class="reasons">' + reasonsHtml + '</div>' + patternHtml + '</div>' +
        '<div class="detail-block"><h6>Full message</h6><div class="detail-fulltext">' + CG.escapeHtml(e.fullText) + '</div>' +
        '<h6 style="margin-top:14px;">Recommended action</h6><p style="font-size:12px;color:var(--text-secondary);line-height:1.6;">' + CG.escapeHtml(e.action) + '</p></div>' +
        '</div>';
    }

    render();
  };

  /* ==================================================================== *
   * settings.html
   * ==================================================================== */

  CG.initSettingsPage = function () {
    var mediumSlider = document.getElementById('mediumSlider');
    if (!mediumSlider) return;
    var highSlider = document.getElementById('highSlider');
    var mediumValue = document.getElementById('mediumValue');
    var highValue = document.getElementById('highValue');
    var savedHint = document.getElementById('savedHint');
    var resetBtn = document.getElementById('resetThresholds');
    var clearBtn = document.getElementById('clearHistoryBtn');
    var historyCount = document.getElementById('settingsHistoryCount');
    var savedTimeout = null;

    function refreshCount() {
      var n = CG.getHistory().length;
      historyCount.textContent = n;
    }

    function applyFromState(t) {
      mediumSlider.value = t.medium;
      highSlider.value = t.high;
      mediumValue.textContent = t.medium;
      highValue.textContent = t.high;
    }

    function flashSaved() {
      savedHint.hidden = false;
      clearTimeout(savedTimeout);
      savedTimeout = setTimeout(function () { savedHint.hidden = true; }, 1600);
    }

    function commit() {
      var medium = Number(mediumSlider.value);
      var high = Number(highSlider.value);
      if (medium >= high) {
        if (this === mediumSlider) high = Math.min(99, medium + 1);
        else medium = Math.max(1, high - 1);
      }
      var saved = CG.setThresholds({ medium: medium, high: high });
      applyFromState(saved);
      flashSaved();
    }

    mediumSlider.addEventListener('input', function () { commit.call(mediumSlider); });
    highSlider.addEventListener('input', function () { commit.call(highSlider); });

    resetBtn.addEventListener('click', function () {
      var saved = CG.setThresholds(CG.DEFAULT_THRESHOLDS);
      applyFromState(saved);
      flashSaved();
    });

    var confirming = false;
    var confirmTimeout = null;
    clearBtn.addEventListener('click', function () {
      if (!confirming) {
        confirming = true;
        clearBtn.textContent = 'Click again to confirm';
        clearBtn.setAttribute('aria-live', 'polite');
        confirmTimeout = setTimeout(function () {
          confirming = false;
          clearBtn.textContent = 'Clear session history';
        }, 4000);
        return;
      }
      clearTimeout(confirmTimeout);
      confirming = false;
      CG.clearHistory();
      clearBtn.textContent = 'Clear session history';
      refreshCount();
    });

    applyFromState(CG.getThresholds());
    refreshCount();
  };

  /* ==================================================================== *
   * about.html
   * ==================================================================== */

  CG.initAboutPage = function () {
    var el = document.getElementById('sessionCheckCount');
    if (el) el.textContent = CG.getHistory().length;
  };

  window.CG = CG;
})();
