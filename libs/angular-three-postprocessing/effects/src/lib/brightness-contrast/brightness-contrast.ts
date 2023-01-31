import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgtArgs } from 'angular-three';
import { NgtpEffect } from 'angular-three-postprocessing';
import { BrightnessContrastEffect } from 'postprocessing';

@Component({
    selector: 'ngtp-brightness-contrast',
    standalone: true,
    template: `
        <ngt-primitive *args="[get('effect')]" ngtCompound />
    `,
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    inputs: ['brightness', 'contrast'],
})
export class NgtpBrightnessContrast extends NgtpEffect<BrightnessContrastEffect> {
    override get effectConstructor() {
        return BrightnessContrastEffect;
    }
}
