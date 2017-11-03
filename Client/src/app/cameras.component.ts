import { Component } from '@angular/core';
import { CameraService } from './cameras.service';

@Component({
    selector: 'app-cameras',
    template:`      
    <mat-grid-list cols="2" rows="2" >
      <mat-grid-tile *ngFor="let camera of cameras"
        [style.background]="camera.color">
        <mat-grid-tile-header>
          <span mat-line> Camera {{camera.index}} - {{camera.name}} </span>
        </mat-grid-tile-header>
        {{camera.description}}
        <mat-grid-tile-footer>
          <button mat-button><mat-icon>camera</mat-icon>View</button>
          <button mat-button><mat-icon>camera</mat-icon>Record</button>
        </mat-grid-tile-footer>
      </mat-grid-tile>
      
    </mat-grid-list>


    `,
        providers:[CameraService]

})
export class CameraComponent{
    cameras;
    title = "available cameras"
    constructor(cameraService: CameraService){
        this.cameras = cameraService.getCameras()
    }
}
