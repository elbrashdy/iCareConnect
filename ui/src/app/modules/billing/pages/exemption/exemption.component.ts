import { Component, OnInit, AfterContentInit } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Patient } from 'src/app/shared/resources/patient/models/patient.model';
import { PatientService } from 'src/app/shared/resources/patient/services/patients.service';
import { addCurrentPatient, loadCurrentPatient } from 'src/app/store/actions';
import { discountBill } from 'src/app/store/actions/bill.actions';
import { AppState } from 'src/app/store/reducers';
import {
  getLoadingBillStatus,
  getPatientBillLoadedStatus,
  getPatientBills,
} from 'src/app/store/selectors/bill.selectors';
import { getCurrentPatient } from 'src/app/store/selectors/current-patient.selectors';
import {
  getAllPayments,
  getLoadingPaymentStatus,
} from 'src/app/store/selectors/payment.selector';
import { BillObject } from '../../models/bill-object.model';
import { Bill } from "../../models/bill.model";
import { PaymentObject } from '../../models/payment-object.model';
import { BillingService } from '../../services/billing.service';

@Component({
  selector: "app-exemption",
  templateUrl: "./exemption.component.html",
  styleUrls: ["./exemption.component.scss"],
})
export class ExemptionComponent implements OnInit, AfterContentInit {
  currentPatient$: Observable<Patient>;
  patientDetails: any;
  quoteToShow: boolean;
  bills$: Observable<BillObject[]>;
  loadingBills$: Observable<boolean>;
  loadingPayments$: Observable<boolean>;
  payments$: Observable<PaymentObject[]>;
  patientId: string;
  patientsBillsLoadedState$: Observable<boolean>;
  discountItemsCount: any;
  discountItems: any;
  bill: Bill;

  constructor(
    private store: Store<AppState>,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private billingService: BillingService
  ) {}

  ngOnInit() {
    this.patientId = this.route?.snapshot?.params?.patientId;

    this.store.dispatch(loadCurrentPatient({ uuid: this.patientId }));

    this.currentPatient$ = this.store.select(getCurrentPatient);

    this.bills$ = this.store.pipe(select(getPatientBills));
    this.loadingBills$ = this.store.pipe(select(getLoadingBillStatus));

    this.payments$ = this.store.pipe(select(getAllPayments));
    this.loadingPayments$ = this.store.pipe(select(getLoadingPaymentStatus));

    this.patientsBillsLoadedState$ = this.store.select(
      getPatientBillLoadedStatus
    );
  }

  ngAfterContentInit() {
    this.billingService.getAllPatientBills(this.patientId).subscribe({
      next: (bills) => {
        bills.forEach((bill) => {
          if (bill) {
            this.bill = bill;
            this.discountItems = bill.billDetails?.discountItems;
            this.discountItemsCount = this.discountItems.length;
          }
        });
      },
    });
  }

  onDiscountBill(exemptionDetails): void {
    if (exemptionDetails) {
      const { bill, discountDetails, patient } = exemptionDetails;
      this.store.dispatch(discountBill({ bill, discountDetails, patient }));
    }
  }

  onSelectPatient(e) {
    e.stopPropagation();
  }
}
