const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');

let dupFonts = [];
let iconButtons = [];
let truncateCandidates = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  
  // 1. Find dup font-semibold
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const classMatch = line.match(/className=["']([^"']+)["']/);
    if (classMatch) {
      const classes = classMatch[1].split(/\s+/);
      const semis = classes.filter(c => c === 'font-semibold');
      if (semis.length > 1) {
        dupFonts.push({ file: f, line: idx + 1, content: line.trim() });
      }
    }
    
    // 3. Finding missing truncate
    // Let's look for places that might need truncate, e.g., titles, user names
    // For now we just record any div/span/p with flex or grid that has long text potential.
    // We'll refine this.
  });

  // 2. Icon-only buttons
  // Look for <button> containing <Icon/> but no text and no aria-label
  // We can just regex match <button ...> <something /> </button>
  const btnRegex = /<button[^>]*>[\s\S]*?<\/button>/g;
  let match;
  while ((match = btnRegex.exec(content)) !== null) {
    const btn = match[0];
    if (!btn.includes('aria-label') && !btn.includes('aria-hidden')) {
      // Check if it only has tags and whitespace inside
      const inner = btn.replace(/<button[^>]*>/, '').replace(/<\/button>/, '');
      const hasText = inner.replace(/<[^>]+>/g, '').trim().length > 0;
      if (!hasText && inner.trim().length > 0) {
        // It's likely an icon-only button
        // Need to find line number
        const pre = content.substring(0, match.index);
        const line = pre.split('\n').length;
        iconButtons.push({ file: f, line, content: btn.trim() });
      }
    }
  }
});

fs.writeFileSync('analysis.json', JSON.stringify({
  dupFontsCount: dupFonts.length,
  iconButtonsCount: iconButtons.length,
  dupFonts,
  iconButtons
}, null, 2));

console.log(`Found ${dupFonts.length} duplicate font-semibold`);
console.log(`Found ${iconButtons.length} icon-only buttons`);
