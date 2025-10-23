import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  Index,
} from 'typeorm';
import { Role } from './Role.entity';

@Entity({ schema: 'auth', name: 'permissions' })
@Index(['resource', 'action'], { unique: true })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true, name: 'permission_name' })
  name!: string;

  @Column({ type: 'varchar', length: 50 })
  resource!: string;

  @Column({ type: 'varchar', length: 50 })
  action!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;
}
