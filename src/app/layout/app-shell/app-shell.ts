import { Component, HostBinding, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthSession } from '../../core/auth/auth-session';
import { ToastContainer } from '../../shared/components/toast-container/toast-container';
import { Sidebar } from '../sidebar/sidebar';

const SIDEBAR_STORAGE_KEY = 'orbiafly.sidebar.collapsed';

@Component({
  imports: [RouterLink, RouterOutlet, Sidebar, ToastContainer],
  selector: 'app-shell',
  styleUrl: './app-shell.scss',
  templateUrl: './app-shell.html',
})
export class AppShell {
  private readonly router = inject(Router);
  protected readonly session = inject(AuthSession);
  protected readonly sidebarCollapsed = signal(this.readSidebarPreference());
  protected readonly drawerOpen = signal(false);
  protected readonly currentUrl = signal(this.router.url);
  protected readonly authScreen = computed(() =>
    this.currentUrl().startsWith('/login') || this.currentUrl().startsWith('/cadastro'),
  );

  constructor() {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
      this.currentUrl.set(event.urlAfterRedirects);
      this.drawerOpen.set(false);
    });
    this.session.refreshUser().subscribe();
  }

  @HostBinding('class.drawer-open')
  protected get hasOpenDrawer(): boolean {
    return this.drawerOpen();
  }

  protected toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => {
      const next = !collapsed;
      this.persistSidebarPreference(next);
      return next;
    });
  }

  protected openDrawer(): void { this.drawerOpen.set(true); }
  protected closeDrawer(): void { this.drawerOpen.set(false); }
  protected logout(): void { this.session.logout(); }

  private readSidebarPreference(): boolean {
    try { return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'; } catch { return false; }
  }

  private persistSidebarPreference(collapsed: boolean): void {
    try { window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed)); } catch {}
  }
}
