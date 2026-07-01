const fs = require('fs');

let css = fs.readFileSync('src/styles/globals.css', 'utf8');

// 1. Dark vs Light mode base colors
css = css.replace(
  'body {\n  margin: 0;\n  font-family: var(--font-sans);\n  background-color: #020617;\n  color: #f8fafc;\n}',
  `body {
  margin: 0;
  font-family: var(--font-sans);
  background-color: #f8fafc;
  color: #0f172a;
}
.dark body {
  background-color: #020617;
  color: #f8fafc;
}`
);

// Typography colors for light mode (headings were #f8fafc hardcoded)
css = css.replace(
  'h1, h2, h3, h4, h5, h6 {\n  color: #f8fafc;\n',
  `h1, h2, h3, h4, h5, h6 {
  color: #0f172a;
`
);
css = css.replace(
  'p {\n  line-height: 1.6;\n  margin-bottom: 1rem;\n  color: #cbd5e1;\n}',
  `p {
  line-height: 1.6;
  margin-bottom: 1rem;
  color: #475569;
}
.dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6 {
  color: #f8fafc;
}
.dark p {
  color: #cbd5e1;
}`
);
css = css.replace(
  '.caption {\n  font-size: 0.75rem;\n  line-height: 1.4;\n  color: #94a3b8;\n  letter-spacing: 0.01em;\n}',
  `.caption {
  font-size: 0.75rem;
  line-height: 1.4;
  color: #64748b;
  letter-spacing: 0.01em;
}
.dark .caption {
  color: #94a3b8;
}`
);

// Cinematic overlays (Light vs Dark)
css = css.replace(
  `.cinematic-overlay-heavy {
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
}`,
  `.cinematic-overlay-heavy {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
}
.dark .cinematic-overlay-heavy {
  background: rgba(2, 6, 23, 0.85);
}`
);

css = css.replace(
  `.cinematic-overlay-light {
  background: linear-gradient(180deg, rgba(2,6,23,0.3) 0%, rgba(2,6,23,0.85) 100%);
}`,
  `.cinematic-overlay-light {
  background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.85) 100%);
}
.dark .cinematic-overlay-light {
  background: linear-gradient(180deg, rgba(2,6,23,0.3) 0%, rgba(2,6,23,0.85) 100%);
}`
);

// Glass Panel (Light vs Dark)
css = css.replace(
  `.glass-panel {
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}`,
  `.glass-panel {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.05);
}
.dark .glass-panel {
  background: rgba(15, 23, 42, 0.65);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}`
);

// Glass Card (Light vs Dark)
css = css.replace(
  `.glass-card {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}`,
  `.glass-card {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.dark .glass-card {
  background: rgba(30, 41, 59, 0.4);
  border-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}`
);

css = css.replace(
  `.glass-card:hover {
  background: rgba(30, 41, 59, 0.65);
  border-color: rgba(16, 185, 129, 0.25);
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.12);
  transform: translateY(-2px);
}`,
  `.glass-card:hover {
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(16, 185, 129, 0.25);
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.12);
  transform: translateY(-2px);
}
.dark .glass-card:hover {
  background: rgba(30, 41, 59, 0.65);
}`
);

// Add Global Custom Scrollbars
const scrollbars = `
/* Global Custom Scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.15);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(15, 23, 42, 0.3);
}

.dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
}
.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Scrollbar Firefox Support */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(15, 23, 42, 0.15) transparent;
}
.dark * {
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}

/* Ensure Custom Scrollbar utility class overrides if needed */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
`;

css += scrollbars;

fs.writeFileSync('src/styles/globals.css', css, 'utf8');
console.log('globals.css updated');
