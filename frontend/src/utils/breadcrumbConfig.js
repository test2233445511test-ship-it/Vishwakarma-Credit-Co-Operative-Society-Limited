const breadcrumbNames = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/dashboard/customer': 'Customer Dashboard',
  '/dashboard/manager': 'Manager Dashboard',
  '/dashboard/admin': 'Admin Dashboard',
  '/dashboard/staff': 'Staff Dashboard',
  '/dashboard/super-admin': 'Super Admin Dashboard',
  '/services': 'Services',
  '/about': 'About',
  '/directors': 'Directors',
  '/contact': 'Contact',
  '/loan-calculator': 'Loan EMI Calculator',
  '/fd-calculator': 'FD Calculator',
  '/data-entry': 'Customer Registration',
  '/login': 'Login',
  '/403': 'Access Denied',
}

export function getBreadcrumbName(path) {
  return breadcrumbNames[path] || path.replace(/^\//, '').replace(/-/g, ' ')
}

export function getBreadcrumbs(pathname) {
  const parts = pathname.split('/').filter(Boolean)
  const crumbs = [{ path: '/', label: 'Home' }]
  let current = ''
  for (const part of parts) {
    current += '/' + part
    crumbs.push({ path: current, label: getBreadcrumbName(current) })
  }
  return crumbs
}
