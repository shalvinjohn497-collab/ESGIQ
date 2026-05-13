import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === 'dist' || file.startsWith('.')) return;
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src');
let analysis = { files: {} };

files.forEach(f => {
    const ext = path.extname(f);
    if (!['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
        analysis.files[f] = { type: 'other', ext };
        return;
    }
    const content = fs.readFileSync(f, 'utf-8');
    const lines = content.split('\n');

    let imports = [];
    let exports = [];
    let isJSX = false;

    if (ext === '.js' && /<[A-Za-z]+[\s/>]|<\/[A-Za-z]+>/.test(content)) {
        isJSX = true;
    }

    const importRegex = /import\s+(?:.*?\s+from\s+)?['"](.*?)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
    }

    const exportRegex = /export\s+(default\s+)?(?:function|const|let|var|class)\s+([a-zA-Z0-9_]+)/g;
    while ((match = exportRegex.exec(content)) !== null) {
        exports.push(match[2]);
    }
    if (content.match(/export\s+default\s+[a-zA-Z0-9_]+/)) {
        exports.push('default');
    }

    let header = lines.slice(0, 20).filter(l => !l.trim().startsWith('import') && l.trim() !== '').join('\n');
    let size = statSize(f);

    analysis.files[f] = {
        type: 'source',
        imports,
        exports,
        isJsxInJs: isJSX,
        header: header.substring(0, 150),
        size,
        loc: lines.length
    };
});

function statSize(f) { return fs.statSync(f).size; }

fs.writeFileSync('analysis_result.json', JSON.stringify(analysis, null, 2));
console.log('Analysis saved to analysis_result.json');
