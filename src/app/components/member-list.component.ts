import { Component, inject, OnDestroy, signal } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService } from '../services/auth.service';
import { AddEditMemberComponent } from '../pages/add-edit-member.component';
import { SharedModule } from '../shared/shared.module';
import { Member } from '../models/member.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { MembersService } from '../services/members.service';
import { catchError, Observable, take, tap, throwError } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { NgClass } from '@angular/common';
import { ThaiDatePipe } from '../pipes/thai-date.pipe';
import { MemberDetailComponent } from './member-detail.component';
import { ConfirmationService } from 'primeng/api';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-member-list',
  imports: [SharedModule, TableModule, NgClass, ThaiDatePipe, Message],
  template: `
    @if (loading()) {
      <div class="loading-shade">
        <p-progressSpinner strokeWidth="4" ariaLabel="loading"/>
      </div>
    }
    @if (getMembers()) {
      <div class="table-container mt-3">
        <p-table
          #tb
          [value]="getMembers()"
          [paginator]="true"
          [globalFilterFields]="['firstname','lastname','province','alive']"
          [rows]="10"
          [rowHover]="true"
          [tableStyle]="{ 'min-width': '40rem'}"
          responsiveLayout="scroll">
          >
          <ng-template #caption>
            <div class="flex items-center justify-between">
              <span>
                <p-button (click)="showDialog('')"
                          [disabled]="!admin"
                          size="small" icon="pi pi-plus"
                          pTooltip="เพิ่มสมาชิก"/>
              </span>
              <span
                class="hidden md:block tasadith text-green-400 text-lg md:text-2xl ml-auto"
              >
                  Members List
                </span>
              <p-iconField iconPosition="left" styleClass="ml-auto">
                <p-inputIcon>
                  <i class="pi pi-search"></i>
                </p-inputIcon>
                <input
                  class="sarabun"
                  pInputText
                  [formControl]="searchValue"
                  pTooltip="ค้นหาตาม ชื่อ นามสกุล จังหวัด เสียชีวิต"
                  tooltipPosition="bottom"
                  placeholder="Search .."
                  type="text"
                  (input)="tb.filterGlobal(getValue($event), 'contains')"
                />
                @if (searchValue.value) {
                  <span class="icons" (click)="clear(tb)">
                      <i
                        class="pi pi-times cursor-pointer"
                        style="font-size: 1rem"
                      ></i>
                    </span>
                }
              </p-iconField>
            </div>
          </ng-template>
          <ng-template #header>
            <tr>
              <th style="width: 5%">#</th>
              <th style="width: 25%" pSortableColumn="firstname">
                ยศ ชื่อ ชื่อสกุล
                <p-sortIcon field="firstname"></p-sortIcon>
              </th>
              <th style="width: 15%">วันเดือนปีเกิด</th>
              <th style="width: 15%">Action</th>
            </tr>
          </ng-template>
          <ng-template #body let-member let-i="rowIndex">
            <tr [ngClass]="{ 'row-status': member.alive == 'เสียชีวิตแล้ว' }">
              <td [ngClass]="{ isAlive: member.alive == 'เสียชีวิตแล้ว' }">
                {{ currentPage * rowsPerPage + i + 1 }}
              </td>
              <td [ngClass]="{ isAlive: member.alive == 'เสียชีวิตแล้ว' }">
                  <span>
                    {{ member.rank }}{{ truncateText(member.firstname, 15) }}
                    {{ truncateText(member.lastname, 15) }}
                  </span>
              </td>
              <td [ngClass]="{ isAlive: member.alive == 'เสียชีวิตแล้ว' }">
                {{ member.birthdate | thaiDate }}
              </td>
              <td>
                @if (admin) {
                  <i
                    class="pi pi-list mr-2 text-green-400"
                    (click)="openDialog(member)" pTooltip="รายละเอียด"
                    tooltipPosition="bottom"
                  ></i>
                  <i
                    class="pi pi-pen-to-square mr-2 ml-2 text-blue-400"
                    (click)="showDialog(member)" pTooltip="แก้ไขข้อมูล"
                    tooltipPosition="bottom"
                  ></i>
                  <p-confirmPopup/>
                  <i (click)="doDelete($event, member.id)"
                     class="pi pi-trash mr-2 ml-2 text-orange-600"
                     pTooltip="ลบรายการนี้" tooltipPosition="bottom"
                  ></i>
                } @else if (isMember) {
                  <i
                    class="pi pi-list mr-2 text-green-400"
                    (click)="openDialog(member)"
                    pTooltip="รายละเอียด"
                    tooltipPosition="bottom"
                  ></i>
                } @else {
                  <i class="pi pi-lock text-100 text-slate-500 ml-3"></i>
                }
              </td>
            </tr>
          </ng-template>
          <ng-template #footer>
            <td colspan="5">
              @if (!admin && !isMember) {
                <div>
                  <p-message severity="warn" icon="pi pi-exclamation-circle" styleClass="center italic">
                    Visitors are not allowed to view member details.
                  </p-message>
                </div>
              }
            </td>
          </ng-template>
        </p-table>
      </div>
    }

  `,
  styles: `
    .isAlive {
      color: #53c7f1 !important;
      font-weight: 500 !important;
    }

    .row-status {
      background-color: rgba(246, 246, 248, 0.05) !important;
    }

    td > i {
      cursor: pointer;
    }
  `
})
export class MemberListComponent implements OnDestroy {
  private authService: AuthService = inject(AuthService);
  private confirmService: ConfirmationService = inject(ConfirmationService);
  private dialogService: DialogService = inject(DialogService);
  private toastService = inject(ToastService);
  private membersService: MembersService = inject(MembersService);

  ref: DynamicDialogRef | undefined;
  currentPage = 0;
  rowsPerPage = 10;
  admin: boolean = false;
  isMember: boolean = false;
  members!: Member[];
  member!: Member;
  searchValue = new FormControl('');
  loading = signal<boolean>(true);

  getMembers = toSignal(
    (this.membersService.getAllMember() as Observable<Member[]>)
      .pipe(
        tap(() => {
          this.loading.set(false);
        }),
        catchError((err: any) => {
          this.loading.set(false);
          return throwError(() => err);
        })
      ),
    {
      initialValue: [],
    }
  );

  constructor() {
    this.chkRole();

  }

  openDialog(member: any) {
    this.ref = this.dialogService.open(MemberDetailComponent, {
      data: member,
      header: 'Member details',
      modal: true,
      width: '420px',
      contentStyle: {overflow: 'auto'},
      breakpoints: {
        '960px': '420px',
        '640px': '420px',
        '390px': '385px',
      },
      closable: true,
    });
  }

  showDialog(member: any) {
    let header = member ? 'Edit Member' : 'Add New Member';

    this.ref = this.dialogService.open(AddEditMemberComponent, {
      data: member,
      header: header,
      width: '500px',
      modal: true,
      contentStyle: {overflow: 'auto'},
      breakpoints: {
        '960px': '500px',
        '640px': '360px',
      },
      closable: true,
    });
  }

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  clear(table: Table) {
    table.clear();
    this.searchValue.setValue('');
  }

  truncateText(text: string, length: number): string {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  chkRole() {
    this.authService.userProfile$.pipe(take(1)).subscribe((user: any) => {
      this.admin = user.role === 'admin' || user.role === 'manager';
      this.isMember = user.role === 'member';
    });
  }

  doDelete(event: Event, id: string) {
    this.confirmService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this record?',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger'
      },
      accept: () => {
        this.membersService.deleteMember(id)
          .subscribe({
            next: () => this.toastService.showSuccess('Delete', 'Deleted Successfully'),
            error: err => this.toastService.showError('Error', err.message),
          });
      },
      reject: () => this.toastService.showInfo('Info Message', 'You have rejected')
    });
  }

  ngOnDestroy(): void {
    if (this.ref) this.ref.destroy();
  }
}

