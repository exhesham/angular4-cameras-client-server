import { Component } from '@angular/core';
import { CameraService } from './cameras.service';
import {MatButtonModule, MatCheckboxModule} from '@angular/material';

@Component({
    selector: 'app-cameras',
    template:`{{title}}:

            <ul>
                <li *ngFor="let camera of cameras">
                        {{ camera }}
                </li>
            </ul>
            
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