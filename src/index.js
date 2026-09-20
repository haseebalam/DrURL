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
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

const c = (color, text) => `${colors[color]}${text}${colors.reset}`;

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

// ─── Format Redirect Chain ────────────────────────────────────────────────────
function formatChain(chain) {
  let output = '';
  
  chain.forEach((hop, index) => {
    const isLast = index === chain.length - 1;
    const prefix = isLast ? '└─' : '├─';
    const statusColor = getStatusColor(hop.statusCode);
    
    const status = hop.statusCode 
      ? c(statusColor, `[${hop.statusCode}]`)
      : c('red', '[ERR]');
    
    const time = c('dim', `${hop.responseTime}ms`);
    
    // Truncate long URLs
    let url = hop.url;
    if (url.length > 70) {
      url = url.substring(0, 67) + '...';
    }
    
    output += `  ${c('dim', prefix)} ${status} ${url} ${time}\n`;
    
    if (hop.error) {
      output += `     ${c('red', '└─ Error: ' + hop.error)}\n`;
    }
  });
  
  return output;
}

// ─── Format Security Status ───────────────────────────────────────────────────
function formatSecurity(security) {
  if (!security.checked) {
    return c('dim', '⚪ Security: Not checked');
  }
  
  if (security.safe) {
    return c('green', '✅ Security: Safe') + c('dim', ' (Google Safe Browsing)');
  }
  
  let output = c('red', c('bold', '🚨 THREAT DETECTED'));
  security.threats.forEach(threat => {
    const label = {
      'MALWARE': '🦠 Malware',
      'SOCIAL_ENGINEERING': '🎣 Phishing',
      'UNWANTED_SOFTWARE': '⚠️  Unwanted Software',
      'POTENTIALLY_HARMFUL_APPLICATION': '⚠️  Harmful App',
    }[threat.type] || `⚠️  ${threat.type}`;
    
    output += `\n  ${c('red', label)}: ${threat.url}`;
  });
  
  return output;
}

// ─── Format Health Score ──────────────────────────────────────────────────────
function formatHealthScore(score) {
  let color = 'green';
  let emoji = '🟢';
  
  if (score < 50) {
    color = 'red';
    emoji = '🔴';
  } else if (score < 80) {
    color = 'yellow';
    emoji = '🟡';
  }
  
  return `${emoji} Health Score: ${c(color, c('bold', score + '/100'))}`;
}

// ─── Main Check Function ──────────────────────────────────────────────────────
async function checkUrl(url) {
  console.log(`\n${c('cyan', '🔗 Checking:')} ${url}\n`);
  
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
    
    // Redirect Chain
    console.log(c('bold', '📍 Redirect Chain:'));
    console.log(formatChain(data.result.chain));
    
    // Final destination
    const finalStatus = data.result.finalStatus;
    const finalColor = getStatusColor(finalStatus);
    console.log(`${c('bold', '🎯 Final:')} ${data.result.finalUrl}`);
    console.log(`   Status: ${c(finalColor, finalStatus)} | Redirects: ${data.result.redirectCount} | Time: ${data.result.totalTime}ms\n`);
    
    // Security
    console.log(formatSecurity(data.security));
    console.log('');
    
    // Health Score
    console.log(formatHealthScore(data.healthScore));
    
    // Location
    const loc = data.checkedFrom;
    console.log(c('dim', `\n📍 Scanned from ${loc.city}, ${loc.country} (${loc.colo})`));
    console.log(c('dim', `🌐 More at https://redirectchecker.com\n`));
    
    // Exit code based on safety
    if (!data.security.safe) {
      process.exit(2); // Threat detected
    }
    
  } catch (err) {
    console.log(c('red', `❌ Network error: ${err.message}`));
    console.log(c('dim', 'Check your internet connection and try again.'));
    process.exit(1);
  }
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
