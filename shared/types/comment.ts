import type { User } from './user';

export interface Comment {
    id: number;
    content: string;
    articleId: number;
    userId: number | null;
    parentId?: number | null;
    guestName?: string | null;
    guestEmail?: string | null;
    isPrivate?: boolean;
    createdAt: string;
    updatedAt: string;
    
    // Relations (Frontend에서 Join된 데이터)
    author?: User;
    children?: Comment[]; // 대댓글
}

export interface CommentInput {
    content: string;
    parentId?: number;
}
