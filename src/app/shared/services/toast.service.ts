import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  paused?: boolean;
  remaining?: number;
}

interface ToastInput {
  title?: string;
  message: string;
  duration?: number;
}

const DEFAULT_DURATION = 4500;
const ERROR_DURATION = 6500;

interface ToastTimer {
  remaining: number;
  startedAt: number;
  timeoutId: ReturnType<typeof window.setTimeout> | null;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly timers = new Map<number, ToastTimer>();

  readonly messages = signal<ToastMessage[]>([]);

  success(message: string, title?: string, duration = DEFAULT_DURATION): void {
    this.show('success', { message, title, duration });
  }

  error(message: string, title?: string, duration = ERROR_DURATION): void {
    this.show('error', { message, title, duration });
  }

  warning(message: string, title?: string, duration = DEFAULT_DURATION): void {
    this.show('warning', { message, title, duration });
  }

  info(message: string, title?: string, duration = DEFAULT_DURATION): void {
    this.show('info', { message, title, duration });
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer?.timeoutId) {
      window.clearTimeout(timer.timeoutId);
    }
    this.timers.delete(id);
    this.messages.update((messages) => messages.filter((message) => message.id !== id));
  }

  pause(id: number): void {
    const timer = this.timers.get(id);
    if (!timer || timer.timeoutId === null) {
      return;
    }

    window.clearTimeout(timer.timeoutId);
    const remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));

    if (remaining <= 0) {
      this.dismiss(id);
      return;
    }

    this.timers.set(id, {
      remaining,
      startedAt: Date.now(),
      timeoutId: null,
    });
    this.updateMessageTimer(id, remaining, true);
  }

  resume(id: number): void {
    const timer = this.timers.get(id);
    if (!timer || timer.timeoutId !== null) {
      return;
    }

    this.scheduleDismiss(id, timer.remaining);
    this.updateMessageTimer(id, timer.remaining, false);
  }

  private show(type: ToastType, input: ToastInput): void {
    const message: ToastMessage = {
      id: this.nextId++,
      type,
      title: input.title,
      message: input.message,
      duration: input.duration,
      paused: false,
      remaining: input.duration,
    };

    this.messages.update((messages) => [...messages, message]);

    if (message.duration && message.duration > 0) {
      this.scheduleDismiss(message.id, message.duration);
    }
  }

  private scheduleDismiss(id: number, remaining: number): void {
    const timeoutId = window.setTimeout(() => this.dismiss(id), remaining);

    this.timers.set(id, {
      remaining,
      startedAt: Date.now(),
      timeoutId,
    });
  }

  private updateMessageTimer(id: number, remaining: number, paused: boolean): void {
    this.messages.update((messages) =>
      messages.map((message) =>
        message.id === id
          ? {
              ...message,
              paused,
              remaining,
            }
          : message,
      ),
    );
  }
}
