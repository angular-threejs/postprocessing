import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgtArgs } from 'angular-three';
import { NgtpEffect } from 'angular-three-postprocessing';
import { DepthEffect } from 'postprocessing';

@Component({
    selector: 'ngtp-depth',
    standalone: true,
    template: `
        <ngt-primitive *args="[get('effect')]" ngtCompound />
    `,
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    inputs: ['inverted'],
})
export class NgtpDepth extends NgtpEffect<DepthEffect> {
    override get effectConstructor() {
        return DepthEffect;
    }
}
