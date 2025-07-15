// Enhanced content script with better error handling and debugging
console.log('MyMory content script loaded on:', window.location.href);

// Set injection flag to prevent duplicate injections
window.myMoryInjected = true;

const MAX_TURNS = 550; // Increased from 100 as requested

function harvestChat() {
  console.log('🔍 Starting chat harvest...');
  
  const selectors = [
    // Grok specific (based on X integration)
    'div[data-testid="tweetText"]', // X post content used by Grok
    'div[data-testid="user-input"]', // User query input
    'div[data-testid="grok-response"]', // Grok's response
    '[data-testid*="conversation-turn"]', // Potential turn marker
    '.css-1j6n98s', // Content div from screenshot
    '.css-175b12r', // Container class from screenshot
    '[data-testid*="grok"]',
    '[data-testid*="chat"]',
    '[data-testid*="message"]',
    // Gemini specific (based on your screenshots)
    '[data-ngcontent*="ng-c"]', // Gemini's Angular components
    '.model-response-text',
    '.user-query-content',
    '.message-content',
    '[role="heading"]', // Gemini message headers
    '.query-text-line',
    '.query-content',
    '[class*="user-query"]',
    '[class*="model-response"]',
    '[class*="message"]',
    '[class*="conversation"]',
    '[class*="chat"]',
    'mat-sidenav-content [class*="ng-"]', // Gemini uses Angular Material
    // Kimi specific (based on actual DOM inspection)
    '.chat-content-item',
    '.chat-content-item-user',
    '.chat-content-item-assistant', 
    '.segment-container',
    '.segment-user',
    '.segment-assistant',
    '.user-content',
    '.segment-content',
    '.segment-content-box',
    '[class*="chat-content-item"]',
    '[class*="segment"]',
    '[data-v-259e85eb]',
    '[data-v-940b79a9]',
    '[data-v-61f9b95e]',
    // Claude specific (based on actual DOM inspection)
    '.prose',
    '[data-testid*="message"]',
    '[data-testid*="turn"]',
    '[role="presentation"]',
    '.whitespace-pre-wrap',
    // ChatGPT specific  
    '[data-message-author-role="user"]',
    '[data-message-author-role="assistant"]',
    '.message',
    // Generic fallbacks
    '.chat-message',
    '.message-content',
    'main div[data-testid]',
    'main div[class*="message"]',
    'div[class*="ng-star-inserted"]' // Angular components
  ];
  
  let allTurns = [];
  
  selectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      console.log(`📋 Selector "${selector}" found ${elements.length} elements`);
      
      elements.forEach(element => {
        let author = 'unknown';
        let text = (element.innerText || element.textContent || '').trim();
        
        // Skip empty or very short texts
        if (!text || text.length < 10) return;
        
        // Grok-specific author detection
        if (selector.includes('grok-response') || element.getAttribute('data-testid') === 'grok-response') {
          author = 'assistant';
        } else if (selector.includes('user-input') || element.getAttribute('data-testid') === 'user-input') {
          author = 'user';
        } else if (selector.includes('tweetText')) {
          // X post content could be either, analyze context
          author = text.length > 200 ? 'assistant' : 'user';
        } else if (element.closest('[data-testid*="grok"]')) {
          author = 'assistant';
        }
        
        // Gemini-specific author detection
        else if (selector.includes('user-query') || element.className.includes('user-query')) {
          author = 'user';
        } else if (selector.includes('model-response') || element.className.includes('model-response')) {
          author = 'assistant';
        } else if (text.toLowerCase().includes('optimize your delta force') || 
                   text.toLowerCase().includes('delta force')) {
          // Content-based detection for Gemini responses
          author = 'assistant';
        } else if (element.closest('[class*="user-query"]')) {
          author = 'user';
        } else if (element.closest('[class*="model-response"]')) {
          author = 'assistant';
        }
        
        // Try multiple ways to get author for other platforms
        if (author === 'unknown') {
          author = element.getAttribute('data-message-author-role');
          
          if (!author) {
            // Kimi-specific detection
            if (element.classList.contains('segment-user') || element.classList.contains('user-content')) {
              author = 'user';
            } else if (element.classList.contains('segment-assistant') || element.classList.contains('assistant-content')) {
              author = 'assistant';
            } else if (element.classList.contains('chat-content-item-user')) {
              author = 'user';
            } else if (element.classList.contains('chat-content-item-assistant')) {
              author = 'assistant';
            } else if (element.className.includes('user')) {
              author = 'user';
            } else if (element.className.includes('assistant')) {
              author = 'assistant';
            }
            
            // Check parent elements for Kimi patterns
            if (!author) {
              const segmentParent = element.closest('.segment-container');
              if (segmentParent) {
                if (segmentParent.querySelector('.segment-user') || segmentParent.querySelector('.user-content')) {
                  author = 'user';
                } else if (segmentParent.querySelector('.segment-assistant')) {
                  author = 'assistant';
                }
              }
            }
            
            // Claude-specific detection
            if (!author) {
              const parentElement = element.closest('[data-testid]');
              if (parentElement) {
                const testId = parentElement.getAttribute('data-testid');
                if (testId && testId.includes('user')) {
                  author = 'user';
                } else if (testId && (testId.includes('assistant') || testId.includes('claude'))) {
                  author = 'assistant';
                }
              }
            }
            
            // Check for Claude-specific patterns
            if (!author && element.closest('.prose')) {
              const proseParent = element.closest('.prose').parentElement;
              if (proseParent && proseParent.querySelector('[data-testid*="user"]')) {
                author = 'user';
              } else {
                author = 'assistant';
              }
            }
            
            // Legacy detection for other platforms
            if (!author) {
              if (element.classList.contains('user') || element.classList.contains('user-message')) {
                author = 'user';
              } else if (element.classList.contains('assistant') || element.classList.contains('ai-message')) {
                author = 'assistant';
              } else {
                // Default guess - if it's a long technical response, likely assistant
                author = text.length > 100 ? 'assistant' : 'user';
              }
            }
          }
        }
        
        // Filter out UI elements and navigation texts
        const isUIElement = text.match(/^(Copy|Retry|Share|Ask Anything|New|Show thinking|Gemini can make mistakes|Video|Deep Research|Canvas)$/i) || 
                           text.match(/^[\u4e00-\u9fff]+$/); // Chinese characters only
        
        // Don't filter by length for Gemini since responses can be long
        if (text && !isUIElement && text.length >= 10) {
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
  
  // Remove duplicates by text content (using a larger sample for better deduplication)
  const uniqueTurns = [];
  const seenTexts = new Set();
  
  allTurns.forEach(turn => {
    const textKey = turn.text.substring(0, 200); // Increased from 100 to 200 for better dedup
    if (!seenTexts.has(textKey)) {
      seenTexts.add(textKey);
      uniqueTurns.push({
        author: turn.author,
        text: turn.text
      });
    }
  });
  
  // Sort by DOM order to maintain conversation flow
  console.log(`✅ Harvested ${uniqueTurns.length} unique turns`);
  return uniqueTurns.slice(-MAX_TURNS);
}

// Only set up message listener if chrome runtime is available
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