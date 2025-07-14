document.getElementById('saveBtn').onclick = async () => {/* global chrome */

// FIX: Use UMD/global style instead of ES modules
let pipeline;
if (typeof window !== 'undefined' && window.transformers) {
  pipeline = window.transformers.pipeline;
  console.log('✅ Transformers loaded');
} else {
  console.log('⚠️ Transformers not available');
}

const vsm = t => t.replace(/\B[aeiou]/gi, '');

let encoder;
async function getEncoder() {
  if (!encoder && pipeline) {
    try {
      encoder = await pipeline(
        'feature-extraction',
        './lib/minilm-l6-v2.onnx',
        { dtype: 'q4', device: 'wasm' }
      );
    } catch (error) {
      console.error('Failed to load encoder:', error);
    }
  }
  return encoder;
}

// Store the decode prompt globally
let currentDecodePrompt = '';
  try {
    console.log('🚀 Save button clicked');
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('📍 Current tab:', tab.url);
    
    // Check if we're on a supported page
    const supportedSites = ['chatgpt.com', 'gemini.google.com', 'claude.ai', 'chat.openai.com'];
    const isSupported = supportedSites.some(site => tab.url.includes(site));
    
    if (!isSupported) {
      return alert(`Please navigate to a supported LLM site:\n${supportedSites.join('\n')}`);
    }
    
    // Send message with timeout handling
    let turns;
    try {
      turns = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for content script')), 5000);
        
        chrome.tabs.sendMessage(tab.id, { type: 'HARVEST' }, (response) => {
          clearTimeout(timeout);
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });
    } catch (error) {
      console.error('❌ Message error:', error);
      return alert(`Connection failed: ${error.message}\n\nTry refreshing the page and reopening the extension.`);
    }
    
    if (!Array.isArray(turns) || turns.length === 0) {
      return alert('No chat messages found on this page. Make sure you\'re on a chat page with visible messages.');
    }

    console.log(`📊 Found ${turns.length} turns`);

    // Detect LLM from URL
    const llm = tab.url.includes('chatgpt') || tab.url.includes('openai') ? 'ChatGPT' : 
               tab.url.includes('gemini') ? 'Gemini' : 
               tab.url.includes('claude') ? 'Claude' : 'Unknown';

    const useVSM = document.getElementById('vsmToggle').checked;
    const useFullJSON = document.getElementById('fullToggle').checked;

    // Apply VSM if enabled
    const processedTurns = turns.map(t => ({
      author: t.author,
      text: useVSM ? vsm(t.text) : t.text
    }));

    const chatText = processedTurns.map(t => `[${t.author}] ${t.text}`).join('\n');
    const summary = `Summary of ${turns.length} turns${useVSM ? ' (VSM applied)' : ''}`;

    // Create the compressed .mmr content
    const block = `
📌 CONTEXT INJECTION – MyMory Recall
- LLM: ${llm}
- Turns: ${turns.length}
- VSM: ${useVSM ? 'ON' : 'OFF'}
>INSIGHTS
- ${summary}
>COMPRESSED_CHAT
${chatText}
@CHECKSUM#${btoa(summary).slice(-6)}
`.trim();

    // Generate decode prompt
    currentDecodePrompt = `
🔄 DECODE MyMory Context:

You are receiving a compressed conversation context from MyMory extension. Please:

1. **Restore the conversation flow** from the compressed data below
2. **Expand abbreviated text** ${useVSM ? '(VSM vowel-stripping was applied - restore missing vowels)' : ''}
3. **Continue the conversation** naturally from where it left off
4. **Maintain the same tone and context** as the original discussion

Original conversation had ${turns.length} turns between user and ${llm}.

COMPRESSED DATA:
---
${block}
---

Please acknowledge you've received this context and are ready to continue the conversation.
`.trim();

    // Handle downloads based on checkboxes - can be both!
    const timestamp = Date.now();
    
    // Create compressed .mmr version if VSM is checked OR if neither is checked (default behavior)
    if (useVSM || !useFullJSON) {
      const compressedFilename = useVSM ? `${llm}-vsm-${timestamp}.mmr` : `${llm}-${timestamp}.mmr`;
      const compressedBlob = new Blob([block], { type: 'text/plain' });
      const compressedUrl = URL.createObjectURL(compressedBlob);
      chrome.downloads.download({ url: compressedUrl, filename: compressedFilename });
      console.log(`📦 Downloaded ${useVSM ? 'VSM' : 'standard'} compressed version`);
    }
    
    // Create full JSON version if Full is checked
    if (useFullJSON) {
      const fullContent = JSON.stringify({
        metadata: {
          llm: llm,
          turns: turns.length,
          timestamp: timestamp,
          vsm: false, // Full version never has VSM applied
          url: tab.url
        },
        conversations: turns // Original turns without VSM
      }, null, 2);
      
      const fullFilename = `${llm}-full-${timestamp}.json`;
      const fullBlob = new Blob([fullContent], { type: 'application/json' });
      const fullUrl = URL.createObjectURL(fullBlob);
      
      // Small delay to ensure VSM downloads first
      setTimeout(() => {
        chrome.downloads.download({ url: fullUrl, filename: fullFilename });
        console.log('📦 Downloaded Full JSON version');
      }, 100);
    }
    
    // Copy decode prompt to clipboard (for convenience)
    navigator.clipboard.writeText(currentDecodePrompt);
    
    console.log('✅ File(s) saved successfully');
    
  } catch (error) {
    console.error('💥 Extension error:', error);
    alert('Error: ' + error.message);
  }
};