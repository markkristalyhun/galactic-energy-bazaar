import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {computed, signal} from '@angular/core';

import {Login} from './login';
import {AuthenticationStore} from '@core/auth/stores/authentication.store';
import {CommonModule} from '@angular/common';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {By} from '@angular/platform-browser';

describe('LoginComponent', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authStoreMock: {
    login: ReturnType<typeof vi.fn>;
    isLoading: ReturnType<typeof computed<boolean>>;
  };

  beforeEach(async () => {
    const loginSpy = vi.fn();
    const isLoadingSignal = signal(false);
    authStoreMock = {
      login: loginSpy,
      isLoading: computed(() => isLoadingSignal())
    };

    await TestBed.configureTestingModule({
      imports: [
        Login,
        CommonModule,
        ReactiveFormsModule,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
        })
      ],
      providers: [{ provide: AuthenticationStore, useValue: authStoreMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Form tests

  it('should create form with email and password controls', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')).toBeDefined();
    expect(component.loginForm.get('password')).toBeDefined();
  });

  it('should invalidate email on empty or invalid input', () => {
    const emailControl = component.loginForm.get('email')!;
    expect(emailControl.valid).toBeFalsy();
    emailControl.setValue('invalid');
    expect(emailControl.errors?.['email']).toBeTruthy();
  });

  it('should call store.login on valid submit', () => {
    component.loginForm.patchValue({ email: 'test@example.com', password: 'pass123' });
    component.onLogin();
    expect(authStoreMock.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'pass123' });
  });

  it('should toggle hidePassword signal', () => {
    const initial = component.hidePassword();
    component.togglePasswordVisibility();
    expect(component.hidePassword()).not.toEqual(initial);
  });

  // DOM

  it('should disable submit button when form invalid', () => {
    const submitBtn = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(submitBtn.nativeElement.disabled).toBe(true);

    component.loginForm.patchValue({ email: 'test@example.com', password: 'pass123' });
    fixture.detectChanges();
    expect(submitBtn.nativeElement.disabled).toBe(false);
  });

  it('should toggle password visibility', () => {
    const input = fixture.debugElement.query(By.css('input[formControlName="password"]'))!;
    expect(input.nativeElement.type).toBe('password');

    const toggleBtn = fixture.debugElement.query(By.css('button[mat-icon-button]'));
    toggleBtn!.triggerEventHandler('click', {});
    fixture.detectChanges();
    expect(input.nativeElement.type).toBe('text');
  });
});
