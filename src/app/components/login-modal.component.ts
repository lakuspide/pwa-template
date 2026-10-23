import { Component, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role } from '../services/auth.service';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="absolute inset-0 z-[3000] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-xl" 
           (click)="closeModal.emit()"
           (keydown.enter)="closeModal.emit()"
           role="button"
           tabindex="0"
           aria-label="Close login"></div>
      
      <div class="relative w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[2rem] p-8 shadow-2xl flex flex-col animate-fade-in"
           role="dialog"
           aria-modal="true"
           aria-label="Login">
        <div class="flex justify-between items-center mb-6">
          <h2 class="font-montserrat font-black text-2xl text-[var(--text-main)]">Demo sign-in</h2>
          <button (click)="closeModal.emit()" class="w-10 h-10 rounded-full bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--border-main)] hover:text-[var(--text-main)] transition-colors">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        
        <p class="text-[var(--text-dim)] mb-8 text-sm">Select a test profile to see how the interface changes based on role.</p>
        
        <div class="flex flex-col gap-3">
          <button (click)="login.emit({email: 'client@example.com', role: 'user'})" class="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-hover)]/50 hover:bg-[var(--border-main)] border border-[var(--border-main)] hover:border-[var(--border-light)] transition-all text-left group">
            <div class="w-10 h-10 rounded-full bg-[var(--border-main)] flex items-center justify-center text-[var(--text-sec)] group-hover:scale-110 transition-transform">
              <mat-icon>person</mat-icon>
            </div>
            <div>
              <h4 class="text-[var(--text-main)] font-bold">Client User</h4>
              <p class="text-[var(--text-dim)] text-xs">Standard access and features</p>
            </div>
          </button>
          
          <button (click)="login.emit({email: 'operator@example.com', role: 'operator'})" class="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-hover)]/50 hover:bg-[var(--border-main)] border border-[var(--border-main)] hover:border-[var(--border-light)] transition-all text-left group">
            <div class="w-10 h-10 rounded-full bg-[var(--border-main)] flex items-center justify-center text-[var(--text-sec)] group-hover:scale-110 transition-transform">
              <mat-icon>build</mat-icon>
            </div>
            <div>
              <h4 class="text-[var(--text-main)] font-bold">Staff / Operator</h4>
              <p class="text-[var(--text-dim)] text-xs">Access to operational tools</p>
            </div>
          </button>
          
          <button (click)="login.emit({email: 'manager@example.com', role: 'manager'})" class="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-hover)]/50 hover:bg-[var(--border-main)] border border-[var(--border-main)] hover:border-[var(--border-light)] transition-all text-left group">
            <div class="w-10 h-10 rounded-full bg-[var(--border-main)] flex items-center justify-center text-[var(--text-sec)] group-hover:scale-110 transition-transform">
              <mat-icon>supervisor_account</mat-icon>
            </div>
            <div>
              <h4 class="text-[var(--text-main)] font-bold">Manager</h4>
              <p class="text-[var(--text-dim)] text-xs">Access to management views</p>
            </div>
          </button>
          
          <button (click)="login.emit({email: 'admin@example.com', role: 'admin'})" class="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-hover)]/50 hover:bg-[var(--border-main)] border border-[var(--border-main)] hover:border-[var(--border-light)] transition-all text-left group">
            <div class="w-10 h-10 rounded-full bg-[var(--border-main)] flex items-center justify-center text-[var(--text-sec)] group-hover:scale-110 transition-transform">
              <mat-icon>admin_panel_settings</mat-icon>
            </div>
            <div>
              <h4 class="text-[var(--text-main)] font-bold">Administrator</h4>
              <p class="text-[var(--text-dim)] text-xs">Full access and dashboard</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  `
})
export class LoginModalComponent {
  closeModal = output<void>();
  login = output<{email: string, role: Role}>();
}
