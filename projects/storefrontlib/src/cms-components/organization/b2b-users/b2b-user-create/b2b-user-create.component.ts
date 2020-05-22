import { Component } from '@angular/core';
import { RoutingService, B2BUserService, B2BUser } from '@spartacus/core';

@Component({
  selector: 'cx-b2b-user-create',
  templateUrl: './b2b-user-create.component.html',
})
export class B2BUserCreateComponent {
  constructor(
    protected b2bUserService: B2BUserService,
    protected routingService: RoutingService
  ) {}

  createB2BUser(b2bUser: B2BUser) {
    this.b2bUserService.create(b2bUser);
    this.routingService.go({
      cxRoute: 'userDetails',
      params: { code: b2bUser.uid },
    });
  }
}
