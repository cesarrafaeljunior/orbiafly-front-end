import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../features/auth/services/auth-store';

interface NavigationItem {
  label: string;
  path: string;
  icon: string;
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-sidebar',
  styleUrl: './sidebar.scss',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private readonly authStore = inject(AuthStore);
  readonly collapsed = input(false);
  readonly drawer = input(false);
  readonly closeRequested = output<void>();
  readonly toggleRequested = output<void>();
  protected readonly user = this.authStore.user;
  protected readonly isAdmin = this.authStore.isAdmin;
  protected readonly userTitle = computed(() => this.user()?.username ?? 'Minha conta');

  protected readonly navigationGroups: NavigationGroup[] = [
    {
      label: 'Visão',
      items: [{ label: 'Dashboard', path: '/dashboard', icon: 'ph-squares-four' }],
    },
    {
      label: 'Gerenciamento',
      items: [
        { label: 'Despesas fixas', path: '/despesas-fixas', icon: 'ph-receipt' },
        { label: 'Gastos avulsos', path: '/gastos-avulsos', icon: 'ph-shopping-cart-simple' },
        { label: 'Contas', path: '/contas', icon: 'ph-wallet' },
        { label: 'Cartões', path: '/cartoes', icon: 'ph-credit-card' },
        { label: 'Compras do cartão', path: '/compras-parceladas', icon: 'ph-shopping-bag-open' },
        { label: 'Recebimentos', path: '/recebimentos', icon: 'ph-tray-arrow-down' },
        { label: 'Empréstimos', path: '/emprestimos', icon: 'ph-hand-coins' },
      ],
    },
  ];

  protected logout(): void {
    this.closeRequested.emit();
    this.authStore.logout();
  }
}
