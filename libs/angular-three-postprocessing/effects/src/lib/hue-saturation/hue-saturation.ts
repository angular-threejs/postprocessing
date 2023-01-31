import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgtArgs } from 'angular-three';
import { NgtpEffect } from 'angular-three-postprocessing';
import { HueSaturationEffect } from 'postprocessing';

@Component({
    selector: 'ngtp-hue-saturation',
    standalone: true,
    template: `
        <ngt-primitive *args="[get('effect')]" ngtCompound />
    `,
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    inputs: ['hue', 'saturation'],
})
export class NgtpHueSaturation extends NgtpEffect<HueSaturationEffect> {
    override get effectConstructor() {
        return HueSaturationEffect;
    }
}
