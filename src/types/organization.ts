// Organization related types (Departments, Groups, Users)

import type { ID, Timestamps } from './common';
import type { User } from './auth';

export interface Department extends Timestamps {
  id: ID;
  name: string;
  code: string;
  description?: string;
  parentId?: ID;
  leaderId?: ID;
  memberCount: number;
  status: 'active' | 'inactive';
}

export interface Group extends Timestamps {
  id: ID;
  name: string;
  description?: string;
  type: GroupType;
  departmentId?: ID;
  departmentName?: string;
  memberIds: ID[];
  memberCount: number;
  lastMessageAt?: string;
  unreadCount?: number;
  avatar?: string;
}

export type GroupType = 'private' | 'department' | 'project' | 'public';

export interface GroupMember {
  userId: ID;
  user: User;
  role: GroupMemberRole;
  joinedAt: string;
}

export type GroupMemberRole = 'owner' | 'admin' | 'member';

export interface WorkType extends Timestamps {
  id: ID;
  name: string;
  code: string;
  description?: string;
  color?: string;
  icon?: string;
  order: number;
  status: 'active' | 'inactive';
}

// Thread grouping for lead view
export interface ThreadGroup {
  id: ID;
  name: string;
  type: GroupType;
  members: User[];
  lastMessage?: {
    content: string;
    senderName: string;
    sentAt: string;
  };
  unreadCount: number;
  status: ThreadStatus;
}

export type ThreadStatus = 'open' | 'pending' | 'resolved' | 'closed';
