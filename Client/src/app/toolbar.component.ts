import {Component} from '@angular/core';

/**
 * @title Dynamic grid-list
 */
@Component({
  selector: 'under-sur-toolbar',
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button [matMenuTriggerFor]="menu">
        <mat-icon>more_vert</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
        <button mat-menu-item>
          <mat-icon>dialpad</mat-icon>
          <span>About</span>
        </button>
        <button mat-menu-item disabled>
          <mat-icon>voicemail</mat-icon>
          <span>Logout</span>
        </button>
        <button mat-menu-item>
          <mat-icon>notifications_off</mat-icon>
          <span>Record</span>
        </button>
      </mat-menu>
      
      
      <mat-icon class="example-icon">camera</mat-icon>
      <span> Under Surveillance</span>
  </mat-toolbar>
  `,
})
export class UnderSurToolbar {

}


/**  Copyright 2017 Google Inc. All Rights Reserved.
 Use of this source code is governed by an MIT-style license that
 can be found in the LICENSE file at http://angular.io/license */
