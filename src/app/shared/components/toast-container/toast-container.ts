import { Component, inject } from '@angular/core';
import { ToastMessage, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  styleUrl: './toast-container.scss',
  templateUrl: './toast-container.html',
})
export class ToastContainer {
  protected readonly toastService = inject(ToastService);

  protected iconFor(message: ToastMessage): string {
    const icons: Record<ToastMessage['type'], string> = {
      success: 'ph-check-circle',
      error: 'ph-x-circle',
      warning: 'ph-warning',
      info: 'ph-info',
    };

    return icons[message.type];
  }
}
