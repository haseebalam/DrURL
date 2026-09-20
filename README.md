<p align="center">
  <img src="https://redirectchecker.com/logo.png" alt="DrURL" width="80" />
</p>

<h1 align="center">drurl</h1>

<p align="center">
  <strong>CLI tool to check URLs for redirects, security threats, and more.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/drurl-cli"><img src="https://img.shields.io/npm/v/drurl-cli.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/drurl-cli"><img src="https://img.shields.io/npm/dm/drurl-cli.svg" alt="npm downloads"></a>
  <a href="https://github.com/haseebalam/DrURL/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license"></a>
</p>

<p align="center">
  Check any link for redirects, HTTP status, final destination, phishing, malware, and more — right from your terminal.
</p>

<p align="center">
  🔍 <strong>Powered by Google Safe Browsing</strong> — the same protection used by Chrome, Firefox & Safari.
</p>

---

## 📦 Installation

```bash
npm install -g drurl-cli
```

---

## 🚀 Usage

```bash
# Check a URL
drurl google.com
drurl https://bit.ly/example
drurl "https://example.com/path?query=1"

# Help
drurl --help

# Version
drurl --version
```

---

## 📋 Output Example

```
🔗 Checking: bit.ly/example

📍 Redirect Chain:
  ├─ [301] https://bit.ly/example 125ms
  └─ [200] https://example.com 89ms

🎯 Final: https://example.com
   Status: 200 | Redirects: 1 | Time: 214ms

✅ Security: Safe (Google Safe Browsing)

🟢 Health Score: 100/100

📍 Scanned from Amsterdam, NL (AMS)
🌐 More at https://redirectchecker.com
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔗 **Redirect Chain** | See every hop from start to final destination |
| 🛡️ **Security Check** | Google Safe Browsing detection for malware, phishing, unwanted software |
| ⏱️ **Response Times** | Per-hop and total response times |
| 📊 **Health Score** | 0-100 score based on status codes, redirects, speed, and threats |
| 🔢 **Exit Codes** | `0` = safe, `1` = error, `2` = threat detected (useful for scripts) |

---

## 🔢 Exit Codes

| Code | Meaning |
|------|---------|
| `0` | ✅ Success, URL is safe |
| `1` | ❌ Error (network, invalid URL, etc.) |
| `2` | 🚨 Threat detected (phishing, malware, etc.) |

### Use in Scripts

```bash
drurl suspicious-link.com

if [ $? -eq 2 ]; then
  echo "⚠️ Threat detected!"
fi
```

---

## 🤖 Also Available

### Telegram Bot

Check links directly in Telegram: **[@DrURLbot](https://t.me/DrURLbot)**

Just type `@DrURLbot https://example.com` in any chat to check a link inline.

### Website

Full-featured web interface at **[RedirectChecker.com](https://redirectchecker.com)**

---

## 🔌 API

This CLI uses the [RedirectChecker.com](https://redirectchecker.com) API.

---

## 📄 License

MIT © [RedirectChecker.com](https://redirectchecker.com)

---

## 🔗 Links

- 🌐 **Website:** [redirectchecker.com](https://redirectchecker.com)
- 🤖 **Telegram Bot:** [@DrURLbot](https://t.me/DrURLbot)
- 🐛 **Issues:** [GitHub Issues](https://github.com/haseebalam/DrURL/issues)
- ⭐ **Star on GitHub:** [github.com/haseebalam/DrURL](https://github.com/haseebalam/DrURL)
