import { Component, DestroyRef, HostListener, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNG } from 'primeng/config';
import lara from '@primeng/themes/lara';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from './services/auth.service';
import { SharedModule } from './shared/shared.module';
import { HeaderComponent } from './pages/header.component';
import { FooterComponent } from './pages/footer.component';
import { Auth, getAuth, onAuthStateChanged, user } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SharedModule, HeaderComponent, FooterComponent],
  template: `
    <p-toast/>
    @if (currentUser() && emailVerify()) {
      <app-header/>
    }
    <router-outlet/>
    @if (currentUser() && emailVerify()) {
      <app-footer/>
    }
  `,
  styles: [
    `
      :host ::ng-deep .p-toast-message {
        font-family: 'Sarabun', sans-serif;
        font-size: 1.5rem;
        font-style: italic;
      }

      :host ::ng-deep .p-toast-detail {
        font-style: italic;
        font-size: 1.125rem;
      }

      :host ::ng-deep .p-toast-summary {
        font-size: 1.125rem !important;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  private auth: AuthService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private primeng: PrimeNG = inject(PrimeNG);
  private translate: TranslateService = inject(TranslateService);
  private isAuth: Auth = inject(Auth);
  emailVerify = signal(false);

  currentUser = this.auth.currentUser;

  ngOnInit() {
    // const auth = getAuth();

    onAuthStateChanged(this.isAuth, (user) => {
      this.emailVerify.set(user?.emailVerified || false);
    });
    /** Prime */
    this.primeng.zIndex = {
      modal: 1100,    // dialog, sidebar
      overlay: 1000,  // dropdown, overlaypanel
      menu: 1000,     // overlay menus
      tooltip: 1100   // tooltip
    };
    this.primeng.theme.set({
      preset: lara,
      options: {
        cssLayer: {
          name: 'primeng',
          order: 'tailwind-base, primeng, tailwind-utilities'
        }
      }
    });
    /** Translate */
    this.translate.addLangs(['en', 'th']);
    this.translate.setDefaultLang('th');
    this.translate.use('th');
    this.translate.get('th')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lang) => this.primeng.setTranslation(lang));
  }

  /** For listener */
  @HostListener('window:mousemove')
  @HostListener('window:keydown')
  resetTimer() {
    this.auth.resetTimer();
  }
}
