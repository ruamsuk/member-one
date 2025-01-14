import { Component, inject } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [SharedModule],
  template: `
    <div class="flex justify-center items-center mx-auto my-10">
      <p class="text-2xl font-bold text-orange-300">
        Hello there! home is here.
      </p>
    </div>
    <div class="center py-5">
      <p-button severity="secondary" label="SignOut" (click)="auth.logout()"/>
    </div>
  `,
  styles: ``
})
export class HomeComponent {
  auth: AuthService = inject(AuthService);

  logOut() {

  }
}
