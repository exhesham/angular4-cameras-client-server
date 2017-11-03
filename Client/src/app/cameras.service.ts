import { Injectable } from '@angular/core';

@Injectable()
export class CameraService {
    getCameras() : [{}] {
        return [{index: 1, name: 'Outside south', description: 'street view', color: 'lightblue', rows: 1, cols:1},
          {index: 2, name: 'Outside north', description: 's street view ', color: 'lightgreen', rows: 1, cols:2},
          {index: 3, name: 'Outside north 2', description: 'street view 2', color: 'lightpink', rows: 2, cols:1},
          {index: 4, name: 'Outside south 1', description: 'street view 3', color: '#DDBDF1', rows: 2, cols:1},
          ];
    }
}
