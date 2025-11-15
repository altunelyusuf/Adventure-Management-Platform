import { AppDataSource } from '../config/database';

export class AdminService {
  // User Management
  async getUsers(filters: any) {
    const query = `
      SELECT u.user_id, u.email, u.role, u.created_at, u.last_login,
             p.first_name, p.last_name, p.city, p.country,
             COUNT(DISTINCT q.quest_id) as quest_count,
             COUNT(DISTINCT qp.participation_id) as participation_count
      FROM auth.users u
      LEFT JOIN profiles.user_profiles p ON u.user_id = p.user_id
      LEFT JOIN quests.quests q ON u.user_id = q.creator_id
      LEFT JOIN quests.quest_participants qp ON u.user_id = qp.user_id
      WHERE u.deleted_at IS NULL
      ${filters.role ? 'AND u.role = $1' : ''}
      GROUP BY u.user_id, p.user_profile_id
      ORDER BY u.created_at DESC
      LIMIT ${filters.limit || 50} OFFSET ${filters.offset || 0}
    `;
    return await AppDataSource.query(query, filters.role ? [filters.role] : []);
  }

  async banUser(userId: string, reason: string, bannedBy: string) {
    await AppDataSource.query(
      `UPDATE auth.users SET is_active = false, banned_at = NOW(), ban_reason = $1, banned_by = $2 WHERE user_id = $3`,
      [reason, bannedBy, userId]
    );
    return { success: true, message: 'User banned successfully' };
  }

  async unbanUser(userId: string) {
    await AppDataSource.query(
      `UPDATE auth.users SET is_active = true, banned_at = NULL, ban_reason = NULL, banned_by = NULL WHERE user_id = $1`,
      [userId]
    );
    return { success: true, message: 'User unbanned successfully' };
  }

  // Content Moderation
  async getPendingQuests() {
    return await AppDataSource.query(`
      SELECT q.*, u.email as creator_email,
             p.first_name, p.last_name,
             COUNT(c.checkpoint_id) as checkpoint_count
      FROM quests.quests q
      JOIN auth.users u ON q.creator_id = u.user_id
      LEFT JOIN profiles.user_profiles p ON u.user_id = p.user_id
      LEFT JOIN quests.checkpoints c ON q.quest_id = c.quest_id
      WHERE q.status = 'DRAFT' AND q.published_at IS NULL
      GROUP BY q.quest_id, u.user_id, p.user_profile_id
      ORDER BY q.created_at DESC
    `);
  }

  async approveQuest(questId: string, approvedBy: string) {
    await AppDataSource.query(
      `UPDATE quests.quests SET status = 'PUBLISHED', published_at = NOW(), approved_by = $1 WHERE quest_id = $2`,
      [approvedBy, questId]
    );
    return { success: true, message: 'Quest approved and published' };
  }

  async rejectQuest(questId: string, reason: string, rejectedBy: string) {
    await AppDataSource.query(
      `UPDATE quests.quests SET status = 'ARCHIVED', rejection_reason = $1, rejected_by = $2, rejected_at = NOW() WHERE quest_id = $3`,
      [reason, rejectedBy, questId]
    );
    return { success: true, message: 'Quest rejected' };
  }

  // System Analytics
  async getSystemStats() {
    const [userStats] = await AppDataSource.query(`
      SELECT
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_week,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_month,
        COUNT(*) FILTER (WHERE is_active = true) as active_users,
        COUNT(*) FILTER (WHERE is_active = false) as banned_users
      FROM auth.users
    `);

    const [questStats] = await AppDataSource.query(`
      SELECT
        COUNT(*) as total_quests,
        COUNT(*) FILTER (WHERE status = 'PUBLISHED') as published_quests,
        COUNT(*) FILTER (WHERE status = 'DRAFT') as draft_quests,
        AVG(participant_count) as avg_participants,
        AVG(completion_count) as avg_completions
      FROM quests.quests
    `);

    const [revenueStats] = await AppDataSource.query(`
      SELECT
        COUNT(*) as total_subscriptions,
        COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_subscriptions,
        SUM(CASE WHEN tier = 'BASIC' THEN 9.99 WHEN tier = 'STANDARD' THEN 19.99 WHEN tier = 'PREMIUM' THEN 29.99 END) as monthly_revenue
      FROM payments.subscriptions
      WHERE status = 'ACTIVE'
    `);

    return {
      users: userStats,
      quests: questStats,
      revenue: revenueStats,
      timestamp: new Date().toISOString()
    };
  }

  async getActivityLog(limit: number = 100) {
    return await AppDataSource.query(`
      SELECT a.*, u.email, p.first_name, p.last_name
      FROM social.activities a
      JOIN auth.users u ON a.user_id = u.user_id
      LEFT JOIN profiles.user_profiles p ON u.user_id = p.user_id
      ORDER BY a.created_at DESC
      LIMIT $1
    `, [limit]);
  }
}
