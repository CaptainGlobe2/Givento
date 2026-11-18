const fs = require('fs');
const content = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

const lines = content.split('\n');
let depth = 0;
for (let i = 504; i < 930; i++) {
  const line = lines[i];
  const opens = (line.match(/<div(\s|>)/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  depth += opens - closes;
  if (depth < 0) {
    console.log(`Line ${i + 1} (opens=${opens}, closes=${closes}, relDepth=${depth}): ${line.trim()}`);
  }
}
console.log("Relative depth for Tab 1:", depth);
