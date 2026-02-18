// Simple syntax check for the main App component
import fs from 'fs';
import path from 'path';

// Read the App.jsx file
const appPath = path.join(process.cwd(), 'src', 'App.jsx');
const appContent = fs.readFileSync(appPath, 'utf8');

// Check for common syntax issues
const issues = [];

// Check for template literal syntax errors
const templateLiteralRegex = /`[^`]*\$\{[^}]*\}[^`]*`/g;
const matches = appContent.match(templateLiteralRegex);

if (matches) {
  matches.forEach((match, index) => {
    if (match.includes('${.viewMode')) {
      issues.push(`Found syntax error in template literal ${index + 1}: ${match}`);
    }
  });
}

// Check for missing imports
const importRegex = /import.*from.*['"][^'"]*['"];?/g;
const imports = appContent.match(importRegex) || [];
const importedComponents = imports.map(imp => {
  const match = imp.match(/import\s+{([^}]+)}/);
  return match ? match[1].split(',').map(s => s.trim()) : [];
}).flat();

// Check for used components
const usedComponents = [];
const componentRegex = /<([A-Z][a-zA-Z]*)/g;
let componentMatch;
while ((componentMatch = componentRegex.exec(appContent)) !== null) {
  usedComponents.push(componentMatch[1]);
}

const missingImports = usedComponents.filter(comp => 
  !importedComponents.includes(comp) && 
  comp !== 'div' && comp !== 'span' && comp !== 'button' && 
  comp !== 'header' && comp !== 'main' && comp !== 'h1' && 
  comp !== 'h2' && comp !== 'React.StrictMode'
);

if (missingImports.length > 0) {
  issues.push(`Components possibly missing imports: ${missingImports.join(', ')}`);
}

console.log('Syntax Check Results:');
if (issues.length === 0) {
  console.log('✅ No syntax errors found');
} else {
  console.log('❌ Issues found:');
  issues.forEach(issue => console.log(`  - ${issue}`));
}

process.exit(issues.length > 0 ? 1 : 0);
