// Bookmark Service for saving coach insights and conversations
import { createClient } from '@/lib/supabase/client';

export interface Bookmark {
  id: string;
  userId: string;
  type: 'insight' | 'workout' | 'conversation' | 'goal';
  title: string;
  content: any;
  metadata?: {
    tags?: string[];
    category?: string;
    citations?: string[];
    timestamp?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class BookmarkService {
  private static instance: BookmarkService;
  private supabase = createClient();

  private constructor() {}

  static getInstance(): BookmarkService {
    if (!BookmarkService.instance) {
      BookmarkService.instance = new BookmarkService();
    }
    return BookmarkService.instance;
  }

  // Save a bookmark
  async saveBookmark(
    userId: string,
    type: Bookmark['type'],
    title: string,
    content: any,
    metadata?: Bookmark['metadata']
  ): Promise<Bookmark | null> {
    try {
      const { data, error } = await this.supabase
        .from('bookmarks')
        .insert({
          user_id: userId,
          type,
          title,
          content,
          metadata
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        title: data.title,
        content: data.content,
        metadata: data.metadata,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error saving bookmark:', error);
      return null;
    }
  }

  // Get all bookmarks for a user
  async getUserBookmarks(
    userId: string,
    type?: Bookmark['type']
  ): Promise<Bookmark[]> {
    try {
      let query = this.supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        type: item.type,
        title: item.title,
        content: item.content,
        metadata: item.metadata,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }
  }

  // Delete a bookmark
  async deleteBookmark(userId: string, bookmarkId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      return false;
    }
  }

  // Search bookmarks
  async searchBookmarks(
    userId: string,
    query: string
  ): Promise<Bookmark[]> {
    try {
      const { data, error } = await this.supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .or(`title.ilike.%${query}%,content::text.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        type: item.type,
        title: item.title,
        content: item.content,
        metadata: item.metadata,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    } catch (error) {
      console.error('Error searching bookmarks:', error);
      return [];
    }
  }

  // Get bookmark by ID
  async getBookmark(userId: string, bookmarkId: string): Promise<Bookmark | null> {
    try {
      const { data, error } = await this.supabase
        .from('bookmarks')
        .select('*')
        .eq('id', bookmarkId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        title: data.title,
        content: data.content,
        metadata: data.metadata,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error fetching bookmark:', error);
      return null;
    }
  }

  // Update bookmark
  async updateBookmark(
    userId: string,
    bookmarkId: string,
    updates: Partial<Pick<Bookmark, 'title' | 'content' | 'metadata'>>
  ): Promise<Bookmark | null> {
    try {
      const { data, error } = await this.supabase
        .from('bookmarks')
        .update(updates)
        .eq('id', bookmarkId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        title: data.title,
        content: data.content,
        metadata: data.metadata,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error updating bookmark:', error);
      return null;
    }
  }

  // Get bookmarks by tag
  async getBookmarksByTag(userId: string, tag: string): Promise<Bookmark[]> {
    try {
      const { data, error } = await this.supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .contains('metadata->tags', [tag])
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        type: item.type,
        title: item.title,
        content: item.content,
        metadata: item.metadata,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    } catch (error) {
      console.error('Error fetching bookmarks by tag:', error);
      return [];
    }
  }
}

export default BookmarkService;