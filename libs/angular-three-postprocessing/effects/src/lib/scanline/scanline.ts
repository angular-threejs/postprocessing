import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgtArgs } from 'angular-three';
import { NgtpEffect } from 'angular-three-postprocessing';
import { BlendFunction, ScanlineEffect } from 'postprocessing';

@Component({
    selector: 'ngtp-scanline',
    standalone: true,
    template: `
        <ngt-primitive *args="[get('effect')]" ngtCompound />
    `,
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    inputs: ['density'],
})
export class NgtpScanline extends NgtpEffect<ScanlineEffect> {
    override get effectConstructor() {
        return ScanlineEffect;
    }

    override defaultBlendMode: BlendFunction = BlendFunction.OVERLAY;
}
