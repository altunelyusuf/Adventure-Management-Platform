import { Request, Response } from 'express';
import { RBACService } from '../services/rbac.service';
import { asyncHandler, AuthRequest } from '../middleware';

export class RBACController {
  private rbacService: RBACService;

  constructor() {
    this.rbacService = new RBACService();
  }

  /**
   * GET /api/v1/rbac/roles
   * Get all roles
   */
  getAllRoles = asyncHandler(async (req: Request, res: Response) => {
    const roles = await this.rbacService.getAllRoles();

    res.status(200).json({
      success: true,
      count: roles.length,
      roles,
    });
  });

  /**
   * GET /api/v1/rbac/permissions
   * Get all permissions
   */
  getAllPermissions = asyncHandler(async (req: Request, res: Response) => {
    const permissions = await this.rbacService.getAllPermissions();

    res.status(200).json({
      success: true,
      count: permissions.length,
      permissions,
    });
  });

  /**
   * GET /api/v1/rbac/users/:userId/roles
   * Get user's roles
   */
  getUserRoles = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const roles = await this.rbacService.getUserRoles(userId);

    res.status(200).json({
      success: true,
      userId,
      count: roles.length,
      roles,
    });
  });

  /**
   * GET /api/v1/rbac/users/:userId/permissions
   * Get user's permissions
   */
  getUserPermissions = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const permissions = await this.rbacService.getUserPermissions(userId);

    res.status(200).json({
      success: true,
      userId,
      count: permissions.length,
      permissions,
    });
  });

  /**
   * POST /api/v1/rbac/users/:userId/roles
   * Assign role to user
   */
  assignRole = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const { roleName } = req.body;
    const assignedBy = req.user?.userId;

    await this.rbacService.assignRole(userId, roleName, assignedBy);

    res.status(200).json({
      success: true,
      message: `Role '${roleName}' assigned to user`,
      userId,
      roleName,
    });
  });

  /**
   * DELETE /api/v1/rbac/users/:userId/roles/:roleName
   * Remove role from user
   */
  removeRole = asyncHandler(async (req: Request, res: Response) => {
    const { userId, roleName } = req.params;

    await this.rbacService.removeRole(userId, roleName);

    res.status(200).json({
      success: true,
      message: `Role '${roleName}' removed from user`,
      userId,
      roleName,
    });
  });

  /**
   * POST /api/v1/rbac/roles
   * Create a new role
   */
  createRole = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, permissions } = req.body;

    const role = await this.rbacService.createRole(name, description, permissions);

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      role,
    });
  });

  /**
   * POST /api/v1/rbac/permissions
   * Create a new permission
   */
  createPermission = asyncHandler(async (req: Request, res: Response) => {
    const { name, resource, action, description } = req.body;

    const permission = await this.rbacService.createPermission(name, resource, action, description);

    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      permission,
    });
  });

  /**
   * POST /api/v1/rbac/roles/:roleName/permissions
   * Add permission to role
   */
  addPermissionToRole = asyncHandler(async (req: Request, res: Response) => {
    const { roleName } = req.params;
    const { permissionName } = req.body;

    await this.rbacService.addPermissionToRole(roleName, permissionName);

    res.status(200).json({
      success: true,
      message: `Permission '${permissionName}' added to role '${roleName}'`,
      roleName,
      permissionName,
    });
  });

  /**
   * DELETE /api/v1/rbac/roles/:roleName/permissions/:permissionName
   * Remove permission from role
   */
  removePermissionFromRole = asyncHandler(async (req: Request, res: Response) => {
    const { roleName, permissionName } = req.params;

    await this.rbacService.removePermissionFromRole(roleName, permissionName);

    res.status(200).json({
      success: true,
      message: `Permission '${permissionName}' removed from role '${roleName}'`,
      roleName,
      permissionName,
    });
  });

  /**
   * POST /api/v1/rbac/check-permission
   * Check if user has permission
   */
  checkPermission = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId, permissionName } = req.body;
    const userIdToCheck = userId || req.user?.userId;

    if (!userIdToCheck) {
      return res.status(400).json({
        success: false,
        message: 'User ID required',
      });
    }

    const hasPermission = await this.rbacService.hasPermission(userIdToCheck, permissionName);

    res.status(200).json({
      success: true,
      userId: userIdToCheck,
      permissionName,
      hasPermission,
    });
  });
}
