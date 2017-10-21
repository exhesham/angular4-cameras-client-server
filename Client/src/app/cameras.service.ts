import { Injectable } from '@angular/core';

@Injectable()
export class CameraService {
    getCameras() : string[] {
        return ["Camera1", "Camera2", "Camera3"];
    }
}