import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgtArgs } from 'angular-three';
import { NgtpEffect } from 'angular-three-postprocessing';
import { ColorDepthEffect } from 'postprocessing';

@Component({
    selector: 'ngtp-color-depth',
    standalone: true,
    template: `
        <ngt-primitive *args="[get('effect')]" ngtCompound />
    `,
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    inputs: ['bits'],
})
export class NgtpColorDepth extends NgtpEffect<ColorDepthEffect> {
    override get effectConstructor() {
        return ColorDepthEffect;
    }
}
