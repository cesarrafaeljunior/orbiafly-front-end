import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { authGuard } from './auth.guard';
import { AuthStore } from './auth-store';

describe('authGuard', () => {
  function runGuard(isAuthenticated: boolean) {
    const urlTree = new UrlTree();
    const router = {
      createUrlTree: vi.fn().mockReturnValue(urlTree),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: { isAuthenticated: () => isAuthenticated } },
        { provide: Router, useValue: router },
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/contas' } as never),
    );
    return { result, router, urlTree };
  }

  it('allows authenticated users', () => {
    const { result } = runGuard(true);

    expect(result).toBe(true);
  });

  it('redirects anonymous users to login', () => {
    const { result, router, urlTree } = runGuard(false);

    expect(result).toBe(urlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/contas' },
    });
  });
});
