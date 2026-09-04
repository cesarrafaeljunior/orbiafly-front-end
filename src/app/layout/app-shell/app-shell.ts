import { Component, HostBinding, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';

const SIDEBAR_STORAGE_KEY = 'orbiafly.sidebar.collapsed';

@Component({
  imports: [RouterLink, RouterOutlet, Sidebar],
  selector: 'app-shell',
  styleUrl: './app-shell.scss',
  templateUrl: './app-shell.html',
})
export class AppShell {
  protected readonly sidebarCollapsed = signal(this.readSidebarPreference());
  protected readonly drawerOpen = signal(false);

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

  protected openDrawer(): void {
    this.drawerOpen.set(true);
  }

  protected closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  private readSidebarPreference(): boolean {
    try {
      return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  private persistSidebarPreference(collapsed: boolean): void {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    } catch {
      // Preferencia visual; falha de storage nao deve bloquear navegacao.
    }
  }
}
