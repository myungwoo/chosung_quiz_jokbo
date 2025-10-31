/* global CHOSEONG_DATA */
(function () {
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');
  const resultsEl = document.getElementById('results');

  const keyToEntries = new Map();
  const allKeys = [];
  for (const entry of (window.CHOSEONG_DATA || [])) {
    if (!keyToEntries.has(entry.key)) keyToEntries.set(entry.key, []);
    keyToEntries.get(entry.key).push(entry);
  }
  for (const k of keyToEntries.keys()) allKeys.push(k);
  allKeys.sort((a, b) => a.localeCompare(b));

  function renderEmpty(message) {
    resultsEl.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'empty';
    div.textContent = message;
    resultsEl.appendChild(div);
  }

  function copy(text) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  function createAnswerRow(answerText) {
    const row = document.createElement('div');
    row.className = 'answer';
    const span = document.createElement('div');
    span.textContent = answerText;
    const btn = document.createElement('button');
    btn.className = 'copy';
    btn.textContent = '복사';
    btn.addEventListener('click', () => copy(answerText));
    row.appendChild(span);
    row.appendChild(btn);
    return row;
  }

  function renderExact(key, entries) {
    const card = document.createElement('div');
    card.className = 'card';
    const h3 = document.createElement('h3');
    h3.textContent = '정확히 일치';
    const row = document.createElement('div');
    row.className = 'row';
    const keyEl = document.createElement('span');
    keyEl.className = 'key';
    keyEl.textContent = key;
    row.appendChild(keyEl);
    for (const e of entries) {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = e.category;
      row.appendChild(chip);
    }
    const answers = document.createElement('div');
    answers.className = 'answers';
    for (const e of entries) {
      for (const ans of e.answers) {
        answers.appendChild(createAnswerRow(ans));
      }
    }
    card.appendChild(h3);
    card.appendChild(row);
    card.appendChild(answers);
    return card;
  }

  function renderSuggestions(inputKey, excludeKey) {
    const matches = [];
    if (!inputKey) return matches;
    for (const k of allKeys) {
      if (k === excludeKey) continue;
      if (k.startsWith(inputKey)) matches.push(k);
      if (matches.length >= 100) break; // safety cap
    }
    return matches;
  }

  function renderSuggestionsCard(keys) {
    const card = document.createElement('div');
    card.className = 'card';
    const h3 = document.createElement('h3');
    h3.textContent = '시작 초성 일치 (제안)';
    const list = document.createElement('div');
    list.className = 'suggestions';
    for (const k of keys) {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      const left = document.createElement('div');
      left.className = 'left';
      const keyEl = document.createElement('span');
      keyEl.className = 'key';
      keyEl.textContent = k;
      const cats = (keyToEntries.get(k) || []).map(e => e.category);
      const uniqCats = Array.from(new Set(cats));
      for (const c of uniqCats) {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = c;
        left.appendChild(chip);
      }
      left.prepend(keyEl);
      const btn = document.createElement('button');
      btn.textContent = '불러오기';
      btn.addEventListener('click', () => {
        input.value = k;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
      });
      item.appendChild(left);
      item.appendChild(btn);
      list.appendChild(item);
    }
    card.appendChild(h3);
    card.appendChild(list);
    return card;
  }

  function normalize(s) {
    return (s || '').trim();
  }

  function onInput() {
    const q = normalize(input.value);
    if (!q) {
      renderEmpty('초성을 입력하면 결과가 여기에 표시됩니다.');
      return;
    }
    const exact = keyToEntries.get(q) || null;
    const suggestions = renderSuggestions(q, exact ? q : null);
    resultsEl.innerHTML = '';
    if (exact) resultsEl.appendChild(renderExact(q, exact));
    if (suggestions.length) resultsEl.appendChild(renderSuggestionsCard(suggestions));
    if (!exact && !suggestions.length) renderEmpty('일치하는 항목이 없습니다.');
  }

  input.addEventListener('input', onInput);
  clearBtn.addEventListener('click', () => { input.value = ''; input.focus(); input.dispatchEvent(new Event('input', { bubbles: true })); });
  onInput();
})();


