import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgtArgs } from 'angular-three';
import { NgtpEffect } from 'angular-three-postprocessing';
import { SepiaEffect } from 'postprocessing';

@Component({
    selector: 'ngtp-sepia',
    standalone: true,
    template: `
        <ngt-primitive *args="[get('effect')]" ngtCompound />
    `,
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    inputs: ['intensity'],
})
export class NgtpSepia extends NgtpEffect<SepiaEffect> {
    override get effectConstructor() {
        return SepiaEffect;
    }
}
