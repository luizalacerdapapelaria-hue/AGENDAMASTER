const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateLatestYaml() {
  const distDesktop = path.resolve(__dirname, '..', 'dist-desktop');
  if (!fs.existsSync(distDesktop)) {
    fs.mkdirSync(distDesktop, { recursive: true });
  }

  const files = fs.readdirSync(distDesktop);
  // Procura o arquivo .exe do instalador gerado
  let exeFile = files.find(f => f.toLowerCase().endsWith('.exe') && !f.toLowerCase().includes('elevate') && !f.toLowerCase().includes('uninstall'));

  const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8'));
  const version = pkg.version || '2.0.3';
  const exeName = exeFile || `Agenda.Master.Setup.${version}.exe`;
  const exePath = path.join(distDesktop, exeName);

  let sha512 = '';
  let size = 0;

  if (fs.existsSync(exePath)) {
    const fileBuffer = fs.readFileSync(exePath);
    sha512 = crypto.createHash('sha512').update(fileBuffer).digest('base64');
    size = fileBuffer.length;
    console.log(`[generate-latest] Processado ${exeName}: ${size} bytes | SHA512 calculado.`);
  }

  const releaseDate = new Date().toISOString();
  const lines = [
    `version: ${version}`,
    `files:`,
    `  - url: ${exeName}`,
  ];

  if (sha512) {
    lines.push(`    sha512: ${sha512}`);
  }
  if (size > 0) {
    lines.push(`    size: ${size}`);
  }

  lines.push(`path: ${exeName}`);
  if (sha512) {
    lines.push(`sha512: ${sha512}`);
  }
  lines.push(`releaseDate: '${releaseDate}'`);
  lines.push('');

  const latestPath = path.join(distDesktop, 'latest.yml');
  fs.writeFileSync(latestPath, lines.join('\n'), 'utf8');
  console.log(`[generate-latest] ✅ Arquivo latest.yml gerado com sucesso em: ${latestPath}`);
}

generateLatestYaml();
