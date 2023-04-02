import { Component } from '@angular/core';
import { Keen } from './scene.component';

@Component({
    standalone: true,
    imports: [Keen],
    selector: 'postprocessing-root',
    template: `
        <postprocessing-keen />
    `,
})
export class AppComponent {}
