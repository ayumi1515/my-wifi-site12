// ボタンやタブの日本語を、言葉のまとまり（文節）に分ける。
// 日本語はどの文字の間でも改行されるため、「提供エリ／ア」のような言葉の途中の改行が起きる。
// 「〜で」「〜を」「・」などの後ろだけで改行できるように、まとまりごとに <span class="phrase">（折り返さない）で包んで使う。
const BREAK_AFTER = /(?<=[でをにのはがとへもやて・、）])(?=[^\s→）、。・他])/u;

export function phrases(text: string): string[] {
  return text.split(BREAK_AFTER).filter(Boolean);
}
