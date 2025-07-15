# Changelog

## [0.63] - 2025-01-XX

### 🚀 New LLM Support
- **Gemini 2.5 Pro Support**: Full conversation extraction from gemini.google.com
- **Grok Support**: Full conversation extraction from X/Grok integration
- **Enhanced DOM Detection**: Improved Angular component recognition for Gemini's interface
- **X Platform Integration**: Support for Grok conversations within X ecosystem
- **Increased Turn Limit**: Default max turns raised from 100 to 550

### 🔧 Technical Improvements  
- **Better Author Detection**: Improved user/assistant classification for Gemini conversations
- **Content-Based Recognition**: Smart detection of technical responses vs user queries
- **Deduplication Enhancement**: Larger text sample (200 chars) for better duplicate removal

### 🎯 Platform Coverage
- **Working**: ChatGPT, Claude, Gemini, Kimi, Grok
- **Limited**: Perplexity, DeepSeek, Poe

## [0.62] - 2025-01-XX

### 🚀 Major Performance Improvements
- **On-demand Activation**: Extension now only activates when clicked, eliminating background resource overhead
- **Zero-impact Browsing**: No content scripts running on websites until extension is used
- **Simplified UI**: Removed refresh requirement notice

### 🔧 Core Functionality
- **Enhanced Compression**: VSM + Dictionary compression for 50% smaller files
- **Smart Detection**: Auto-detects ChatGPT, Claude, Kimi and other LLM platforms
- **Flexible Export**: Choose between compressed .txt or full JSON formats
- **Improved Error Handling**: Better feedback for unsupported sites

### 📝 User Experience
- **Context-Aware UI**: Button text changes based on detected platform
- **Clear Instructions**: "Drag and drop your txt into any LLM" guidance
- **Source Override**: Manual platform selection when auto-detection fails

### 🛠️ Technical Debt
- **Manifest V3**: Full migration to modern Chrome extension standards
- **On-demand Injection**: Content scripts only load when needed
- **Reduced Permissions**: Minimal permission footprint