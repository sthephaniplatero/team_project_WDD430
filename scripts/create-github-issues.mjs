// Creates the weekly GitHub issues described in ISSUES.md using the GitHub CLI (`gh`).
//
// Usage:
//   gh auth login                      (once; include the "project" scope for the board)
//   npm run sync:issues                (creates the issues)
//   $env:PROJECT_NUMBER="1"; npm run sync:issues   (also adds them to that GitHub Project board)
//   $env:DRY_RUN="1"; npm run sync:issues          (only prints what would be created)
//   $env:UPDATE="1"; npm run sync:issues           (edits existing issues #N from "Issue #N:" headings)
//
// Running it twice creates duplicates, so run it only once per plan.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const issuesFilePath = path.join(rootDir, 'ISSUES.md');

const owner = process.env.GITHUB_OWNER || 'sthephaniplatero';
const repo = process.env.GITHUB_REPO || 'team_project_WDD430';
const projectNumber = process.env.PROJECT_NUMBER;
const dryRun = Boolean(process.env.DRY_RUN);

const content = fs.readFileSync(issuesFilePath, 'utf-8').replace(/\r\n/g, '\n');

const issues = content
  .split(/^## 📌 /m)
  .slice(1)
  .map((section) => {
    const lines = section.trim().split('\n');
    const number = lines[0].match(/^Issue #(\d+):/)?.[1];
    const title = lines[0].replace(/^Issue #\d+:\s*/, '').trim();

    const labelLine = section.match(/- \*\*Labels:\*\*\s*(.*)/);
    const labels = labelLine ? [...labelLine[1].matchAll(/`([^`]+)`/g)].map((m) => m[1]) : [];

    const assigneeLine = section.match(/- \*\*Assignee:\*\*\s*(.*)/);
    const assignees = assigneeLine ? [...assigneeLine[1].matchAll(/`@([^`]+)`/g)].map((m) => m[1]) : [];

    let body = lines.slice(1);
    const sep = body.findIndex((l) => l.trim() === '---');
    if (sep !== -1) body = body.slice(0, sep);

    return {
      number,
      title,
      labels,
      assignees,
      body: `${body.join('\n').trim()}\n\n---\n📄 Full context: [SPECIFICATION.md](../blob/main/SPECIFICATION.md) · [ISSUES.md](../blob/main/ISSUES.md)`,
    };
  });

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

console.log(`📦 ${owner}/${repo} — ${issues.length} issues parsed from ISSUES.md`);
issues.forEach((i) => console.log(`  • ${i.title}  → @${i.assignees.join(', @')}  [${i.labels.join(', ')}]`));
if (dryRun) process.exit(0);

try {
  gh(['auth', 'status']);
} catch {
  console.error('❌ GitHub CLI is not signed in. Run: gh auth login');
  process.exit(1);
}

// gh refuses unknown labels, so create any that are missing.
const allLabels = [...new Set(issues.flatMap((i) => i.labels))];
for (const label of allLabels) {
  const color = label.startsWith('week-') ? '0F766E' : label.startsWith('p') && label.length === 2 ? 'F59E0B' : '64748B';
  gh(['label', 'create', label, '--repo', `${owner}/${repo}`, '--color', color, '--force']);
}

// UPDATE=1: edit the existing issues (number taken from "Issue #N:" in ISSUES.md) instead of creating new ones.
if (process.env.UPDATE) {
  for (const issue of issues) {
    const bodyFile = path.join(os.tmpdir(), `viable-issue-${issue.number}.md`);
    fs.writeFileSync(bodyFile, issue.body, 'utf-8');
    try {
      gh(['issue', 'edit', issue.number, '--repo', `${owner}/${repo}`, '--title', issue.title, '--body-file', bodyFile]);
      console.log(`✏️  #${issue.number} ${issue.title} updated`);
    } catch (err) {
      console.log(`❌ #${issue.number}: ${err.stderr || err.message}`);
    } finally {
      fs.rmSync(bodyFile, { force: true });
    }
  }
  process.exit(0);
}

for (const issue of issues) {
  const bodyFile = path.join(os.tmpdir(), `viable-issue-${Date.now()}.md`);
  fs.writeFileSync(bodyFile, issue.body, 'utf-8');
  try {
    const args = ['issue', 'create', '--repo', `${owner}/${repo}`, '--title', issue.title, '--body-file', bodyFile];
    issue.labels.forEach((l) => args.push('--label', l));
    let url;
    try {
      url = gh(issue.assignees.length ? [...args, '--assignee', issue.assignees.join(',')] : args);
    } catch {
      // A member who has not accepted the repo invitation cannot be assigned yet.
      url = gh(args);
      console.log('  ⚠️  Created without assignees (pending repo invitations?)');
    }
    console.log(`✅ ${issue.title} → ${url}`);
    if (projectNumber) {
      gh(['project', 'item-add', projectNumber, '--owner', owner, '--url', url]);
      console.log(`   📌 Added to project #${projectNumber}`);
    }
  } catch (err) {
    console.log(`❌ ${issue.title}: ${err.stderr || err.message}`);
  } finally {
    fs.rmSync(bodyFile, { force: true });
  }
}
