/* global chrome, transformers */
const { pipeline } = transformers;

const vsm = t => t.replace(/\B[aeiou]/gi, '');

let encoder;
async function getEncoder() {
  if (!encoder) {
    encoder = await pipeline(
      'feature-extraction',
      './lib/minilm-l6-v2.onnx',
      { dtype: 'q4', device: 'wasm' }
    );
  }
  return encoder;
}

document.getElementById('saveBtn').onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const { turns, llm } = await chrome.tabs.sendMessage(tab.id, { type: 'HARVEST' });
  if (!Array.isArray(turns) || !turns.length) return alert('No chat detected.');

  const useVSM = document.getElementById('vsmToggle').checked;
  const text = turns.map(t => `[${t.author}] ${useVSM ? vsm(t.text) : t.text}`).join('\n');
  const summary = `Summary of ${turns.length} turns`;

  const block = `
📌 CONTEXT INJECTION – MyMory Recall
- LLM: ${llm}
- Turns: ${turns.length}
>INSIGHTS
- ${summary}
@CHECKSUM#${btoa(summary).slice(-6)}
`.trim();

  const filename = `${llm}-${Date.now()}.mmr`;
  const url = URL.createObjectURL(new Blob([block], { type: 'text/plain' }));
  chrome.downloads.download({ url, filename });
  navigator.clipboard.writeText(block);
  document.getElementById('copyBtn').disabled = false;
};