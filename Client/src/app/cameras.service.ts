import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable()
export class CameraService  implements OnInit {
  private available_cameras: any;


  // Inject HttpClient into your component or service.
  constructor(private http: HttpClient) {
    this.getCameras()
  }

  ngOnInit(): void {
    /*
    returns the available cameras. the returned result looks like the next format:
    [{index: 1, name: 'Outside south', description: 'street view', color: 'lightblue', rows: 1, cols: 1},
      {index: 2, name: 'Outside north', description: 's street view ', color: 'lightgreen', rows: 1, cols: 2},
      {index: 3, name: 'Outside east', description: 'street view 2', color: 'lightpink', rows: 2, cols: 1},
      {index: 4, name: 'Outside south 1', description: 'street view 3', color: '#DDBDF1', rows: 2, cols: 1},
    ];

     */
    //

  }
  getCameras(): any {
    console.log('sending request to get the  data')
    return this.http.get('/api/cameras/all')
  }
}
