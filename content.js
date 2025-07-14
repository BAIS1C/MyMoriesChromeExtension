// Enhanced content script with better error handling and debugging
console.log('MyMory content script loaded on:', window.location.href);

const MAX_TURNS = 100;

function harvestChat() {
  console.log('🔍 Starting chat harvest...');
  
  const selectors = [
    // Claude specific
    '[data-message-author-role]',
    '.claude-message',
    // ChatGPT specific  
    '[data-message-author-role="user"]',
    '[data-message-author-role="assistant"]',
    '.message',
    // Gemini specific
    '.conversation-turn', 
    '.model-response',
    '.user-input',
    // Generic fallbacks
    '.chat-message',
    '.message-content',
    'main div[data-testid]'
  ];
  
  let allTurns = [];
  
  selectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      console.log(`📋 Selector "${selector}" found ${elements.length} elements`);
      
      elements.forEach(element => {
        // Try multiple ways to get author
        let author = element.getAttribute('data-message-author-role');
        
        if (!author) {
          // Check class names
          if (element.classList.contains('user') || element.classList.contains('user-message')) {
            author = 'user';
          } else if (element.classList.contains('assistant') || element.classList.contains('ai-message')) {
            author = 'assistant';
          } else {
            // Default guess
            author = 'assistant';
          }
        }
        
        const text = (element.innerText || element.textContent || '').trim();
        
        if (text && text.length > 10) { // Filter short texts
          allTurns.push({
            author: author,
            text: text,
            selector: selector // For debugging
          });
        }
      });
    } catch (error) {
      console.error(`❌ Error with selector ${selector}:`, error);
    }
  });
  
  // Remove duplicates by text content
  const uniqueTurns = [];
  const seenTexts = new Set();
  
  allTurns.forEach(turn => {
    const textKey = turn.text.substring(0, 100);
    if (!seenTexts.has(textKey)) {
      seenTexts.add(textKey);
      uniqueTurns.push({
        author: turn.author,
        text: turn.text
      });
    }
  });
  
  console.log(`✅ Harvested ${uniqueTurns.length} unique turns`);
  return uniqueTurns.slice(-MAX_TURNS);
}

// IMPORTANT: Use chrome.runtime.onMessage, not chrome.runtime.onMessage
if (chrome && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 Content script received message:', message);
    
    if (message.type === 'HARVEST') {
      try {
        const turns = harvestChat();
        console.log('🎯 Sending response:', turns.length, 'turns');
        sendResponse(turns);
      } catch (error) {
        console.error('💥 Error harvesting:', error);
        sendResponse([]);
      }
    }
    
    // CRITICAL: Return true to keep the message channel open
    return true;
  });
  
  console.log('✅ MyMory content script ready!');
} else {
  console.error('❌ Chrome runtime not available');
}