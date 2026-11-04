const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const owner = process.env.GITHUB_OWNER || 'sthephaniplatero';
const repo = process.env.GITHUB_REPO || 'team_project_WDD430';

if (!token) {
  console.error('❌ Error: GITHUB_TOKEN no está definido.');
  console.log('Ejecuta en PowerShell:');
  console.log('  $env:GITHUB_TOKEN="tu_token"');
  console.log('  npm run assign:team\n');
  process.exit(1);
}

// GitHub issue numbers mapped to GitHub usernames
const assignments = {
  2: ['sthephaniplatero', 'LadyLia-wq'], // Issue 1
  3: ['LadyLia-wq'],                    // Issue 2
  4: ['sthephaniplatero'],              // Issue 3
  5: ['anichokwenda'],                  // Issue 4
  6: ['habyarimanacassien'],            // Issue 5
  7: ['sthephaniplatero'],              // Issue 6
  8: ['anichokwenda'],                  // Issue 7
  9: ['habyarimanacassien']             // Issue 8
};

async function syncAssignees() {
  console.log('🔄 Sincronizando asignaciones en GitHub...');
  
  // Check pending invites
  const invRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/invitations`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'Viable-Scheduler'
    }
  });
  const invites = await invRes.json();
  const pendingUsers = Array.isArray(invites) ? invites.map(i => i.invitee?.login) : [];
  if (pendingUsers.length > 0) {
    console.log(`⚠️  Invitaciones pendientes por aceptar en GitHub: ${pendingUsers.join(', ')}`);
    console.log(`(GitHub no permite asignar usuarios en la casilla oficial de Assignee hasta que acepten la invitación del repo).\n`);
  }

  for (const [num, users] of Object.entries(assignments)) {
    // Filter only users who are already active collaborators (not pending)
    const validUsers = users.filter(u => !pendingUsers.includes(u));
    
    if (validUsers.length === 0) {
      console.log(`⏳ Issue #${num}: Pendiente de que [${users.join(', ')}] acepte la invitación.`);
      continue;
    }

    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${num}`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'Viable-Scheduler',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assignees: validUsers })
      });
      const data = await res.json();
      console.log(`✅ Issue #${num} asignado a: ${data.assignees?.map(a => a.login).join(', ')}`);
    } catch (err) {
      console.error(`❌ Error en Issue #${num}:`, err.message);
    }
  }
}

syncAssignees();

