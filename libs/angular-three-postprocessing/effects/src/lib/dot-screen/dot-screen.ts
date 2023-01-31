import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgtArgs } from 'angular-three';
import { NgtpEffect } from 'angular-three-postprocessing';
import { DotScreenEffect } from 'postprocessing';

@Component({
    selector: 'ngtp-dot-screen',
    standalone: true,
    template: `
        <ngt-primitive *args="[get('effect')]" ngtCompound />
    `,
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    inputs: ['angle', 'scale'],
})
export class NgtpDotScreen extends NgtpEffect<DotScreenEffect> {
    override get effectConstructor() {
        return DotScreenEffect;
    }
}
