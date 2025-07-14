/* global chrome */
import { pipeline } from './lib/transformers.min.js';

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
  if (!turns.length) return alert('No chat detected.');

  const useVSM = document.getElementById('vsmToggle').checked;
  const compression = useVSM ? 'vowelstrip' : 'raw';

  const full = turns.map(t => `[${t.author}] ${t.text}`).join('\n');
  const payload = useVSM ? turns.map(t => `[${t.author}] ${vsm(t.text)}`).join('\n') : full;

  const enc = await getEncoder();
  const vector = await enc(payload, { pooling: 'mean' });
  const summary = `Summary of ${turns.length} turns, length ${payload.length} chars`;
  const checksum = btoa(summary).slice(-6);

  const block = `
📌 CONTEXT INJECTION – MyMory Recall
- LLM: ${llm}
- Compression: ${compression}
- Turns: ${turns.length}

>KEY_INSIGHTS
- ${summary}

@CHECKSUM#${checksum}
--- End Block ---
`.trim();

  const filename = `${llm}-${Date.now()}.mmr`;
  const blob = new Blob([block], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({ url, filename });

  navigator.clipboard.writeText(block);
  document.getElementById('copyBtn').disabled = false;
};