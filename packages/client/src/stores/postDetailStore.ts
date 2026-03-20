import { create } from 'zustand';
import { api } from '../api/client.js';
import type { Post, PostUser, ApiResponse, LlmModel } from '@clitoris/shared';
import { usePostStore } from './postStore.js';

interface ForkedFrom {
  id: string;
  messageRaw: string;
  user: PostUser;
}

interface PostDetailResponse extends Post {
  replies: Post[];
  forkedFrom?: ForkedFrom | null;
}

interface PostDetailState {
  post: Post | null;
  replies: Post[];
  forkedFrom: ForkedFrom | null;
  isLoading: boolean;
  error: string | null;

  // Reply composer
  draft: string;
  cliPreview: string | null;
  selectedModel: LlmModel;
  isTransforming: boolean;
  isSubmitting: boolean;

  fetchPost: (id: string) => Promise<void>;
  addReply: (reply: Post) => void;
  starPost: (postId: string, starred: boolean) => void;
  reset: () => void;

  setDraft: (text: string) => void;
  setModel: (model: LlmModel) => void;
  transformReply: (parentId: string) => Promise<void>;
  submitReply: (parentId: string) => Promise<Post | null>;
  resetDraft: () => void;
}

export const usePostDetailStore = create<PostDetailState>((set, get) => ({
  post: null,
  replies: [],
  forkedFrom: null,
  isLoading: false,
  error: null,

  draft: '',
  cliPreview: null,
  selectedModel: '',
  isTransforming: false,
  isSubmitting: false,

  fetchPost: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<ApiResponse<PostDetailResponse>>(`/posts/${id}`);
      const { replies, forkedFrom, ...post } = res.data;
      set({
        post,
        replies: replies ?? [],
        forkedFrom: forkedFrom ?? null,
        selectedModel: post.llmModel,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, error: 'failed' });
    }
  },

  addReply: (reply) =>
    set((s) => ({
      replies: [...s.replies, reply],
      post: s.post ? { ...s.post, replyCount: s.post.replyCount + 1 } : s.post,
    })),

  starPost: (postId, starred) =>
    set((s) => {
      const delta = starred ? 1 : -1;
      if (s.post?.id === postId) {
        return { post: { ...s.post, isStarred: starred, starCount: s.post.starCount + delta } };
      }
      return {
        replies: s.replies.map((r) =>
          r.id === postId ? { ...r, isStarred: starred, starCount: r.starCount + delta } : r,
        ),
      };
    }),

  reset: () =>
    set({
      post: null,
      replies: [],
      forkedFrom: null,
      isLoading: false,
      error: null,
      draft: '',
      cliPreview: null,
      selectedModel: '',
      isTransforming: false,
      isSubmitting: false,
    }),

  setDraft: (text) => set({ draft: text, cliPreview: null }),
  setModel: (model) => set({ selectedModel: model }),

  transformReply: async (_parentId) => {
    const { draft, selectedModel } = get();
    if (!draft.trim()) return;
    if (!selectedModel.trim()) return;
    const { selectedCliTool } = usePostStore.getState();
    set({ isTransforming: true });
    try {
      const res = await api.post<ApiResponse<{ messageCli: string }>>('/llm/transform', {
        message: draft,
        model: selectedModel,
        lang: 'en',
        ...(selectedCliTool.trim() ? { cliTool: selectedCliTool } : {}),
      });
      set({ cliPreview: res.data.messageCli, isTransforming: false });
    } catch {
      set({ isTransforming: false });
    }
  },

  submitReply: async (parentId) => {
    const { draft, cliPreview, selectedModel } = get();
    if (!draft.trim()) return null;
    if (!selectedModel.trim()) return null;

    let cli = cliPreview;
    if (!cli) {
      await get().transformReply(parentId);
      cli = get().cliPreview;
      if (!cli) return null;
    }

    set({ isSubmitting: true });
    try {
      const res = await api.post<ApiResponse<Post>>('/posts', {
        messageRaw: draft,
        messageCli: cli,
        lang: 'en',
        llmModel: selectedModel,
        parentId,
      });
      set({ isSubmitting: false });
      get().resetDraft();
      get().addReply(res.data);
      return res.data;
    } catch {
      set({ isSubmitting: false });
      return null;
    }
  },

  resetDraft: () => set({ draft: '', cliPreview: null }),
}));
