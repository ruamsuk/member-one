import { Component, inject, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Member } from '../models/member.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ToastService } from '../services/toast.service';
import { MembersService } from '../services/members.service';
import { AutoComplete } from 'primeng/autocomplete';
import { DatePicker } from 'primeng/datepicker';
import { InputSwitch } from 'primeng/inputswitch';
import { NgClass } from '@angular/common';
import { ToggleSwitch } from 'primeng/toggleswitch';

@Component({
  selector: 'app-add-edit-member',
  standalone: true,
  imports: [SharedModule, AutoComplete, DatePicker, NgClass, ToggleSwitch],
  template: `
    <div>
      <div class="mb-4">
        <hr class="h-px bg-gray-200 border-0"/>
      </div>

      <form [formGroup]="memberForm" (ngSubmit)="onSubmit()">
        <input type="hidden" name="focus"/>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          <div>
            <label>ยศ</label>
            <p-autoComplete
              id="rank"
              formControlName="rank"
              [dropdown]="true"
              [suggestions]="filteredRanks"
              (completeMethod)="filterRanks($event)"
              appendTo="body"
              class="w-full"
              optionLabel="rank"
            >
            </p-autoComplete>
          </div>
          <div>
            <label for="firstname">ชื่อ</label>
            <input
              type="text"
              pInputText
              formControlName="firstname"
              class="w-full"
            />
          </div>
          <div>
            <label for="lastname">นามสกุล</label>
            <input
              type="text"
              pInputText
              formControlName="lastname"
              class="w-full mt-1"
            />
          </div>
          <div>
            <label for="birthdate">วันเดือนปีเกิด</label>
            <p-datepicker
              formControlName="birthdate"
              [showIcon]="true"
              [iconDisplay]="'input'"
              inputId="icondisplay"
              appendTo="body" styleClass="mt-1"></p-datepicker>
          </div>
          <div class="col-span-2">
            <label for="address">ที่อยู่</label>
            <input
              type="text"
              pInputText
              formControlName="address"
              class="w-full mt-1"
            />
            <small class="text-slate-400 text-sm italic">บ้านเลขที่ ถนน ตำบล</small>
          </div>
          <div>
            <label for="district">อำเภอ</label>
            <input
              type="text"
              pInputText
              formControlName="district"
              class="w-full mt-1"
            />
          </div>
          <div>
            <label for="province">จังหวัด</label>
            <input
              type="text"
              pInputText
              formControlName="province"
              class="w-full mt-1"
            />
          </div>
          <div>
            <label for="zip">รหัสไปรษณีย์</label>
            <input
              type="text"
              pInputText
              formControlName="zip"
              class="w-full mt-1"
            />
          </div>
          <div>
            <label for="phone">โทรศัพท์</label>
            <input
              type="text"
              pInputText
              formControlName="phone"
              class="w-full mt-1"
            />
          </div>
        </div>
        <div class="flex mt-2">
          <p-toggleswitch formControlName="alive"/>
          <span
            [ngClass]="{
              isAlive: statusMessage == 'ยังมีชีวิต',
              status: statusMessage == 'เสียชีวิตแล้ว',
            }"
          >{{ statusMessage }}</span
          >
        </div>
        <div class="my-3">
          <hr class="h-px bg-gray-400 border-0"/>
        </div>
        <div class="grid grid-cols-2 mt-3 gap-2 md:gap-4">
          <p-button
            label="Cancel"
            severity="secondary"
            styleClass="w-full"
            class="w-full mr-2"
            (onClick)="closeDialog()"
          />
          <p-button
            label="Save"
            (onClick)="onSubmit()"
            [disabled]="memberForm.invalid"
            styleClass="w-full"
            class="w-full"
          />
        </div>
      </form>
    </div>
  `,
  styles: `

    label {
      margin-left: 0.5rem;
      //color: #aaa9a9;
    }

    .isAlive {
      color: #78f153 !important;
      font-weight: 500 !important;
      font-family: 'Sarabun', sans-serif;
      margin-left: 0.5rem;
      margin-top: 0.1rem;
    }

    .status {
      color: #f63653 !important;
      font-weight: 500 !important;
      font-family: 'Sarabun', sans-serif;
      margin-left: 0.5rem;
      margin-top: 0.1rem;
    }
  `,
})
export class AddEditMemberComponent implements OnInit {
  message: ToastService = inject(ToastService);
  memberService: MembersService = inject(MembersService);
  ref = inject(DynamicDialogRef);
  memData = inject(DynamicDialogConfig);
  fb = inject(FormBuilder);
  //
  member!: Member;
  memberForm!: FormGroup;
  ranks: any[] = [
    { rank: 'น.อ.ร.' },
    { rank: 'ร.ต.อ.' },
    { rank: 'พ.ต.ต.' },
    { rank: 'พ.ต.ท.' },
    { rank: 'พ.ต.อ.' },
  ];
  filteredRanks: any;
  statusMessage: string = 'ยังมีชีวิต';
  alive: boolean = true;

  //
  constructor() {
    this.memberForm = this.fb.group({
      id: [null],
      rank: [''],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      birthdate: [''],
      address: [''],
      district: [''],
      province: [''],
      role: [''],
      zip: [''],
      phone: [''],
      alive: [false], // เริ่มต้นเป็น false ซึ่งหมายถึง "ยังมีชีวิต"
    });
  }

  ngOnInit(): void {
    this.memberForm.get('alive')?.valueChanges.subscribe((value) => {
      this.statusMessage = value ? 'เสียชีวิตแล้ว' : 'ยังมีชีวิต';
    });
    if (this.memData.data) {
      const data = this.memData.data;
      this.memberForm.patchValue({
        ...data,
        birthdate: data.birthdate.toDate(),
        alive: data.alive == 'เสียชีวิตแล้ว',
      });
    }
  }

  filterRanks(event: any) {
    const query = event.query.toLowerCase();
    this.filteredRanks = this.ranks.filter((rank) =>
      rank.rank.toLowerCase().includes(query),
    );
  }

  onSubmit(): void {
    const formData = this.memberForm.value;
    const status = this.memberForm.value.alive ? 'เสียชีวิตแล้ว' : 'ยังมีชีวิต';
    const rank =
      typeof formData.rank === 'object' ? formData.rank.rank : formData.rank;
    const dummy = {
      ...formData,
      rank: rank,
      alive: status,
    };

    if (this.memData.data) {
      this.memberService.updateMember(dummy).subscribe({
        next: () => this.message.showSuccess('Successfully', 'Updated SuccessFully'),
        error: (error: any) => this.message.showError('Error', error.message),
        complete: () => {
          this.closeDialog();
        },
      });
    } else {
      console.log(JSON.stringify(dummy, null, 2));
      this.memberService
        .checkDuplicate(dummy.firstname, dummy.lastname)
        .subscribe({
          next: (isDuplicate: boolean) => {
            if (isDuplicate) {
              this.message.showWarn('Information', 'มีข้อมูลนี้แล้วในระบบ');
            } else {
              this.memberService.addMember(dummy).subscribe({
                next: () =>
                  this.message.showSuccess('Successfully', 'Add New Member Successfully'),
                error: (error: any) => this.message.showError('Error', error.message),
                complete: () => {
                  this.closeDialog();
                },
              });
            }
          },
          error: (err: any) => {
            console.error('Error checking for duplicate:', err.message);
            this.message.showError('Error', 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลซ้ำ');
          },
        });
    }
  }

  closeDialog() {
    this.ref.close(true);
  }
}
