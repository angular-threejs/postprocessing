import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgtArgs } from 'angular-three';
import { NgtpEffect } from 'angular-three-postprocessing';
import { VignetteEffect } from 'postprocessing';

@Component({
    selector: 'ngtp-vignette',
    standalone: true,
    template: `
        <ngt-primitive *args="[get('effect')]" ngtCompound />
    `,
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    inputs: ['technique', 'eskil', 'offset', 'darkness'],
})
export class NgtpVignette extends NgtpEffect<VignetteEffect> {
    override get effectConstructor() {
        return VignetteEffect;
    }
}
