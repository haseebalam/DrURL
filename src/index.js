#!/usr/bin/env node

/**
 * drurl - CLI URL checker
 * 
 * Check any URL for redirects, security threats, and more.
 * Powered by RedirectChecker.com
 * 
 * Usage:
 *   drurl https://example.com
 *   drurl bit.ly/example
 *   drurl --help
 */

const API_URL = 'https://api.redirectchecker.com/api/cli_check';
const VERSION = '1.0.0';

// ─── Colors (ANSI) ────────────────────────────────────────────────────────────
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
};

const c = (color, text) => `${colors[color]}${text}${colors.reset}`;
const bold = (text) => `${colors.bold}${text}${colors.reset}`;
const dim = (text) => `${colors.dim}${text}${colors.reset}`;

// ─── Help Message ─────────────────────────────────────────────────────────────
function showHelp() {
  console.log(`
${c('cyan', c('bold', 'drurl'))} - Check URLs for redirects and security threats

${c('bold', 'USAGE')}
  drurl <url>              Check a single URL
  drurl --help, -h         Show this help message
  drurl --version, -v      Show version

${c('bold', 'EXAMPLES')}
  drurl google.com
  drurl https://bit.ly/example
  drurl "https://example.com/path?query=1"

${c('bold', 'OUTPUT')}
  • Full redirect chain with status codes
  • Security check (Google Safe Browsing)
  • Response times
  • Health score (0-100)

${c('dim', 'Powered by RedirectChecker.com')}
`);
}

// ─── Status Code Color ────────────────────────────────────────────────────────
function getStatusColor(code) {
  if (code >= 200 && code < 300) return 'green';
  if (code >= 300 && code < 400) return 'yellow';
  if (code >= 400 && code < 500) return 'red';
  if (code >= 500) return 'red';
  return 'gray';
}

function getStatusEmoji(code) {
  if (code >= 200 && code < 300) return '✅';
  if (code >= 300 && code < 400) return '↪️ ';
  if (code >= 400 && code < 500) return '❌';
  if (code >= 500) return '💥';
  return '❓';
}

// ─── Box Drawing ──────────────────────────────────────────────────────────────
const BOX_WIDTH = 60;
const line = dim('─'.repeat(BOX_WIDTH));

// ─── Format Redirect Chain ────────────────────────────────────────────────────
function formatChain(chain) {
  let output = '';
  
  chain.forEach((hop, index) => {
    const statusColor = getStatusColor(hop.statusCode);
    const emoji = getStatusEmoji(hop.statusCode);
    
    const status = hop.statusCode 
      ? c(statusColor, hop.statusCode)
      : c('red', 'ERR');
    
    const statusText = hop.statusText || '';
    const time = dim(`⏱️  ${hop.responseTime}ms`);
    
    // Truncate long URLs
    let url = hop.url;
    if (url.length > 55) {
      url = url.substring(0, 52) + '...';
    }
    
    output += `${emoji} ${c('cyan', url)}\n`;
    output += `   ${status} ${statusText} ${time}\n`;
    
    if (hop.error) {
      output += `   ${c('red', '└─ Error: ' + hop.error)}\n`;
    }
    
    if (index < chain.length - 1) {
      output += '\n';
    }
  });
  
  return output;
}

// ─── Format Security Status ───────────────────────────────────────────────────
function formatSecurity(security) {
  if (!security.checked) {
    return `⚪ ${dim('Security check: Not available')}`;
  }
  
  if (security.safe) {
    return `${c('green', '✅ SAFE')} ${dim('— No threats detected')}\n   ${dim('Advisory by Google Safe Browsing')}`;
  }
  
  let output = `\n${c('red', c('bold', '🚨 SECURITY WARNING 🚨'))}\n`;
  output += line + '\n';
  
  security.threats.forEach(threat => {
    const labels = {
      'MALWARE': ['🦠', 'Malware', 'This site may install harmful software'],
      'SOCIAL_ENGINEERING': ['🎣', 'Phishing', 'This site may trick you into revealing personal info'],
      'UNWANTED_SOFTWARE': ['⚠️ ', 'Unwanted Software', 'This site contains potentially unwanted programs'],
      'POTENTIALLY_HARMFUL_APPLICATION': ['⚠️ ', 'Harmful App', 'This site may contain harmful applications'],
    };
    
    const [emoji, label, desc] = labels[threat.type] || ['⚠️ ', threat.type, 'Potentially dangerous'];
    
    output += `${emoji} ${c('red', bold(label))}\n`;
    output += `   ${c('yellow', desc)}\n\n`;
  });
  
  output += `${dim('⚠️  Advisory provided by Google Safe Browsing')}`;
  
  return output;
}

// ─── Format Health Score ──────────────────────────────────────────────────────
function formatHealthScore(score) {
  let color = 'green';
  let emoji = '🟢';
  let label = 'Excellent';
  
  if (score < 50) {
    color = 'red';
    emoji = '🔴';
    label = 'Poor';
  } else if (score < 80) {
    color = 'yellow';
    emoji = '🟡';
    label = 'Fair';
  }
  
  const bar = '█'.repeat(Math.floor(score / 10)) + '░'.repeat(10 - Math.floor(score / 10));
  
  return `${emoji} Health: ${c(color, bold(score + '/100'))} ${dim(label)}\n   ${c(color, bar)}`;
}

// ─── Main Check Function ──────────────────────────────────────────────────────
async function checkUrl(url) {
  console.log('');
  console.log(bold('🔗 URL Redirection Report'));
  console.log(line);
  console.log(`📎 ${c('cyan', url)}`);
  console.log('');
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      console.log(c('red', `❌ Error: ${data.error}`));
      process.exit(1);
    }
    
    // Security Warning (if threat detected - show first)
    if (!data.security.safe) {
      console.log(formatSecurity(data.security));
      console.log('');
      console.log(line);
      console.log('');
    }
    
    // Redirect Chain
    console.log(bold('📍 Redirect Chain'));
    console.log('');
    console.log(formatChain(data.result.chain));
    
    console.log(line);
    console.log('');
    
    // Summary Section
    console.log(bold('📊 Summary'));
    console.log(`   • Redirects: ${c('cyan', data.result.redirectCount)}`);
    console.log(`   • Total Time: ${c('cyan', data.result.totalTime + 'ms')}`);
    
    // Final Status
    const finalStatus = data.result.finalStatus;
    const finalColor = getStatusColor(finalStatus);
    console.log(`   • Final Status: ${c(finalColor, finalStatus)}`);
    
    // HTTPS check
    const isHttps = data.result.finalUrl?.startsWith('https://');
    if (!isHttps) {
      console.log(`   • ${c('yellow', '⚠️  Not using HTTPS')}`);
    } else {
      console.log(`   • ${c('green', '🔒 HTTPS')}`);
    }
    
    console.log('');
    
    // Health Score
    console.log(formatHealthScore(data.healthScore));
    console.log('');
    
    // Security (if safe)
    if (data.security.safe) {
      console.log(formatSecurity(data.security));
      console.log('');
    }
    
    console.log(line);
    
    // Footer
    const loc = data.checkedFrom;
    const flag = getCountryFlag(loc.country);
    console.log(dim(`📍 Scanned as Chrome 124 from ${flag} ${loc.city}`));
    console.log(dim(`🌐 More details at redirectchecker.com`));
    console.log('');
    
    // Exit code based on safety
    if (!data.security.safe) {
      process.exit(2); // Threat detected
    }
    
  } catch (err) {
    console.log(c('red', `❌ Network error: ${err.message}`));
    console.log(dim('Check your internet connection and try again.'));
    process.exit(1);
  }
}

// ─── Country Flag Emoji ───────────────────────────────────────────────────────
function getCountryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  const offset = 127397;
  const chars = countryCode.toUpperCase().split('');
  return String.fromCodePoint(...chars.map(c => c.charCodeAt(0) + offset));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  console.log(`drurl v${VERSION}`);
  process.exit(0);
}

// Get URL (first non-flag argument)
const url = args.find(arg => !arg.startsWith('-'));

if (!url) {
  console.log(c('red', 'Error: Please provide a URL'));
  console.log('Usage: drurl <url>');
  process.exit(1);
}

checkUrl(url);
