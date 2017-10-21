import {Component} from 'angular2/core';
import {CameraComponent} from './cameras.component'

@Component({
    selector: 'my-app',
    template: `
            <h1>USR</h1>
            <cameras></cameras>
            `,
    directives: [CameraComponent]
})
export class AppComponent { }