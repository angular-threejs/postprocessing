import { bootstrapApplication } from '@angular/platform-browser';
import { extend } from 'angular-three';
import * as THREE from 'three';
import { AppComponent } from './app/app.component';

extend(THREE);

bootstrapApplication(AppComponent, {
    providers: [],
}).catch((err) => console.error(err));
