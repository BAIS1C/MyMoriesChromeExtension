// Build .mmr string
function buildMMR(turns) {
  const lastUser = turns.filter(t=>t.author==='user').pop()?.text?.slice(0,60) || '';
  const insight = turns.slice(-3).map(t=>t.text).join(' ').slice(0,120) + '…';
  return `@SESSION chrome.user.${Date.now()}
$TIME ${new Date().toISOString()}
$MODEL unknown

>KEY_INSIGHTS
- ${insight}

>STATE_OBJECTS
turns==${turns.length}
compressed==true

>OPEN_LOOPS
- Continue conversation
- ${lastUser ? `Next user input: "${lastUser}…"` : 'Awaiting user'}

[[CODE]]
/* no code blocks captured */
[[/CODE]]

@CHECKSUM#${btoa(insight).slice(-6)}
`;
}

// Build dynamic decode prompt
function buildDecodePrompt(mmr, turns) {
  const lastUser = turns.filter(t=>t.author==='user').pop()?.text?.slice(0,60) || '';
  return `
📌 CONTEXT INJECTION – MyMory Recall Format
Resume from compressed memory below.
- Assume prior assistant role **in-progress**—do **not** greet or repeat earlier turns.
- Treat KEY_INSIGHTS as immediate working knowledge.
- Treat STATE_OBJECTS as current tool / variable state.
- Treat OPEN_LOOPS as the very next actions to address.
${lastUser ? `\nNext user message: "${lastUser}…"` : ''}

--- MyMory Block ---
${mmr}
--- End Block ---
`;
}

// Event wiring
document.getElementById('saveBtn').onclick = async () => {
  const [tab] = await chrome.tabs.query({active:true, currentWindow:true});
  const turns = await chrome.tabs.sendMessage(tab.id, {type:'HARVEST'});
  if (!turns.length) return alert('No chat detected on this page.');

  const mmr = buildMMR(turns);
  const subject = turns[0]?.text.slice(0,30).replace(/[^a-z0-9]/gi,'') || 'chat';
  const date = new Date().toISOString().slice(0,10);
  const filename = `${subject}${date}.mmr`;

  const blob = new Blob([mmr], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({url, filename});

  const prompt = buildDecodePrompt(mmr, turns);
  navigator.clipboard.writeText(prompt);
  document.getElementById('copyBtn').disabled = false;
};

document.getElementById('copyBtn').onclick = () => {
  // already copied above; button is just UX
};