// 入力をかんたんにする共通の部品
// - attachSuggest: 文字を打つ前から候補を出し、打つと候補をしぼる（ひらがな・カタカナ・全角半角を区別しない）
// - enhanceSelects: 選ぶ欄を、少ない選択肢はタップのボタンに、多い選択肢は候補つきの入力にする（元の select は残して値だけ合わせる）
// - attachAmountSuggest: 金額の欄に、よくある金額と、打った数字から予想した金額を出す

export interface SuggestItem {
  label: string;
  sub?: string;
  keys?: string[];
  value?: string;
  href?: string;
  data?: unknown;
}

interface SuggestOptions {
  items: () => SuggestItem[];
  initial?: () => SuggestItem[];
  max?: number;
  onPick?: (item: SuggestItem) => void;
  emptyText?: string;
}

export const normaliseText = (value: string) =>
  value.normalize('NFKC').toLowerCase().replace(/[\s・　]/g, '').replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

let suggestCount = 0;

export function attachSuggest(input: HTMLInputElement, options: SuggestOptions) {
  if (input.dataset.suggestReady) return;
  input.dataset.suggestReady = '1';
  const id = `suggest-list-${++suggestCount}`;
  const wrap = document.createElement('span');
  wrap.className = 'suggest-wrap';
  input.parentNode?.insertBefore(wrap, input);
  wrap.append(input);
  const list = document.createElement('ul');
  list.className = 'suggest-list';
  list.id = id;
  list.setAttribute('role', 'listbox');
  list.hidden = true;
  wrap.append(list);
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', [input.getAttribute('aria-controls'), id].filter(Boolean).join(' '));
  input.autocomplete = 'off';
  let shown: SuggestItem[] = [];
  let active = -1;
  const max = options.max ?? 8;

  const close = () => {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  };
  const setActive = (index: number) => {
    const rows = [...list.querySelectorAll<HTMLElement>('[role=option]')];
    active = rows.length ? (index + rows.length) % rows.length : -1;
    rows.forEach((row, i) => row.setAttribute('aria-selected', String(i === active)));
    if (active >= 0) {
      input.setAttribute('aria-activedescendant', rows[active].id);
      rows[active].scrollIntoView({ block: 'nearest' });
    }
  };
  const pick = (item: SuggestItem) => {
    input.value = item.value ?? item.label;
    close();
    input.dispatchEvent(new Event('input', { bubbles: true }));
    options.onPick?.(item);
    if (item.href) location.href = item.href;
  };
  const render = () => {
    if (input.disabled) return close();
    const query = normaliseText(input.value.trim());
    const all = options.items();
    if (!query) {
      shown = (options.initial ? options.initial() : all).slice(0, max);
    } else {
      const scored: { item: SuggestItem; score: number; order: number }[] = [];
      all.forEach((item, order) => {
        const keys = [item.label, ...(item.keys ?? [])].map(normaliseText);
        const score = keys.some((k) => k.startsWith(query)) ? 0 : keys.some((k) => k.includes(query)) ? 1 : -1;
        if (score >= 0) scored.push({ item, score, order });
      });
      shown = scored.sort((a, b) => a.score - b.score || a.order - b.order).slice(0, max).map((s) => s.item);
    }
    list.replaceChildren();
    if (!shown.length) {
      if (!query) return close();
      const li = document.createElement('li');
      li.className = 'suggest-empty';
      li.textContent = options.emptyText ?? '候補が見つかりません。ひらがなや名前の一部でも探せます。';
      list.append(li);
    }
    shown.forEach((item, i) => {
      const li = document.createElement('li');
      li.id = `${id}-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      const strong = document.createElement('span');
      strong.className = 'suggest-label';
      strong.textContent = item.label;
      li.append(strong);
      if (item.sub) {
        const sub = document.createElement('small');
        sub.textContent = item.sub;
        li.append(sub);
      }
      li.addEventListener('mousedown', (event) => event.preventDefault());
      li.addEventListener('click', () => pick(item));
      list.append(li);
    });
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    active = -1;
  };

  input.addEventListener('focus', render);
  input.addEventListener('click', () => { if (list.hidden) render(); });
  input.addEventListener('input', (event) => { if (event.isTrusted) render(); });
  input.addEventListener('blur', () => setTimeout(close, 150));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); if (list.hidden) render(); setActive(active + 1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive(active - 1); }
    else if (event.key === 'Enter') {
      if (!list.hidden && shown.length) { event.preventDefault(); pick(shown[Math.max(active, 0)]); }
    } else if (event.key === 'Escape') close();
  });
  return { refresh: () => { if (!list.hidden) render(); }, close };
}

// 都道府県の読みがな（ひらがなで打っても出るように）
export const PREFECTURE_KANA: Record<string, string> = {
  北海道: 'ほっかいどう', 青森県: 'あおもりけん', 岩手県: 'いわてけん', 宮城県: 'みやぎけん', 秋田県: 'あきたけん', 山形県: 'やまがたけん', 福島県: 'ふくしまけん',
  茨城県: 'いばらきけん', 栃木県: 'とちぎけん', 群馬県: 'ぐんまけん', 埼玉県: 'さいたまけん', 千葉県: 'ちばけん', 東京都: 'とうきょうと', 神奈川県: 'かながわけん',
  新潟県: 'にいがたけん', 富山県: 'とやまけん', 石川県: 'いしかわけん', 福井県: 'ふくいけん', 山梨県: 'やまなしけん', 長野県: 'ながのけん', 岐阜県: 'ぎふけん',
  静岡県: 'しずおかけん', 愛知県: 'あいちけん', 三重県: 'みえけん', 滋賀県: 'しがけん', 京都府: 'きょうとふ', 大阪府: 'おおさかふ', 兵庫県: 'ひょうごけん',
  奈良県: 'ならけん', 和歌山県: 'わかやまけん', 鳥取県: 'とっとりけん', 島根県: 'しまねけん', 岡山県: 'おかやまけん', 広島県: 'ひろしまけん', 山口県: 'やまぐちけん',
  徳島県: 'とくしまけん', 香川県: 'かがわけん', 愛媛県: 'えひめけん', 高知県: 'こうちけん', 福岡県: 'ふくおかけん', 佐賀県: 'さがけん', 長崎県: 'ながさきけん',
  熊本県: 'くまもとけん', 大分県: 'おおいたけん', 宮崎県: 'みやざきけん', 鹿児島県: 'かごしまけん', 沖縄県: 'おきなわけん',
};

// ブランド名の読みがな・よくある呼び方
export const BRAND_KANA: Record<string, string[]> = {
  docomo: ['どこも', 'docomo'], au: ['えーゆー', 'au'], softbank: ['そふとばんく', 'softbank'], ymobile: ['わいもばいる', 'ymobile', 'y!mobile'],
  'uq-mobile': ['ゆーきゅー', 'uq'], 'rakuten-mobile': ['らくてん', 'rakuten'], ahamo: ['あはも'], linemo: ['らいんも', 'らいんもばいる'], povo: ['ぽぼ', 'ぽーぼ'],
  iijmio: ['あいあいじぇいみお', 'みお'], mineo: ['まいねお'], 'nuro-mobile': ['にゅーろ', 'nuro'], 'his-mobile': ['えいちあいえす', 'his'], 'aeon-mobile': ['いおん', 'aeon'],
  'nihon-tsushin': ['にほんつうしん'], 'x-mobile': ['えっくすもばいる', 'xmobile'], eset: ['いーせっと'], norton: ['のーとん'], virusbuster: ['ういるすばすたー'],
  mmoba: ['えむもば'], 'daiwan-telecom': ['だいわん'], iosys: ['いおしす'], geo: ['げお'],
};

// 選ぶ欄をタップボタン／候補つき入力にする
interface EnhanceOptions {
  chipsMax?: number;
  primary?: Record<string, string[]>; // name → 最初に見せる値（残りは「ほかも表示」）
  kana?: (option: HTMLOptionElement, select: HTMLSelectElement) => string[];
  skip?: (select: HTMLSelectElement) => boolean;
}

export function enhanceSelects(root: ParentNode, options: EnhanceOptions = {}) {
  const selects = [...root.querySelectorAll<HTMLSelectElement>('select')].filter((s) => !s.dataset.enhanced && !options.skip?.(s));
  const syncers: (() => void)[] = [];
  selects.forEach((select) => {
    select.dataset.enhanced = '1';
    const usable = () => [...select.options].filter((o) => o.value !== '' || select.options.length === 1);
    const asChips = select.dataset.assist === 'chips' || (select.dataset.assist !== 'combo' && usable().length <= (options.chipsMax ?? 10) && select.options.length <= 12 && !select.matches('[data-dynamic-options]'));
    const label = select.id ? root.querySelector<HTMLLabelElement>(`label[for="${select.id}"]`) : null;
    if (label && !label.id) label.id = `${select.id}-label`;
    select.classList.add('assist-native');
    select.tabIndex = -1;
    if (asChips) {
      const group = document.createElement('div');
      group.className = 'choice-chips';
      group.setAttribute('role', 'group');
      if (label) group.setAttribute('aria-labelledby', label.id);
      select.after(group);
      const primary = select.name ? options.primary?.[select.name.replace(/-\d+$/, '')] : undefined;
      let expanded = false;
      // 最初に見せるもの：選んでいるもの、または（data-extra でなく）primary に入っているもの
      const showable = (option: HTMLOptionElement, index: number) => index === select.selectedIndex || (!option.hasAttribute('data-extra') && (!primary || primary.includes(option.value)));
      const render = () => {
        group.replaceChildren();
        const opts = [...select.options];
        // 「先に〜を選んでください」だけのときは、ボタンではなく案内の文字にする
        if (opts.length === 1 && (opts[0].value === '' || select.disabled)) { const hint = document.createElement('span'); hint.className = 'chip-hint'; hint.textContent = opts[0].textContent ?? ''; group.append(hint); return; }
        let hiddenCount = 0;
        opts.forEach((option, index) => {
          if (option.value === '' && opts.length > 1) return;
          const isPrimary = showable(option, index);
          if (!isPrimary && !expanded) { hiddenCount++; return; }
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = option.dataset.chip ?? option.textContent ?? '';
          button.setAttribute('aria-pressed', String(index === select.selectedIndex));
          button.disabled = select.disabled || option.disabled;
          button.addEventListener('click', () => {
            if (select.selectedIndex === index) return;
            select.selectedIndex = index;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            sync();
          });
          group.append(button);
        });
        if (hiddenCount) {
          const more = document.createElement('button');
          more.type = 'button';
          more.className = 'chip-more';
          more.textContent = `ほかの${hiddenCount}件も表示`;
          more.disabled = select.disabled;
          more.addEventListener('click', () => { expanded = true; render(); (group.querySelectorAll('button')[group.querySelectorAll('button').length - hiddenCount] as HTMLButtonElement | undefined)?.focus(); });
          group.append(more);
        }
      };
      const sync = () => {
        const buttons = [...group.querySelectorAll<HTMLButtonElement>('button:not(.chip-more)')];
        if (group.querySelector('.chip-hint') || (select.options.length === 1 && (select.options[0].value === '' || select.disabled))) return render();
        const expected = [...select.options].filter((o, i) => (o.value !== '' || select.options.length === 1) && (expanded || showable(o, i))).length;
        if (buttons.length !== expected || buttons.some((b) => b.disabled !== select.disabled)) return render();
        let i = 0;
        [...select.options].forEach((option, index) => {
          if (option.value === '' && select.options.length > 1) return;
          if (!expanded && !showable(option, index)) return;
          buttons[i++]?.setAttribute('aria-pressed', String(index === select.selectedIndex));
        });
      };
      render();
      syncers.push(sync);
      new MutationObserver(render).observe(select, { childList: true, attributes: true, attributeFilter: ['disabled'] });
      select.addEventListener('change', sync);
      select.addEventListener('invalid', () => { group.classList.add('is-invalid'); group.querySelector<HTMLButtonElement>('button')?.focus(); });
      select.addEventListener('change', () => group.classList.remove('is-invalid'));
    } else {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'assist-combo';
      input.setAttribute('enterkeyhint', 'done');
      if (label) input.setAttribute('aria-labelledby', label.id);
      select.after(input);
      const textOf = () => (select.value === '' ? '' : select.selectedOptions[0]?.textContent ?? '');
      const placeholderOf = () => (select.disabled ? (select.options[0]?.textContent ?? '') : 'タップして選ぶ・ひらがなで探せます');
      const sync = () => {
        input.disabled = select.disabled;
        input.placeholder = placeholderOf();
        if (document.activeElement !== input) input.value = textOf();
      };
      const items = () => [...select.options].filter((o) => o.value !== '').map((o) => ({ label: o.textContent ?? '', value: o.value, keys: [o.dataset.kana ?? '', ...(options.kana?.(o, select) ?? [])].filter(Boolean) }));
      attachSuggest(input, {
        items,
        max: 60,
        onPick: (item) => {
          select.value = item.value ?? '';
          select.dispatchEvent(new Event('change', { bubbles: true }));
          input.value = textOf();
        },
      });
      input.addEventListener('focus', () => input.select());
      input.addEventListener('blur', () => setTimeout(() => {
        const typed = normaliseText(input.value.trim());
        if (!typed) { if (select.value !== '' && !select.required && select.options[0]?.value === '') { select.value = ''; select.dispatchEvent(new Event('change', { bubbles: true })); } input.value = textOf(); return; }
        const match = items().filter((i) => [i.label, ...i.keys].some((k) => normaliseText(k) === typed || normaliseText(k).startsWith(typed)));
        if (match.length === 1 && match[0].value !== select.value) { select.value = match[0].value; select.dispatchEvent(new Event('change', { bubbles: true })); }
        input.value = textOf();
      }, 200));
      sync();
      syncers.push(sync);
      new MutationObserver(sync).observe(select, { childList: true, attributes: true, attributeFilter: ['disabled'] });
      select.addEventListener('change', sync);
      select.addEventListener('invalid', () => { input.classList.add('is-invalid'); input.focus(); });
      select.addEventListener('change', () => input.classList.remove('is-invalid'));
    }
  });
  const syncAll = () => syncers.forEach((s) => s());
  const form = selects[0]?.form;
  form?.addEventListener('reset', () => setTimeout(syncAll, 10));
  form?.addEventListener('change', () => setTimeout(syncAll, 0));
  return syncAll;
}

// 金額の欄：よくある金額と、打った数字から予想した金額を出す
export function attachAmountSuggest(input: HTMLInputElement, config: { common: number[]; min?: number; max?: number; zeroLabel?: string; unknownLabel?: string; unit?: string }) {
  const unit = config.unit ?? '円';
  const yen = (n: number) => `${n.toLocaleString('ja-JP')}${unit}`;
  const label = (n: number) => (n === 0 && config.zeroLabel ? config.zeroLabel : yen(n));
  const min = config.min ?? 0;
  const max = config.max ?? 1000000;
  const unknown: SuggestItem = { label: config.unknownLabel ?? 'わからない（空欄のまま）', value: '', keys: [] };
  const items = () => {
    const raw = input.value.replace(/[^0-9]/g, '');
    if (!raw) return [...config.common.map((n) => ({ label: label(n), value: String(n) })), unknown];
    const typed = Number(raw);
    const guesses = new Set<number>();
    config.common.filter((n) => String(n).startsWith(raw)).forEach((n) => guesses.add(n));
    [typed * 1000, typed * 100, typed * 10, typed].forEach((n) => { if (n >= Math.max(min, 1) && n <= max) guesses.add(n); });
    if (typed === 0) guesses.add(0);
    return [...guesses].slice(0, 6).map((n) => ({ label: label(n), value: String(n), keys: [raw] }));
  };
  attachSuggest(input, {
    items: () => items().map((i) => ({ ...i, keys: [input.value.replace(/[^0-9]/g, '')] })),
    initial: items,
    max: 8,
    onPick: () => input.dispatchEvent(new Event('change', { bubbles: true })),
  });
}
