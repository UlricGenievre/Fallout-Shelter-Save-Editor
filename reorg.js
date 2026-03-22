const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'components');

const dirs = ['core', 'editors', 'vault', 'shared'];
dirs.forEach(d => {
  const p = path.join(srcDir, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p);
});

const moves = [
  ['FileUpload.tsx', 'core/FileUpload.tsx'],
  ['SaveEditor.tsx', 'core/SaveEditor.tsx'],
  ['CommonEditor.tsx', 'editors/CommonEditor.tsx'],
  ['DwellerEditor.tsx', 'editors/DwellerEditor.tsx'],
  ['ResourcesEditor.tsx', 'editors/ResourcesEditor.tsx'],
  ['RecipesEditor.tsx', 'editors/RecipesEditor.tsx'],
  ['RawJsonEditor.tsx', 'editors/RawJsonEditor.tsx'],
  ['VaultEditor.tsx', 'vault/VaultEditor.tsx'],
  ['RoomViewer.tsx', 'vault/RoomViewer.tsx'],
  ['NavLink.tsx', 'shared/NavLink.tsx']
];

moves.forEach(([from, to]) => {
  const fromPath = path.join(srcDir, from);
  const toPath = path.join(srcDir, path.normalize(to));
  if (fs.existsSync(fromPath)) {
    fs.renameSync(fromPath, toPath);
  }
});
console.log('Done moving components');
