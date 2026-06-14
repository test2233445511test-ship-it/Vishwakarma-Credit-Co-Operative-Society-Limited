import 'dotenv/config'
import { connectDB, query } from './database.js'

async function seed() {
  await connectDB()
  console.log('[Seed] Seeding data...')

  const permissions = [
    ['user.view', 'View user profiles'],
    ['user.create', 'Create new users'],
    ['user.manage', 'Manage user roles and status'],
    ['account.view', 'View account details'],
    ['account.create', 'Open new accounts'],
    ['account.manage', 'Manage account settings'],
    ['loan.create', 'Apply for loans'],
    ['loan.view', 'View loan details'],
    ['loan.approve', 'Approve or reject loans'],
    ['loan.manage', 'Manage loan products'],
    ['request.create', 'Create service requests'],
    ['request.view', 'View service requests'],
    ['request.approve', 'Approve or assign requests'],
    ['request.manage', 'Manage all requests'],
    ['report.view', 'View reports and analytics'],
    ['report.export', 'Export reports'],
    ['audit.view', 'View audit logs'],
    ['document.upload', 'Upload documents'],
    ['document.view', 'View documents'],
    ['notification.send', 'Send notifications'],
    ['settings.manage', 'Manage system settings'],
  ]

  for (const [name, desc] of permissions) {
    await query('INSERT INTO permissions (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING', [name, desc])
  }
  console.log(`[Seed]  ✓ ${permissions.length} permissions`)

  const roles = [
    { name: 'SUPER_ADMIN', desc: 'Full system access', perms: permissions.map(([n]) => n) },
    { name: 'ADMIN', desc: 'Administrative access', perms: permissions.filter(([n]) => !['settings.manage'].includes(n)).map(([n]) => n) },
    { name: 'STAFF', desc: 'Staff access', perms: ['user.view', 'account.view', 'loan.create', 'loan.view', 'request.create', 'request.view', 'request.approve', 'document.view', 'notification.send'] },
    { name: 'MEMBER', desc: 'Customer access', perms: ['account.view', 'loan.create', 'loan.view', 'request.create', 'request.view', 'document.upload', 'document.view'] },
  ]

  for (const role of roles) {
    const result = await query('INSERT INTO roles (name, description) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET description = $2 RETURNING id', [role.name, role.desc])
    const roleId = result.rows[0].id

    for (const permName of role.perms) {
      const perm = await query('SELECT id FROM permissions WHERE name = $1', [permName])
      if (perm.rows.length > 0) {
        await query('INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [roleId, perm.rows[0].id])
      }
    }
    console.log(`[Seed]  ✓ Role ${role.name} (${role.perms.length} permissions)`)
  }

  console.log('[Seed] Seeding complete.')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
