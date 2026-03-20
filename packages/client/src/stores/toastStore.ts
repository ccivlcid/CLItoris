import { create } from 'zustand';

export type ToastType = 'info' | 'error' | 'success';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

let nextId = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (message, type = 'info') => {
    const id = ++nextId;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

/** Shorthand helpers */
export const toast = (message: string) => useToastStore.getState().addToast(message, 'info');
export const toastError = (message: string) => useToastStore.getState().addToast(message, 'error');
export const toastSuccess = (message: string) => useToastStore.getState().addToast(message, 'success');
