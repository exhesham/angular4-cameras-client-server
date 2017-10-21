import {Component} from 'angular2/core'
import { CameraService } from './cameras.service';


@Component({
    selector: 'cameras',
    template:`{{title}}:

            <ul>
                <li *ngFor="#camera of cameras">
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