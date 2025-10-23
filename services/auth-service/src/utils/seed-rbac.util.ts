import { RBACService } from '../services/rbac.service';
import { logger } from './logger.util';

/**
 * Seed initial roles and permissions
 */
export async function seedRBAC(): Promise<void> {
  try {
    const rbacService = new RBACService();

    logger.info('Starting RBAC seeding...');

    // ========================================
    // PERMISSIONS
    // ========================================

    const permissions = [
      // RBAC Management
      { name: 'rbac.read', resource: 'rbac', action: 'read', description: 'View roles and permissions' },
      { name: 'rbac.manage', resource: 'rbac', action: 'manage', description: 'Manage roles and permissions' },

      // User Management
      { name: 'user.read', resource: 'user', action: 'read', description: 'View user profiles' },
      { name: 'user.update', resource: 'user', action: 'update', description: 'Update user profiles' },
      { name: 'user.delete', resource: 'user', action: 'delete', description: 'Delete users' },
      { name: 'user.manage', resource: 'user', action: 'manage', description: 'Full user management' },

      // Quest Management
      { name: 'quest.create', resource: 'quest', action: 'create', description: 'Create quests' },
      { name: 'quest.read', resource: 'quest', action: 'read', description: 'View quests' },
      { name: 'quest.update', resource: 'quest', action: 'update', description: 'Update own quests' },
      { name: 'quest.delete', resource: 'quest', action: 'delete', description: 'Delete own quests' },
      { name: 'quest.publish', resource: 'quest', action: 'publish', description: 'Publish quests' },
      { name: 'quest.manage', resource: 'quest', action: 'manage', description: 'Manage all quests' },

      // Content Moderation
      { name: 'content.moderate', resource: 'content', action: 'moderate', description: 'Moderate user content' },
      { name: 'content.review', resource: 'content', action: 'review', description: 'Review flagged content' },

      // Analytics
      { name: 'analytics.view', resource: 'analytics', action: 'read', description: 'View analytics dashboards' },
      { name: 'analytics.export', resource: 'analytics', action: 'export', description: 'Export analytics data' },

      // Subscription Management
      { name: 'subscription.read', resource: 'subscription', action: 'read', description: 'View subscriptions' },
      { name: 'subscription.manage', resource: 'subscription', action: 'manage', description: 'Manage subscriptions' },

      // System Administration
      { name: 'system.manage', resource: 'system', action: 'manage', description: 'System administration' },
      { name: 'system.config', resource: 'system', action: 'config', description: 'System configuration' },
    ];

    logger.info(`Creating ${permissions.length} permissions...`);

    for (const perm of permissions) {
      try {
        await rbacService.createPermission(perm.name, perm.resource, perm.action, perm.description);
        logger.info(`✓ Permission created: ${perm.name}`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          logger.info(`- Permission already exists: ${perm.name}`);
        } else {
          logger.error(`✗ Error creating permission ${perm.name}:`, error);
        }
      }
    }

    // ========================================
    // ROLES
    // ========================================

    logger.info('Creating roles...');

    // 1. ADVENTURER (Basic User)
    try {
      await rbacService.createRole('ADVENTURER', 'Regular user who participates in quests', [
        'user.read',
        'user.update',
        'quest.read',
        'subscription.read',
      ]);
      logger.info('✓ Role created: ADVENTURER');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        logger.info('- Role already exists: ADVENTURER');
      } else {
        logger.error('✗ Error creating ADVENTURER role:', error);
      }
    }

    // 2. CREATOR (Content Creator)
    try {
      await rbacService.createRole('CREATOR', 'Content creator who can create and manage quests', [
        'user.read',
        'user.update',
        'quest.create',
        'quest.read',
        'quest.update',
        'quest.delete',
        'quest.publish',
        'analytics.view',
        'analytics.export',
        'subscription.read',
      ]);
      logger.info('✓ Role created: CREATOR');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        logger.info('- Role already exists: CREATOR');
      } else {
        logger.error('✗ Error creating CREATOR role:', error);
      }
    }

    // 3. MODERATOR (Content Moderator)
    try {
      await rbacService.createRole('MODERATOR', 'Content moderator with content review capabilities', [
        'user.read',
        'quest.read',
        'quest.manage',
        'content.moderate',
        'content.review',
        'analytics.view',
      ]);
      logger.info('✓ Role created: MODERATOR');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        logger.info('- Role already exists: MODERATOR');
      } else {
        logger.error('✗ Error creating MODERATOR role:', error);
      }
    }

    // 4. ADMIN (Administrator)
    try {
      await rbacService.createRole('ADMIN', 'Platform administrator with extensive permissions', [
        'rbac.read',
        'rbac.manage',
        'user.read',
        'user.update',
        'user.delete',
        'user.manage',
        'quest.create',
        'quest.read',
        'quest.update',
        'quest.delete',
        'quest.publish',
        'quest.manage',
        'content.moderate',
        'content.review',
        'analytics.view',
        'analytics.export',
        'subscription.read',
        'subscription.manage',
        'system.manage',
      ]);
      logger.info('✓ Role created: ADMIN');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        logger.info('- Role already exists: ADMIN');
      } else {
        logger.error('✗ Error creating ADMIN role:', error);
      }
    }

    // 5. SUPER_ADMIN (Super Administrator)
    try {
      await rbacService.createRole('SUPER_ADMIN', 'Super administrator with full system access', [
        'rbac.read',
        'rbac.manage',
        'user.read',
        'user.update',
        'user.delete',
        'user.manage',
        'quest.create',
        'quest.read',
        'quest.update',
        'quest.delete',
        'quest.publish',
        'quest.manage',
        'content.moderate',
        'content.review',
        'analytics.view',
        'analytics.export',
        'subscription.read',
        'subscription.manage',
        'system.manage',
        'system.config',
      ]);
      logger.info('✓ Role created: SUPER_ADMIN');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        logger.info('- Role already exists: SUPER_ADMIN');
      } else {
        logger.error('✗ Error creating SUPER_ADMIN role:', error);
      }
    }

    logger.info('✅ RBAC seeding completed successfully');
  } catch (error) {
    logger.error('❌ Error seeding RBAC:', error);
    throw error;
  }
}
