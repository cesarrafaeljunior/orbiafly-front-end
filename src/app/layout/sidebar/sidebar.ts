import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
  readonly collapsed = input(false);
  readonly drawer = input(false);
  readonly closeRequested = output<void>();
  readonly toggleRequested = output<void>();
  readonly logoutRequested = output<void>();
  readonly userName = input('Usuário');

  protected readonly navigationGroups: NavigationGroup[] = [
    {
      label: 'Visão',
      items: [{ label: 'Dashboard', path: '/dashboard', icon: 'ph-squares-four' }],
    },
    {
      label: 'Gerenciamento',
      items: [
        { label: 'Despesas fixas', path: '/despesas-fixas', icon: 'ph-receipt' },
        { label: 'Contas', path: '/contas', icon: 'ph-wallet' },
        { label: 'Cartões', path: '/cartoes', icon: 'ph-credit-card' },
        { label: 'Parcelados', path: '/parcelados', icon: 'ph-calendar-check' },
      ],
    },
  ];
}
