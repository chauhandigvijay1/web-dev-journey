const fs = require('fs');

// AI Assistant Drawer
let aiPath = 'src/components/ai/AIAssistantDrawer.tsx';
let ai = fs.readFileSync(aiPath, 'utf8');
ai = ai.replace('  if (!open) return null\n\n', '');
ai = ai.replace(
  'className="fixed inset-0 z-50 bg-slate-950/40"', 
  'className={`fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 ${open ? \'opacity-100\' : \'opacity-0 pointer-events-none\'}`}'
);
ai = ai.replace(
  'className="fixed bottom-0 right-0 h-[85vh] w-full max-w-xl rounded-t-3xl border border-white/10 glass-card p-4 shadow-2xl md:top-0 md:h-full md:rounded-none md:rounded-l-3xl dark:border-slate-700 dark:bg-slate-900"',
  'className={`fixed bottom-0 right-0 h-[85vh] w-full max-w-xl rounded-t-3xl border border-white/10 glass-card p-4 shadow-2xl md:top-0 md:h-full md:rounded-none md:rounded-l-3xl dark:border-slate-700 dark:bg-slate-900 transition-transform duration-300 ease-in-out ${open ? \'translate-y-0 md:translate-x-0\' : \'translate-y-full md:translate-y-0 md:translate-x-full\'}`}'
);
fs.writeFileSync(aiPath, ai, 'utf8');

// Task Detail Drawer
let taskPath = 'src/components/tasks/TaskDetailDrawer.tsx';
let task = fs.readFileSync(taskPath, 'utf8');
task = task.replace('  if (!open || !task) return null', '  if (!task) return null'); // Keep task null check but remove open check
task = task.replace(
  'className="fixed inset-0 z-50 bg-slate-900/40"',
  'className={`fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${open ? \'opacity-100\' : \'opacity-0 pointer-events-none\'}`}'
);
task = task.replace(
  'className="ml-auto h-full w-full overflow-y-auto glass-card p-5 shadow-xl sm:w-[560px] dark:bg-slate-900"',
  'className={`ml-auto h-full w-full overflow-y-auto glass-card p-5 shadow-xl sm:w-[560px] dark:bg-slate-900 transition-transform duration-300 ease-in-out ${open ? \'translate-x-0\' : \'translate-x-full\'}`}'
);
fs.writeFileSync(taskPath, task, 'utf8');

console.log("Drawers updated");
