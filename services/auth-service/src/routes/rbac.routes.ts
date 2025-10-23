import { Router } from 'express';
import { RBACController } from '../controllers/rbac.controller';
import { authenticate, requirePermission } from '../middleware/auth.middleware';

const router = Router();
const rbacController = new RBACController();

/**
 * @route   GET /api/v1/rbac/roles
 * @desc    Get all roles
 * @access  Private (requires permission: rbac.read)
 */
router.get('/roles', authenticate, requirePermission('rbac.read'), rbacController.getAllRoles);

/**
 * @route   GET /api/v1/rbac/permissions
 * @desc    Get all permissions
 * @access  Private (requires permission: rbac.read)
 */
router.get(
  '/permissions',
  authenticate,
  requirePermission('rbac.read'),
  rbacController.getAllPermissions
);

/**
 * @route   GET /api/v1/rbac/users/:userId/roles
 * @desc    Get user's roles
 * @access  Private (requires permission: rbac.read)
 */
router.get(
  '/users/:userId/roles',
  authenticate,
  requirePermission('rbac.read'),
  rbacController.getUserRoles
);

/**
 * @route   GET /api/v1/rbac/users/:userId/permissions
 * @desc    Get user's permissions
 * @access  Private (requires permission: rbac.read)
 */
router.get(
  '/users/:userId/permissions',
  authenticate,
  requirePermission('rbac.read'),
  rbacController.getUserPermissions
);

/**
 * @route   POST /api/v1/rbac/users/:userId/roles
 * @desc    Assign role to user
 * @access  Private (requires permission: rbac.manage)
 */
router.post(
  '/users/:userId/roles',
  authenticate,
  requirePermission('rbac.manage'),
  rbacController.assignRole
);

/**
 * @route   DELETE /api/v1/rbac/users/:userId/roles/:roleName
 * @desc    Remove role from user
 * @access  Private (requires permission: rbac.manage)
 */
router.delete(
  '/users/:userId/roles/:roleName',
  authenticate,
  requirePermission('rbac.manage'),
  rbacController.removeRole
);

/**
 * @route   POST /api/v1/rbac/roles
 * @desc    Create a new role
 * @access  Private (requires permission: rbac.manage)
 */
router.post('/roles', authenticate, requirePermission('rbac.manage'), rbacController.createRole);

/**
 * @route   POST /api/v1/rbac/permissions
 * @desc    Create a new permission
 * @access  Private (requires permission: rbac.manage)
 */
router.post(
  '/permissions',
  authenticate,
  requirePermission('rbac.manage'),
  rbacController.createPermission
);

/**
 * @route   POST /api/v1/rbac/roles/:roleName/permissions
 * @desc    Add permission to role
 * @access  Private (requires permission: rbac.manage)
 */
router.post(
  '/roles/:roleName/permissions',
  authenticate,
  requirePermission('rbac.manage'),
  rbacController.addPermissionToRole
);

/**
 * @route   DELETE /api/v1/rbac/roles/:roleName/permissions/:permissionName
 * @desc    Remove permission from role
 * @access  Private (requires permission: rbac.manage)
 */
router.delete(
  '/roles/:roleName/permissions/:permissionName',
  authenticate,
  requirePermission('rbac.manage'),
  rbacController.removePermissionFromRole
);

/**
 * @route   POST /api/v1/rbac/check-permission
 * @desc    Check if user has permission
 * @access  Private
 */
router.post(
  '/check-permission',
  authenticate,
  rbacController.checkPermission
);

export default router;
