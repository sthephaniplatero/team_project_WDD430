import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const issuesFilePath = path.join(rootDir, 'ISSUES.md');

if (!fs.existsSync(issuesFilePath)) {
  console.error(`❌ Error: ISSUES.md not found at ${issuesFilePath}`);
  process.exit(1);
}

const content = fs.readFileSync(issuesFilePath, 'utf-8');

// Parse issues
const sections = content.split(/^## 📌 /m).slice(1);

const teamAssignments = {
  1: ['Sthephani Platero', 'Halia Yayra Khayat'],
  2: ['Halia Yayra Khayat'],
  3: ['Sthephani Platero'],
  4: ['Anisa Chokwenda'],
  5: ['Habyarimana Cassien'],
  6: ['Sthephani Platero'],
  7: ['Anisa Chokwenda'],
  8: ['Habyarimana Cassien'],
};

const issues = sections.map((section, idx) => {
  const lines = section.trim().split('\n');
  const rawTitle = lines[0].trim();
  const title = rawTitle.replace(/^Issue #\d+:\s*/, '').trim();

  // Extract labels
  const labelMatch = section.match(/- \*\*Labels:\*\*\s*(.*)/);
  const labels = [];
  if (labelMatch) {
    const labelLine = labelMatch[1];
    const extracted = labelLine.match(/`([^`]+)`/g);
    if (extracted) {
      extracted.forEach(l => labels.push(l.replace(/`/g, '').trim()));
    }
  }

  // Body content: from line 1 onwards, up to the separator ---
  let bodyLines = lines.slice(1);
  const sepIndex = bodyLines.findIndex(l => l.trim() === '---');
  if (sepIndex !== -1) {
    bodyLines = bodyLines.slice(0, sepIndex);
  }

  let body = bodyLines.join('\n').trim();

  // Add assigned team member info
  const issueNum = idx + 1;
  const assigned = teamAssignments[issueNum];
  if (assigned && assigned.length > 0) {
    body += `\n\n---\n**👤 Assigned Team Member(s):** ${assigned.join(', ')}`;
  }

  return {
    number: issueNum,
    title,
    labels,
    body,
  };
});

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const owner = process.env.GITHUB_OWNER || 'sthephaniplatero';
const repo = process.env.GITHUB_REPO || 'team_project_WDD430';

console.log('====================================================');
console.log(`📋 Viable Scheduler - GitHub Issues Importer`);
console.log(`📦 Target Repository: ${owner}/${repo}`);
console.log(`📄 Issues parsed from ISSUES.md: ${issues.length}`);
console.log('====================================================\n');

// Check if gh CLI is available and authenticated
let ghCliAvailable = false;
try {
  execSync('gh auth status', { stdio: 'ignore' });
  ghCliAvailable = true;
} catch {
  ghCliAvailable = false;
}

if (!token && !ghCliAvailable) {
  console.log('⚠️  No se detectó autenticación (ni GITHUB_TOKEN ni GitHub CLI `gh`).\n');
  console.log('Tienes dos opciones sencillas para publicar estos 8 issues automáticamente:\n');
  console.log('🔹 OPCIÓN 1 (Recomendada con Personal Access Token):');
  console.log('   1. Crea un token en https://github.com/settings/tokens (permisos de "repo").');
  console.log('   2. En PowerShell ejecuta:');
  console.log('      $env:GITHUB_TOKEN="ghp_tuTokenAqui"');
  console.log('      node scripts/create-github-issues.mjs\n');
  console.log('🔹 OPCIÓN 2 (Con GitHub CLI):');
  console.log('   1. Instala gh con: winget install --id GitHub.cli');
  console.log('   2. Autentícate con: gh auth login');
  console.log('   3. Ejecuta de nuevo: node scripts/create-github-issues.mjs\n');
  console.log('====================================================');
  console.log('Lista de issues listos para importar:');
  issues.forEach(iss => {
    console.log(`  [#${iss.number}] ${iss.title}`);
    console.log(`       Labels: ${iss.labels.join(', ')}`);
  });
  console.log('====================================================');
  process.exit(0);
}

async function createWithApi(issue) {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues`;
  const payload = {
    title: issue.title,
    body: issue.body,
    labels: issue.labels,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'Viable-Scheduler-Issue-Creator',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.html_url;
}

function createWithGh(issue) {
  const labelFlags = issue.labels.map(l => `--label "${l}"`).join(' ');
  const tempFile = path.join(rootDir, `.temp_issue_${issue.number}.md`);
  fs.writeFileSync(tempFile, issue.body, 'utf-8');

  try {
    const cmd = `gh issue create --repo ${owner}/${repo} --title "${issue.title.replace(/"/g, '\\"')}" --body-file "${tempFile}" ${labelFlags}`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    return output.trim();
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

async function main() {
  const mode = token ? 'GitHub API (Token)' : 'GitHub CLI (gh)';
  console.log(`🚀 Iniciando creación usando: ${mode}`);

  for (const issue of issues) {
    process.stdout.write(`⏳ Creando Issue #${issue.number}: "${issue.title}"... `);
    try {
      let url;
      if (token) {
        url = await createWithApi(issue);
        await new Promise(r => setTimeout(r, 1000)); // Rate limiting buffer
      } else {
        url = createWithGh(issue);
      }
      console.log(`✅ Creado: ${url}`);
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
  }

  console.log('\n🎉 ¡Todos los issues han sido procesados!');
  console.log(`🔗 Ver issues del repositorio: https://github.com/${owner}/${repo}/issues`);
  console.log('\n📌 Para verlos en tu GitHub Board (Project):');
  console.log(`1. Ve a https://github.com/${owner}/${repo}/projects (o https://github.com/users/${owner}/projects)`);
  console.log('2. Abre tu Board o crea un nuevo Proyecto con la plantilla "Board".');
  console.log('3. Haz clic en "+ Add item" o activa el workflow "Auto-add to project" para que aparezcan en la columna Todo.');
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
