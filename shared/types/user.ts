export type UserRole = 'admin' | 'editor' | 'writer';
export type UserStatus = 'pending' | 'active' | 'suspended';

export interface SocialLinks {
    twitter?: string;
    linkedin?: string;
    website?: string;
    github?: string;
}

export interface Author {
    name: string;
    avatar?: string | null;
}

export interface User {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    status: UserStatus;
    bio?: string;
    avatar?: string;
    socialLinks?: SocialLinks;
    createdAt: string | Date;
    updatedAt: string | Date;
}
