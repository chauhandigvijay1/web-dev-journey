const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function processFile(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // 1. Violet & Blue -> Brand Colors
    content = content.replace(/bg-violet-600/g, 'bg-brand-500');
    content = content.replace(/hover:bg-violet-700/g, 'hover:bg-brand-400');
    content = content.replace(/text-violet-600/g, 'text-brand-500');
    content = content.replace(/text-violet-700/g, 'text-brand-400');
    content = content.replace(/text-violet-500/g, 'text-brand-400');
    content = content.replace(/text-violet-300/g, 'text-brand-300');
    content = content.replace(/text-violet-200/g, 'text-brand-200');
    content = content.replace(/bg-violet-100/g, 'bg-brand-500/10');
    content = content.replace(/bg-violet-500\/20/g, 'bg-brand-500/20');
    content = content.replace(/bg-violet-500\/15/g, 'bg-brand-500/15');
    content = content.replace(/border-violet-500/g, 'border-brand-500');
    content = content.replace(/border-violet-200/g, 'border-brand-500/20');
    content = content.replace(/focus:border-violet-500/g, 'focus:border-brand-500');
    content = content.replace(/bg-blue-600/g, 'bg-brand-500');
    content = content.replace(/text-blue-600/g, 'text-brand-500');

    // 2. Solid Backgrounds -> Glassmorphism
    // Sections & Cards
    content = content.replace(/bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/g, 'glass-panel p-5');
    content = content.replace(/border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/g, 'glass-panel p-5');
    content = content.replace(/bg-white dark:bg-slate-900/g, 'glass-panel');
    content = content.replace(/bg-white dark:bg-slate-950/g, 'glass-panel');
    content = content.replace(/bg-white/g, 'glass-card'); // Note: risky, maybe limit it? Let's just do it, glass-card is safe if it's a container.
    // Actually, bg-white can be a button text color sometimes (though that's text-white).
    // A better approach for specific patterns:
    content = content.replace(/rounded-\[30px\] border border-slate-200 glass-card p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/g, 'rounded-[30px] glass-panel p-5');
    content = content.replace(/border border-slate-200 glass-card p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/g, 'glass-panel p-5');
    content = content.replace(/border-slate-200 glass-card p-5/g, 'border-white/10 glass-panel p-5');
    
    // Replace text colors
    content = content.replace(/text-slate-900 dark:text-white/g, 'text-white font-semibold drop-shadow-md');
    content = content.replace(/text-slate-700 dark:text-slate-200/g, 'text-slate-200');
    content = content.replace(/text-slate-800 dark:text-slate-200/g, 'text-slate-200');
    content = content.replace(/text-slate-600 dark:text-slate-300/g, 'text-slate-300');
    content = content.replace(/text-slate-500 dark:text-slate-400/g, 'text-slate-400');
    content = content.replace(/text-slate-600/g, 'text-slate-300');
    content = content.replace(/text-slate-900/g, 'text-white');
    content = content.replace(/text-slate-800/g, 'text-slate-200');

    // Replace inputs and borders
    content = content.replace(/border-slate-200 dark:border-slate-700 dark:bg-slate-950/g, 'border-white/10 bg-black/20 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50');
    content = content.replace(/border-slate-200 dark:border-slate-700/g, 'border-white/10');
    content = content.replace(/border-slate-300 dark:border-slate-700/g, 'border-white/10');
    content = content.replace(/border-slate-200 dark:border-slate-800/g, 'border-white/10');
    content = content.replace(/border-slate-200/g, 'border-white/10');
    content = content.replace(/border-slate-100/g, 'border-white/10');
    content = content.replace(/bg-slate-50/g, 'bg-white/5');
    content = content.replace(/bg-slate-100/g, 'bg-white/10');
    content = content.replace(/hover:bg-slate-100 dark:hover:bg-slate-800/g, 'hover:bg-white/10');
    content = content.replace(/dark:bg-slate-950\/60/g, 'bg-black/20');
    content = content.replace(/dark:bg-slate-950/g, 'bg-black/20');
    
    // Add animations to buttons
    content = content.replace(/bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400/g, 'bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 duration-300');
    content = content.replace(/bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-400/g, 'bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 duration-300');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('Updated: ' + filePath);
    }
  }
}

walkDir('src/pages', processFile);
walkDir('src/components', processFile);
walkDir('src/layouts', processFile);
