# drurl

**CLI tool to check URLs for redirects, security threats, and more.**

Check any link for redirects, HTTP status, final destination, phishing, malware, and more — right from your terminal.

🔍 Powered by [Google Safe Browsing](https://safebrowsing.google.com/) — the same protection used by Chrome, Firefox & Safari.

## Installation

```bash
npm install -g drurl
```

## Usage

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

## Output

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

## Features

- **Redirect Chain** — See every hop from start to final destination
- **Security Check** — Google Safe Browsing detection for malware, phishing, unwanted software
- **Response Times** — Per-hop and total response times
- **Health Score** — 0-100 score based on status codes, redirects, speed, and threats
- **Exit Codes** — `0` = safe, `1` = error, `2` = threat detected (useful for scripts)

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success, URL is safe |
| 1 | Error (network, invalid URL, etc.) |
| 2 | Threat detected (phishing, malware, etc.) |

Use in scripts:
```bash
drurl suspicious-link.com
if [ $? -eq 2 ]; then
  echo "⚠️ Threat detected!"
fi
```

## API

This CLI uses the [RedirectChecker.com](https://redirectchecker.com) API.

## Telegram Bot

Also available as a Telegram bot: [@DrURLbot](https://t.me/DrURLbot)

Type `@DrURLbot https://example.com` in any chat to check a link inline.

## License

MIT

## Links

- Website: [redirectchecker.com](https://redirectchecker.com)
- Telegram Bot: [@DrURLbot](https://t.me/DrURLbot)
- Issues: [GitHub Issues](https://github.com/redirectchecker/drurl/issues)
