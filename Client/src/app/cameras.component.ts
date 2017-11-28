import {Component, OnInit} from '@angular/core';
import {CameraService} from './cameras.service';

// to play a video - refer to https://stackoverflow.com/questions/40360174/playing-html-5-video-from-angular-2-typescript
@Component({
  selector: 'app-cameras',
  template: `
    <mat-grid-list cols="2" rows="2" >
      <mat-grid-tile *ngFor="let camera of cameras"
                     [style.background]="camera.color">
        <mat-grid-tile-header>
          <span mat-line> Camera {{camera.index}} - {{camera.name}} </span>
        </mat-grid-tile-header>
        <div class="video">
          <video controls (click)="toggleVideo()" #videoPlayer>
            <source src="{{camera.videoSource}}" type="video/mp4" />
            Browser not supported
          </video>
        </div>
        
        {{camera.description}}
        <mat-grid-tile-footer>
          <button mat-button><mat-icon>camera</mat-icon>View</button>
          <button mat-button><mat-icon>camera</mat-icon>Record</button>

  `,
  providers: [CameraService]

})
export class CameraComponent implements OnInit {
  cameras;
  title = "available cameras"

  constructor(private cameraService: CameraService) {

  }

  ngOnInit(): void {
    this.cameraService.getCameras().subscribe(data => {
      console.log('imported response:', data)
      this.cameras = data;
    })
  }
}
\
