// Grabs last 100 turns from any LLM page
const MAX_TURNS = 100;

function harvestChat() {
  const selectors = [
    '[data-message-author-role]', '.claude-message',
    '.message', '.turn', 'main div[data-testid]' // generic fallbacks
  ];
  let turns = [];
  selectors.forEach(sel => {
    const nodes = document.querySelectorAll(sel);
    nodes.forEach(n => {
      const author = n.getAttribute?.('data-message-author-role') ||
                     (n.classList.contains('user') ? 'user' : 'assistant');
      const text   = (n.innerText || n.textContent || '').trim();
      if (text) turns.push({author, text});
    });
  });
  return turns.slice(-MAX_TURNS);
}

chrome.runtime.onMessage.addListener((msg, _, respond) => {
  if (msg.type === 'HARVEST') respond(harvestChat());
});