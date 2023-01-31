import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { injectNgtRef, NgtArgs, NgtRxStore, NgtStore, startWithUndefined } from 'angular-three';
import { componentInputsToCombinedStream, simpleChangesToStateObject } from 'angular-three-postprocessing';
import { LUT3DEffect } from 'postprocessing';
import { combineLatest, map } from 'rxjs';

@Component({
    selector: 'ngtp-lut',
    standalone: true,
    template: `
        <ngt-primitive *args="[get('effect')]" [ref]="lutRef" />
    `,
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    inputs: ['blendFunction', 'tetrahedralInterpolation'],
})
export class NgtpLUT extends NgtRxStore implements OnInit, OnChanges {
    private readonly store = inject(NgtStore);

    @Input() lutRef = injectNgtRef<LUT3DEffect>();

    @Input() set lut(lut: THREE.Texture) {
        this.set({ lut });
    }

    ngOnChanges(changes: SimpleChanges) {
        this.set((s) => ({ ...s, ...simpleChangesToStateObject(changes, ['lutRef', 'lut']) }));
    }

    ngOnInit() {
        this.connect(
            'effect',
            combineLatest([
                this.select('lut'),
                componentInputsToCombinedStream(
                    this,
                    (input) => input.propName !== 'lutRef' && input.propName !== 'lut'
                ),
            ]).pipe(map(([lut, props]) => new LUT3DEffect(lut, props)))
        );

        this.hold(
            combineLatest([
                this.select('lut'),
                this.select('effect'),
                this.select('tetrahedralInterpolation').pipe(startWithUndefined()),
            ]),
            ([lut, effect, tetrahedralInterpolation]) => {
                const invalidate = this.store.get('invalidate');
                if (lut) effect.lut = lut;
                if (tetrahedralInterpolation) effect.tetrahedralInterpolation = tetrahedralInterpolation;
                invalidate();
            }
        );
    }
}
