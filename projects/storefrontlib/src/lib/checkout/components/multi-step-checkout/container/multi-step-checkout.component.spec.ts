import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import * as NgrxStore from '@ngrx/store';
import { of, BehaviorSubject } from 'rxjs';
import * as fromCart from '../../../../cart/store';
import * as fromRoot from '../../../../routing/store';
import * as fromUser from '../../../../user/store';
import * as fromAuth from '../../../../auth/store';
import { Address } from '../../../models/address-model';
import * as fromCheckout from '../../../store';
import { CartSharedModule } from '../../../../cart/components/cart-shared/cart-shared.module';
import { ShippingAddressModule } from '../shipping-address/shipping-address.module';
import { DeliveryModeModule } from '../delivery-mode/delivery-mode.module';
import { PaymentMethodModule } from '../payment-method/payment-method.module';
import { ReviewSubmitModule } from '../review-submit/review-submit.module';
import { CartDataService } from './../../../../cart/services/cart-data.service';
import { CartService } from './../../../../cart/services/cart.service';
import { CheckoutService } from './../../../services/checkout.service';
import { MultiStepCheckoutComponent } from './multi-step-checkout.component';

const mockAddress: Address = {
  id: 'mock address id',
  firstName: 'John',
  lastName: 'Doe',
  titleCode: 'mr',
  line1: 'Toyosaki 2 create on cart',
  line2: 'line2',
  town: 'town',
  region: { isocode: 'JP-27' },
  postalCode: 'zip',
  country: { isocode: 'JP' }
};
const mockPaymentDetails = {
  id: 'mock payment id',
  accountHolderName: 'Name',
  cardNumber: '123456789',
  cardType: 'Visa',
  expiryMonth: '01',
  expiryYear: '2022',
  cvn: '123'
};
const mockDeliveryAddress = ['address1', 'address2'];
const mockSelectedCode = 'test mode';
const mockPaymentInfo = { card: '12345' };
const mockOrder = { id: '1234' };

const mockCheckoutSelectors = {
  getDeliveryAddress: new BehaviorSubject(null),
  getSelectedCode: new BehaviorSubject(null),
  getPaymentDetails: new BehaviorSubject(null),
  getOrderDetails: new BehaviorSubject(null)
};
const mockCartSelectors = {
  getActiveCart: new BehaviorSubject(null)
};
const mockSelect = selector => {
  switch (selector) {
    case fromCheckout.getDeliveryAddress:
      return () => mockCheckoutSelectors.getDeliveryAddress;
    case fromCheckout.getSelectedCode:
      return () => mockCheckoutSelectors.getSelectedCode;
    case fromCheckout.getPaymentDetails:
      return () => mockCheckoutSelectors.getPaymentDetails;
    case fromCheckout.getOrderDetails:
      return () => mockCheckoutSelectors.getOrderDetails;
    case fromCart.getActiveCart:
      return () => mockCartSelectors.getActiveCart;
  }
};

fdescribe('MultiStepCheckoutComponent', () => {
  let store: Store<fromRoot.State>;
  let component: MultiStepCheckoutComponent;
  let fixture: ComponentFixture<MultiStepCheckoutComponent>;
  let service: CheckoutService;
  let cartService: CartService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        CartSharedModule,
        StoreModule.forRoot({
          ...fromRoot.getReducers(),
          cart: combineReducers(fromCart.getReducers()),
          user: combineReducers(fromUser.getReducers()),
          checkout: combineReducers(fromCheckout.getReducers()),
          auth: combineReducers(fromAuth.getReducers())
        }),
        ShippingAddressModule,
        DeliveryModeModule,
        PaymentMethodModule,
        ReviewSubmitModule
      ],
      declarations: [MultiStepCheckoutComponent],
      providers: [CheckoutService, CartService, CartDataService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiStepCheckoutComponent);
    component = fixture.componentInstance;
    service = TestBed.get(CheckoutService);
    store = TestBed.get(Store);
    cartService = TestBed.get(CartService);

    spyOn(store, 'dispatch').and.callThrough();
    spyOn(component, 'addAddress').and.callThrough();
    spyOn(component, 'nextStep').and.callThrough();
    spyOn(service, 'createAndSetAddress').and.callThrough();
    spyOn(service, 'setDeliveryAddress').and.callThrough();
    spyOn(service, 'setDeliveryMode').and.callThrough();
    spyOn(service, 'createPaymentDetails').and.callThrough();
    spyOn(service, 'setPaymentDetails').and.callThrough();
    spyOn(service, 'placeOrder').and.callThrough();
    spyOn(cartService, 'loadCartDetails').and.callThrough();
    spyOnProperty(NgrxStore, 'select').and.returnValue(mockSelect);
  });

  // it('should be created', () => {
  //   expect(component).toBeTruthy();
  // });

  it('should call ngOnInit() before process steps', () => {
    const mockCartData = {};
    mockCartSelectors.getActiveCart.next(mockCartData);
    component.ngOnInit();
    expect(component.step).toEqual(1);
    expect(cartService.loadCartDetails).toHaveBeenCalled();
  });

  it('should call processSteps() to process step 1: set delivery address', () => {
    mockCartSelectors.getActiveCart.next(null);
    mockCheckoutSelectors.getDeliveryAddress.next(mockDeliveryAddress);
    mockCheckoutSelectors.getSelectedCode.next('');
    mockCheckoutSelectors.getPaymentDetails.next({});
    mockCheckoutSelectors.getOrderDetails.next({});

    component.processSteps();
    expect(component.nextStep).toHaveBeenCalledWith(2);
  });

  // it('should call processSteps() to process step 2: select delivery mode', () => {
  //   mockCheckoutSelectors.getDeliveryAddress.next(mockDeliveryAddress);
  //   mockCheckoutSelectors.getSelectedCode.next(mockSelectedCode);
  //   mockCheckoutSelectors.getPaymentDetails.next({});
  //   mockCheckoutSelectors.getOrderDetails.next({});

  //   component.processSteps();
  //   expect(component.nextStep).toHaveBeenCalledWith(3);
  // });

  // it('should call processSteps() to process step 3: set payment info', () => {
  //   mockCheckoutSelectors.getDeliveryAddress.next(mockDeliveryAddress);
  //   mockCheckoutSelectors.getSelectedCode.next(mockSelectedCode);
  //   mockCheckoutSelectors.getPaymentDetails.next(mockPaymentInfo);
  //   mockCheckoutSelectors.getOrderDetails.next({});

  //   component.processSteps();
  //   expect(component.nextStep).toHaveBeenCalledWith(4);
  // });

  // it('should call processSteps() to process step 4: place order', () => {
  //   mockCheckoutSelectors.getDeliveryAddress.next(mockDeliveryAddress);
  //   mockCheckoutSelectors.getSelectedCode.next(mockSelectedCode);
  //   mockCheckoutSelectors.getPaymentDetails.next(mockPaymentInfo);
  //   mockCheckoutSelectors.getOrderDetails.next(mockOrder);

  //   component.processSteps();
  //   expect(store.dispatch).toHaveBeenCalledWith(
  //     new fromRoot.Go({
  //       path: ['orderConfirmation']
  //     })
  //   );
  // });

  // it('should call setStep()', () => {
  //   component.setStep(2);
  //   expect(component.nextStep).toHaveBeenCalledWith(2);
  // });

  // it('should call nextStep()', () => {
  //   // next step is 3
  //   component.nextStep(3);
  //   // previous 2 steps are complete
  //   expect(component.navs[0].status.completed).toBeTruthy();
  //   expect(component.navs[1].status.completed).toBeTruthy();
  //   // step3 is active, and enabled, progress bar is on
  //   expect(component.navs[2].status.active).toBeTruthy();
  //   expect(component.navs[2].status.disabled).toBeFalsy();
  //   expect(component.navs[2].progressBar).toBeTruthy();
  //   // except step3, other steps are not active
  //   // step1, progress bar is on
  //   expect(component.navs[0].status.active).toBeFalsy();
  //   expect(component.navs[0].progressBar).toBeTruthy();
  //   // step2, progress bar is on
  //   expect(component.navs[1].status.active).toBeFalsy();
  //   expect(component.navs[1].progressBar).toBeTruthy();
  //   // step4, progress bar is off
  //   expect(component.navs[3].status.active).toBeFalsy();
  //   expect(component.navs[3].progressBar).toBeFalsy();
  // });

  // it('should call addAddress() with new created address', () => {
  //   mockCheckoutSelectors.getDeliveryAddress.next(mockAddress);

  //   component.addAddress({ address: mockAddress, newAddress: true });
  //   expect(service.createAndSetAddress).toHaveBeenCalledWith(mockAddress);
  // });

  // it('should call addAddress() with address selected from existing addresses', () => {
  //   mockCheckoutSelectors.getDeliveryAddress.next(mockAddress);

  //   component.addAddress({ address: mockAddress, newAddress: false });
  //   expect(service.createAndSetAddress).not.toHaveBeenCalledWith(mockAddress);
  //   expect(service.setDeliveryAddress).toHaveBeenCalledWith(mockAddress);
  // });

  // it('should call addAddress() with address already set to the cart, then go to next step direclty', () => {
  //   component.deliveryAddress = mockAddress;

  //   mockCheckoutSelectors.getDeliveryAddress.next(mockAddress);
  //   component.addAddress({ address: mockAddress, newAddress: false });

  //   expect(component.nextStep).toHaveBeenCalledWith(2);
  //   expect(service.setDeliveryAddress).not.toHaveBeenCalledWith(mockAddress);
  // });

  // it('should call setDeliveryMode()', () => {
  //   const deliveryMode: any = {
  //     deliveryModeId: 'testId'
  //   };
  //   mockCheckoutSelectors.getDeliveryAddress.next(mockAddress);

  //   component.setDeliveryMode(deliveryMode);
  //   expect(service.setDeliveryMode).toHaveBeenCalledWith(
  //     deliveryMode.deliveryModeId
  //   );
  // });

  // it('should call setDeliveryMode() with the delivery mode already set to cart, go to next step directly', () => {
  //   const deliveryMode: any = {
  //     deliveryModeId: 'testId'
  //   };
  //   component.shippingMethod = 'testId';
  //   spyOn(store, 'select').and.returnValues(of(deliveryMode), of([]));
  //   component.setDeliveryMode(deliveryMode);

  //   expect(component.nextStep).toHaveBeenCalledWith(3);
  //   expect(service.setDeliveryMode).not.toHaveBeenCalledWith(
  //     deliveryMode.deliveryModeId
  //   );
  // });

  // it('should call addPaymentInfo() with new created payment info', () => {
  //   spyOn(store, 'select').and.returnValues(
  //     of(mockPaymentDetails),
  //     of([]),
  //     of([]),
  //     of([])
  //   );

  //   component.deliveryAddress = mockAddress;
  //   component.addPaymentInfo({ payment: mockPaymentDetails, newPayment: true });
  //   expect(service.createPaymentDetails).toHaveBeenCalledWith(
  //     mockPaymentDetails
  //   );
  // });

  // it('should call addPaymentInfo() with paymenent selected from existing ones', () => {
  //   spyOn(store, 'select').and.returnValues(
  //     of(mockPaymentDetails),
  //     of([]),
  //     of([]),
  //     of([])
  //   );

  //   component.deliveryAddress = mockAddress;
  //   component.addPaymentInfo({
  //     payment: mockPaymentDetails,
  //     newPayment: false
  //   });
  //   expect(service.createPaymentDetails).not.toHaveBeenCalledWith(
  //     mockPaymentDetails
  //   );
  //   expect(service.setPaymentDetails).toHaveBeenCalledWith(mockPaymentDetails);
  // });

  // it('should call addPaymentInfo() with paymenent already set to cart, then go to next step direclty', () => {
  //   component.paymentDetails = mockPaymentDetails;
  //   spyOn(store, 'select').and.returnValues(
  //     of(mockPaymentDetails),
  //     of([]),
  //     of([]),
  //     of([])
  //   );

  //   component.deliveryAddress = mockAddress;
  //   component.addPaymentInfo({
  //     payment: mockPaymentDetails,
  //     newPayment: false
  //   });
  //   expect(component.nextStep).toHaveBeenCalledWith(4);
  //   expect(service.setPaymentDetails).not.toHaveBeenCalledWith(
  //     mockPaymentDetails
  //   );
  // });

  // it('should call placeOrder()', () => {
  //   const orderDetails = 'mockOrderDetails';
  //   spyOn(store, 'select').and.returnValues(of(orderDetails));

  //   component.placeOrder();
  //   expect(service.placeOrder).toHaveBeenCalled();
  // });

  // it('should call toggleTAndC(toggle)', () => {
  //   expect(component.tAndCToggler).toBeFalsy();
  //   component.toggleTAndC();
  //   expect(component.tAndCToggler).toBeTruthy();
  //   component.toggleTAndC();
  //   expect(component.tAndCToggler).toBeFalsy();
  // });
});
