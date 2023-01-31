import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgtArgs } from 'angular-three';
import { NgtpEffect } from 'angular-three-postprocessing';
import { BlendFunction, BloomEffect } from 'postprocessing';

@Component({
    selector: 'ngtp-bloom',
    standalone: true,
    template: `
        <ngt-primitive *args="[get('effect')]" ngtCompound />
    `,
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    inputs: [
        'mipmapBlur',
        'luminanceThreshold',
        'luminanceSmoothing',
        'intensity',
        'resolutionScale',
        'resolutionX',
        'resolutionY',
        'width',
        'height',
        'kernelSize',
    ],
})
export class NgtpBloom extends NgtpEffect<BloomEffect> {
    override get effectConstructor() {
        return BloomEffect;
    }

    override defaultBlendMode: BlendFunction = BlendFunction.ADD;
}
