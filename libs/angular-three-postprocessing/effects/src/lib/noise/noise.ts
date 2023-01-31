import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgtArgs } from 'angular-three';
import { NgtpEffect } from 'angular-three-postprocessing';
import { BlendFunction, NoiseEffect } from 'postprocessing';

@Component({
    selector: 'ngtp-noise',
    standalone: true,
    template: `
        <ngt-primitive *args="[get('effect')]" ngtCompound />
    `,
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    inputs: ['premultiply'],
})
export class NgtpNoise extends NgtpEffect<NoiseEffect> {
    override get effectConstructor() {
        return NoiseEffect;
    }

    override defaultBlendMode: BlendFunction = BlendFunction.COLOR_DODGE;
}
