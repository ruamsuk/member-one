import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MenuItem, MessageService } from 'primeng/api';
import { SharedModule } from '../shared/shared.module';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserProfileComponent } from '../components/user-profile/user-profile.component';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [SharedModule, RouterLink, NgOptimizedImage],
  template: `
    @if (currentUser()) {
      <div class="card">
        <p-menubar [model]="items">
          <ng-template pTemplate="start">
            <img ngSrc="/images/primeng.png" priority alt="logo" height="51" width="48"/>
          </ng-template>
          <ng-template pTemplate="item" let-item>
            <ng-container>
              <div class="z-0">
                <a [routerLink]="item.route" class="p-menuitem-link">
                  <span [class]="item.icon"></span>
                  <span class="ml-2">{{ item.label }}</span>
                </a>
              </div>
            </ng-container>
          </ng-template>
          <ng-template pTemplate="end">
            <div class="flex align-items-center gap-2">
              <p-avatar
                [image]="userPhoto"
                shape="circle"
                class=""
              />
              <span
                (click)="menu.toggle($event)"
                class="font-bold text-gray-400 mr-2 cursor-pointer sarabun mt-1"
              >
                {{
                  currentUser()?.displayName
                    ? currentUser()?.displayName
                    : currentUser()?.email
                }}
                <i class="pi pi-angle-down"></i>
              </span>
              <p-menu #menu [model]="subitems" [popup]="true"/>
            </div>
          </ng-template>
        </p-menubar>
      </div>
    }
  `,
  styles: `
    .avatar-image img {
      width: 120px; /* กำหนดขนาดที่ต้องการ */
      height: 120px; /* กำหนดขนาดที่ต้องการ */
      object-fit: cover; /* ปรับขนาดภาพให้พอดี */
    }

    .p-menubar {
      position: relative;
    }

    .p-menubar .p-menuitem-link {
      position: relative;
    }
  `
})
export class HeaderComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  dialogService: DialogService = inject(DialogService);
  message = inject(MessageService);
  router = inject(Router);

  items: MenuItem[] | undefined;
  subitems: MenuItem[] | undefined;
  isAdmin: boolean = false;
  ref: DynamicDialogRef | undefined;
  userPhoto: string = '';
  currentUser = this.auth.currentUser;

  ngOnInit() {
    this.getRole().then(
      () => this.setItems()
    );
    this.userPhoto = this.currentUser()?.photoURL || '/images/dummy-user.png';
  }

  async getRole() {
    this.isAdmin = await this.auth.isAuth();
  }

  setItems() {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        command: () => this.router.navigateByUrl('/home'),
      },
      {
        label: 'Members',
        icon: 'pi pi-users',
        command: () => this.router.navigateByUrl('/members'),
      },
      {
        label: 'Users',
        icon: 'pi pi-user-plus',
        command: () => this.router.navigateByUrl('/user'),
        visible: this.isAdmin
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.logout(),
      }
    ];
    this.subitems = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => this.userDialog(),
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.logout(),
      },
    ];
  }

  ngOnDestroy() {
    if (this.ref) this.ref.destroy();
  }

  private logout() {
    this.auth.logout().then(
      () => this.router.navigateByUrl('/auth/login').then()
    );
  }

  private userDialog() {
    this.ref = this.dialogService.open(UserProfileComponent, {
      data: this.currentUser(),
      header: 'User Details',
      width: '500px',
      modal: true,
      contentStyle: {overflow: 'auto'},
      breakpoints: {
        '960px': '500px',
        '640px': '360px',
      },
      closable: true
    });
  }
}
