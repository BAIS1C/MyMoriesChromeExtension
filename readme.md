# MyMory v0.64 β  

Chrome extension — save any LLM chat as a portable, fully-offline `.txt` file.  

✅ **Currently supports chat extraction from ChatGPT, Claude, Gemini, Kimi & Grok.** All LLMs can decompress your saved files.

## Features

- **🔥 Enhanced Multi-Layer Compression**: Dictionary + Symbolic + VSM achieves ~75% size reduction
- **🎯 Smart Symbolic Compression**: Emoji and text speak replacements for maximum token efficiency
- **💬 Multi-Platform Support**: Extract conversations from ChatGPT, Claude, Google Gemini, Kimi & Grok
- **🌐 Universal Compatibility**: Exported files work with any top-tier LLM
- **⚡ On-Demand Activation**: Zero overhead until you click to use
- **📚 Web Archiving**: Save any web content, not just chat conversations
- **📋 Multiple Formats**: Enhanced compressed TXT or full JSON export options
- **🔄 Instant Context**: Drag and drop files into any LLM to continue conversations

## Supported Platforms

### ✅ Full Support (Conversation Extraction)
- **ChatGPT** (chat.openai.com)
- **Claude** (claude.ai) 
- **Google Gemini** (gemini.google.com)
- **Kimi** (kimi.com)
- **Grok** (x.com/i/grok)

### ⚠️ Limited Support (Basic Content Archiving)
- **Perplexity** (perplexity.ai)
- **DeepSeek** (chat.deepseek.com)
- **Poe** (poe.com)

*All LLMs can decompress and restore MyMory files regardless of extraction support.*

## Installation  

### Manual Installation (Current)
```bash
git clone https://github.com/BAIS1C/MyMoriesChromeExtension.git
```
1. Open `chrome://extensions`
2. Enable "Developer mode" 
3. Click "Load unpacked"
4. Select the cloned folder

### Chrome Web Store (Coming Soon)
v1.0 release planned for Chrome Web Store

## Usage

1. **Navigate** to any supported LLM or webpage with content
2. **Click** the MyMory extension icon
3. **Choose** compression settings (Enhanced recommended)
4. **Save** your content as TXT file
5. **Drag and drop** the TXT file into any LLM to restore context

### ⚠️ Important Notes

- **Best Results**: ChatGPT, Claude, Gemini, Kimi & Grok offer full conversation extraction
- **Other Platforms**: Limited extraction but universal decompression support
- **Web Content**: Any webpage content can be archived
- **File Size**: Enhanced compressed files typically under 25MB (75% reduction)

## Compression Options

### 🔥 Enhanced Compression (Recommended)
**Multi-layer pipeline**: Dictionary → VSM → Symbolic
- **~75% size reduction** with excellent readability
- **Emoji & text speak**: "amazing" → 🤯, "you" → "u", "because" → "bc"
- **Business terms**: "documentation" → "docs", "development" → "dev"
- **Vowel stripping**: Applied after symbolic compression to avoid conflicts

### 📝 Base Compression
**Dictionary only**: Business and technical term compression
- **~20% size reduction**
- **High compatibility** with all LLMs
- **Professional focus** on corporate and technical vocabulary

### 📦 Full JSON
**Uncompressed archive** for testing and backup
- **Complete metadata** preservation
- **Zero compression** for maximum compatibility
- **Development and debugging** use cases

*💡 Enhanced compression uses a smart pipeline that prevents vowel-text conflicts and maximizes token efficiency.*

## Technical Details

### Compression Pipeline
```
Original Text
    ↓
Dictionary Compression (business terms)
    ↓  
VSM Vowel Stripping (consonant skeleton)
    ↓
Symbolic Compression (emojis + txtspk)
    ↓
Final Output (~75% smaller)
```

### Example Compression
```
Original: "Thank you for the amazing presentation about your development work"
Result:   "🙏 4 th 🤯 prs bt r dv wrk"
Savings:  75% size reduction, fully LLM-readable
```

## Coming Soon

- **v1.0**: Chrome Web Store release with ONNX semantic compression
- **More LLM Support**: Perplexity, DeepSeek full extraction
- **Semantic Compression**: Context-aware emoji selection with AI
- **Full Data Vault**: Complete archival system
- **IPFS Integration**: Auto-pin & NFT minting

---

Made with ❤️ by [Metafintek.com](https://metafintek.com)

## Icon Attribution

The toolbar icon is derived from  
["Machine Learning"](https://iconscout.com/icons/machine-learning)  
by [Smashing Stocks](https://iconscout.com/contributors/smashingstocks)  
on [IconScout](https://iconscout.com), used under the IconScout license.