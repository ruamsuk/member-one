import { Component, inject } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { GalleriaModule } from 'primeng/galleria';
import { AuthService } from '../services/auth.service';
import { Panel } from 'primeng/panel';
import { getAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SharedModule, GalleriaModule, Panel],
  template: `
    @if (!emailVerify) {
      <div class="center items-center h-[300px]">
        <p-panel>
          <ng-template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-info-circle text-xl text-red-500"></i>
              <span class="text-xl text-red-500 font-bold">Verify your email first!</span>
            </div>
          </ng-template>
          <ng-template #icons>
            <div class="flex flex-wrap items-center justify-end">
              <p-button
                icon="pi pi-times"
                size="small"
                severity="secondary"
                label="Close" (click)="goLogin()"></p-button>
            </div>
          </ng-template>
          <p class="text-base  md:text-center md:text-xl text-amber-300">
            ยังไม่ได้ยืนยันอีเมล์ของคุณ โปรดยืนยันอีเมล์ที่ลงทะเบียนไว้ในระบบ เราได้ส่งลิงก์ยืนยันให้แล้ว
          </p>
          <hr class="my-1 border">
          <p class="md:text-justify text-orange-300 text-base md:text-xl">
            You haven't verified your email yet. Please verify the email registered in the system. We have sent a
            verification link to you.
          </p>

        </p-panel>
      </div>

    } @else if (emailVerify) {
      <div
        class="center text-slate-300 my-3"
      >
        <p class="hidden md:block text-base md:text-xl text-amber-400">Welcome to.</p>
      </div>


      <div class="center">
        <p-galleria
          [value]="images"
          [autoPlay]="true"
          [responsiveOptions]="responsiveOptions"
          [numVisible]="5"
          [circular]="true"
          [showThumbnails]="false"
          [containerStyle]="{ 'max-width': '1100px' }"
        >
          <ng-template pTemplate="item" let-item>
            <img
              [src]="item.source"
              style="width: 100%; max-width: 100%; height: auto;"
              alt="item.alt"
            />
          </ng-template>
          <ng-template pTemplate="caption" let-item>
            <div class="p-galleria-caption">
              <h4 class="text-center">
              <span
                class="charmonman-regular text-xl md:text-4xl text-cyan-300"
              >{{ item.title }}</span
              >
              </h4>
            </div>
          </ng-template>
        </p-galleria>
      </div>
      <div class="center my-3">
        <p class="hidden md:block text-base md:text-xl text-amber-400">25th Batch of Student Investigators' Training
          Club
        </p>
      </div>
      <div class="px-8 -mt-3">
        <hr/>
      </div>
    }
  `,
  styles: `
    .p-galleria {
      width: 100%;
      height: auto;
    }

    .p-galleria .p-galleria-item {
      width: 100%;
      height: auto;
    }

    p-galleria img {
      width: 100%;
      max-width: 1100px; /* กำหนดขนาดสูงสุดที่ต้องการ */
      height: auto;
      display: block;
      margin: 0 auto;
      border-radius: 15px;
    }

    /* gallery.component.css  Not work! */
    .p-galleria .p-galleria-item {
      transition: opacity 0.5s ease-in-out;
      opacity: 1;
    }

    .p-galleria .p-galleria-item.ng-star-inserted {
      opacity: 0;
    }

    .p-galleria .p-galleria-item.p-galleria-item-active {
      opacity: 1;
    }

    hr {
      border: none; /* ลบเส้นขอบเดิมออก */
      height: 1px; /* ความสูงของเส้น */
      background-color: var(--bluegray-300); /* สีของเส้น เช่น สีแดง */
    }
  `,
})
export class HomeComponent {
  auth: AuthService = inject(AuthService);
  emailVerify: boolean | undefined = true;
  router = inject(Router);

  constructor() {
    const auth = getAuth();
    this.emailVerify = auth.currentUser?.emailVerified;
  }


  images: any[] = [
    {
      source: 'photos/01.jpg',
      alt: 'Image 1',
      thumb: '',
      title: 'Ancient province, แคว้นโบราณ',
    },
    {
      source: 'photos/02.jpg',
      alt: 'Image 2',
      thumb: '',
      title: 'Chedi checkpoint, ด่านเจดีย์',
    },
    {
      source: 'photos/03.jpg',
      alt: 'Image 3',
      thumb: '',
      title: 'Jewel of Kanchanaburi, มณีเมืองกาญจน์',
    },
    {
      source: 'photos/04.jpg',
      alt: 'Image 4',
      thumb: '',
      title: 'Bridge over the River Kwai, สะพานข้ามแม่น้ำแคว',
    },
    {
      source: 'photos/05.jpg',
      alt: 'Image 5',
      thumb: '',
      title: 'Mineral resources, แหล่งแร่',
    },
    {
      source: 'photos/06.jpg',
      alt: 'Image 6',
      thumb: '',
      title: 'Waterfalls, น้ำตก',
    },
    {
      source: 'photos/07.jpg',
      alt: 'Image 7',
      thumb: '',
      title: 'Beautiful Skywalk สกายวอร์คงดงาม',
    },
    {
      source: 'photos/08.jpg',
      alt: 'Image 8',
      thumb: '',
      title: 'Welcome to Kanchanaburi!',
    },
  ];
  responsiveOptions: any[] = [
    {
      breakpoint: '1500px',
      numVisible: 5,
    },
    {
      breakpoint: '1024px',
      numVisible: 3,
    },
    {
      breakpoint: '768px',
      numVisible: 2,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    },
  ];

  goLogin() {
    this.auth.logout().then(() => this.router.navigateByUrl('/auth/login'));
  }
}
