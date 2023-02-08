import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { injectNgtRef, NgtArgs, NgtRxStore } from 'angular-three';
import {
    componentInputsToCombinedStream,
    NGTP_EFFECT_COMPOSER_API,
    simpleChangesToStateObject,
} from 'angular-three-postprocessing';
import { BlendFunction, SSAOEffect } from 'postprocessing';
import { combineLatest, map } from 'rxjs';

@Component({
    selector: 'ngtp-ssao',
    standalone: true,
    template: `
        <ngt-primitive *args="[get('effect')]" [ref]="ssaoRef" />
    `,
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    inputs: [
        'blendFunction',
        'distanceScaling',
        'depthAwareUpsampling',
        'normalDepthBuffer',
        'samples',
        'rings',
        'worldDistanceThreshold',
        'worldDistanceFalloff',
        'worldProximityThreshold',
        'worldProximityFalloff',
        'distanceThreshold',
        'distanceFalloff',
        'rangeThreshold',
        'rangeFalloff',
        'minRadiusScale',
        'luminanceInfluence',
        'radius',
        'intensity',
        'bias',
        'fade',
        'color',
        'resolutionScale',
        'resolutionX',
        'resolutionY',
        'width',
        'height',
    ],
})
export class NgtpSSAO extends NgtRxStore implements OnInit, OnChanges {
    private readonly effectComposerApi = inject(NGTP_EFFECT_COMPOSER_API);

    @Input() ssaoRef = injectNgtRef<SSAOEffect>();

    override initialize(): void {
        super.initialize();
        this.set({
            blendFunction: BlendFunction.MULTIPLY,
            samples: 30,
            rings: 4,
            distanceThreshold: 1.0,
            distanceFalloff: 0.0,
            rangeThreshold: 0.5,
            rangeFalloff: 0.1,
            luminanceInfluence: 0.9,
            radius: 20,
            scale: 0.5,
            bias: 0.5,
            intensity: 1.0,
            color: null!,
            depthAwareUpsampling: true,
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        this.set((s) => ({
            ...s,
            ...simpleChangesToStateObject(changes, ['ssaoRef']),
        }));
    }

    ngOnInit() {
        this.connect(
            'effect',
            combineLatest([
                this.effectComposerApi.select('entities'),
                this.effectComposerApi.select('activeCamera'),
                componentInputsToCombinedStream(this, (input) => input.propName !== 'ssaoRef'),
            ]).pipe(
                map(([[, normalPass, downSamplingPass], camera, props]) => {
                    const { resolutionScale } = this.effectComposerApi;

                    if (props['normalDepthBuffer'] === undefined) {
                        props['normalDepthBuffer'] = downSamplingPass ? downSamplingPass.texture : null;
                    }

                    if (props['resolutionScale'] === undefined) {
                        props['resolutionScale'] = resolutionScale ?? 1;
                    }

                    return new SSAOEffect(
                        camera,
                        normalPass && !downSamplingPass ? normalPass.texture : null,
                        props as ConstructorParameters<typeof SSAOEffect>[2]
                    );
                })
            )
        );
    }
}
