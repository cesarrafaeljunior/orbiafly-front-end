import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { OneOffExpensesPage } from './one-off-expenses-page';

describe('OneOffExpensesPage', () => {
  let fixture: ComponentFixture<OneOffExpensesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OneOffExpensesPage],
    }).compileComponents();
    fixture = TestBed.createComponent(OneOffExpensesPage);
  });

  it('creates the page', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
