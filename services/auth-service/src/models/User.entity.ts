import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { UserRole as UserRoleEntity } from './UserRole.entity';

export enum UserRole {
  USER = 'user',
  CREATOR = 'creator',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

@Entity({ schema: 'auth', name: 'users' })
@Index(['email'])
@Index(['username'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  username!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({ type: 'boolean', default: false, name: 'email_verified' })
  emailVerified!: boolean;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'verification_token' })
  verificationToken?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'verification_token_expires' })
  verificationTokenExpires?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'password_reset_token' })
  passwordResetToken?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'password_reset_expires' })
  passwordResetExpires?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'last_login_at' })
  lastLoginAt?: Date;

  // For account lockout tracking
  @Column({ type: 'integer', default: 0, name: 'failed_login_attempts' })
  failedLoginAttempts!: number;

  @Column({ type: 'timestamp', nullable: true, name: 'locked_until' })
  lockedUntil?: Date;

  // RBAC: Many-to-many relationship with roles
  @OneToMany(() => UserRoleEntity, (userRole) => userRole.user)
  userRoles!: UserRoleEntity[];
}
