/** Roles mirror the server enum on User.role. Keep the two in step. */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  PRINCIPAL: 'PRINCIPAL',
  VICE_PRINCIPAL: 'VICE_PRINCIPAL',
  TEACHER: 'TEACHER',
  STAFF: 'STAFF',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
  ACCOUNTANT: 'ACCOUNTANT',
  ADMISSION_OFFICER: 'ADMISSION_OFFICER',
} as const

export type Role = keyof typeof ROLES

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super administrator',
  ADMIN: 'Administrator',
  PRINCIPAL: 'Principal',
  VICE_PRINCIPAL: 'Vice principal',
  TEACHER: 'Teacher',
  STAFF: 'Staff',
  STUDENT: 'Student',
  PARENT: 'Parent',
  ACCOUNTANT: 'Accountant',
  ADMISSION_OFFICER: 'Admission officer',
}

/** Role groups used by route guards and page-level checks. */
export const SCHOOL_LEADERS: string[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL]
export const ACADEMIC_MANAGERS: string[] = [...SCHOOL_LEADERS]
export const FINANCE_MANAGERS: string[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT]
export const TEACHING_STAFF: string[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF]
export const ADMISSION_STAFF: string[] = [...SCHOOL_LEADERS, ROLES.ADMISSION_OFFICER]
export const USER_ADMINS: string[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN]

/**
 * Client-side permission hints only. The server is the authority -- these exist
 * so the UI can hide actions the user would be refused anyway.
 */
export const PERMISSIONS = {
  studentsRead: 'students.read',
  studentsWrite: 'students.create',
  resultsPublish: 'results.publish',
  admissionsReview: 'admissions.review',
  paymentsManage: 'payments.manage',
  usersManage: 'users.manage',
} as const

export function hasRole(role: string | undefined, allowed: string[]) {
  return Boolean(role && allowed.includes(role))
}

/** Landing route for a role, so every user lands on a dashboard they can open. */
export function roleHome(role?: string) {
  if (hasRole(role, SCHOOL_LEADERS)) return '/admin'
  if (hasRole(role, [ROLES.TEACHER, ROLES.STAFF])) return '/staff'
  if (hasRole(role, [ROLES.PARENT])) return '/parent'
  if (hasRole(role, [ROLES.ACCOUNTANT])) return '/admin/payments'
  if (hasRole(role, [ROLES.ADMISSION_OFFICER])) return '/admin/admissions'
  return '/portal'
}
