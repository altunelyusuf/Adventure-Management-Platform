import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Role, Permission, UserRoleEntity, User } from '../models';
import { NotFoundError, ForbiddenError } from '../middleware';
import { logger } from '../utils';

export class RBACService {
  private roleRepository: Repository<Role>;
  private permissionRepository: Repository<Permission>;
  private userRoleRepository: Repository<UserRoleEntity>;
  private userRepository: Repository<User>;

  constructor() {
    this.roleRepository = AppDataSource.getRepository(Role);
    this.permissionRepository = AppDataSource.getRepository(Permission);
    this.userRoleRepository = AppDataSource.getRepository(UserRoleEntity);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Check if user has a specific permission
   */
  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    try {
      // Get user with roles and permissions
      const userRoles = await this.userRoleRepository.find({
        where: { userId },
        relations: ['role', 'role.permissions'],
      });

      if (!userRoles || userRoles.length === 0) {
        return false;
      }

      // Check if any of the user's roles have the required permission
      for (const userRole of userRoles) {
        if (!userRole.role || !userRole.role.permissions) continue;

        const hasPermission = userRole.role.permissions.some(
          (permission) =>
            permission.name === permissionName && permission.isActive
        );

        if (hasPermission) {
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(userId: string, permissionNames: string[]): Promise<boolean> {
    for (const permissionName of permissionNames) {
      const hasPermission = await this.hasPermission(userId, permissionName);
      if (hasPermission) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if user has all specified permissions
   */
  async hasAllPermissions(userId: string, permissionNames: string[]): Promise<boolean> {
    for (const permissionName of permissionNames) {
      const hasPermission = await this.hasPermission(userId, permissionName);
      if (!hasPermission) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role', 'role.permissions'],
    });

    const permissionsMap = new Map<string, Permission>();

    for (const userRole of userRoles) {
      if (!userRole.role || !userRole.role.permissions) continue;

      for (const permission of userRole.role.permissions) {
        if (permission.isActive) {
          permissionsMap.set(permission.id, permission);
        }
      }
    }

    return Array.from(permissionsMap.values());
  }

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role'],
    });

    return userRoles.map((ur) => ur.role).filter((role) => role && role.isActive);
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleName: string, assignedBy?: string): Promise<void> {
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Find role by name
    const role = await this.roleRepository.findOne({ where: { name: roleName } });
    if (!role) {
      throw new NotFoundError(`Role '${roleName}' not found`);
    }

    // Check if user already has this role
    const existing = await this.userRoleRepository.findOne({
      where: { userId, roleId: role.id },
    });

    if (existing) {
      logger.info('User already has this role', { userId, roleName });
      return;
    }

    // Assign role
    const userRole = this.userRoleRepository.create({
      userId,
      roleId: role.id,
      assignedBy,
    });

    await this.userRoleRepository.save(userRole);

    logger.info('Role assigned to user', { userId, roleName, assignedBy });
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string, roleName: string): Promise<void> {
    const role = await this.roleRepository.findOne({ where: { name: roleName } });
    if (!role) {
      throw new NotFoundError(`Role '${roleName}' not found`);
    }

    await this.userRoleRepository.delete({ userId, roleId: role.id });

    logger.info('Role removed from user', { userId, roleName });
  }

  /**
   * Create a new role
   */
  async createRole(
    name: string,
    description?: string,
    permissionNames?: string[]
  ): Promise<Role> {
    // Check if role already exists
    const existing = await this.roleRepository.findOne({ where: { name } });
    if (existing) {
      throw new Error(`Role '${name}' already exists`);
    }

    // Create role
    const role = this.roleRepository.create({
      name,
      description,
    });

    await this.roleRepository.save(role);

    // Assign permissions if provided
    if (permissionNames && permissionNames.length > 0) {
      const permissions = await this.permissionRepository.find({
        where: permissionNames.map((name) => ({ name })),
      });

      role.permissions = permissions;
      await this.roleRepository.save(role);
    }

    logger.info('Role created', { roleName: name });

    return role;
  }

  /**
   * Create a new permission
   */
  async createPermission(
    name: string,
    resource: string,
    action: string,
    description?: string
  ): Promise<Permission> {
    // Check if permission already exists
    const existing = await this.permissionRepository.findOne({ where: { name } });
    if (existing) {
      throw new Error(`Permission '${name}' already exists`);
    }

    const permission = this.permissionRepository.create({
      name,
      resource,
      action,
      description,
    });

    await this.permissionRepository.save(permission);

    logger.info('Permission created', { permissionName: name });

    return permission;
  }

  /**
   * Add permission to role
   */
  async addPermissionToRole(roleName: string, permissionName: string): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { name: roleName },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundError(`Role '${roleName}' not found`);
    }

    const permission = await this.permissionRepository.findOne({
      where: { name: permissionName },
    });

    if (!permission) {
      throw new NotFoundError(`Permission '${permissionName}' not found`);
    }

    // Check if role already has this permission
    const hasPermission = role.permissions.some((p) => p.id === permission.id);
    if (hasPermission) {
      logger.info('Role already has this permission', { roleName, permissionName });
      return;
    }

    role.permissions.push(permission);
    await this.roleRepository.save(role);

    logger.info('Permission added to role', { roleName, permissionName });
  }

  /**
   * Remove permission from role
   */
  async removePermissionFromRole(roleName: string, permissionName: string): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { name: roleName },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundError(`Role '${roleName}' not found`);
    }

    role.permissions = role.permissions.filter((p) => p.name !== permissionName);
    await this.roleRepository.save(role);

    logger.info('Permission removed from role', { roleName, permissionName });
  }

  /**
   * Get all roles
   */
  async getAllRoles(): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { isActive: true },
      relations: ['permissions'],
    });
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { isActive: true },
    });
  }

  /**
   * Get role by name
   */
  async getRoleByName(name: string): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }
}
