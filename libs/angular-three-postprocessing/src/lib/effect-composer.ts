import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, InjectionToken, Input, OnInit } from '@angular/core';
import { RxActionFactory } from '@rx-angular/state/actions';
import { extend, getLocalState, injectNgtRef, NgtRxStore, NgtStore, startWithUndefined } from 'angular-three';
import { DepthDownsamplingPass, EffectComposer, EffectPass, NormalPass, RenderPass } from 'postprocessing';
import { combineLatest, map } from 'rxjs';
import * as THREE from 'three';
import { Group } from 'three';
import { isWebGL2Available } from 'three-stdlib';

extend({ Group });

export interface NgtpEffectComposerApi {
    composer: EffectComposer;
    normalPass: NormalPass | null;
    depthPass: DepthDownsamplingPass | null;
    scene: THREE.Scene;
    camera: THREE.Camera;
    resolutionScale?: number;
    select: NgtpEffectComposer['select'];
    get: NgtpEffectComposer['get'];
}

export const NGTP_EFFECT_COMPOSER_API = new InjectionToken<NgtpEffectComposerApi>('NgtpEffectComposer API');

function effectComposerApiFactory(composer: NgtpEffectComposer) {
    const api = {} as NgtpEffectComposerApi;

    Object.defineProperties(api, {
        composer: { get: () => composer.get('entities')[0] },
        normalPass: { get: () => composer.get('entities')[1] },
        downSamplingPass: { get: () => composer.get('entities')[2] },
        resolutionScale: { get: () => composer.get('resolutionScale') },
        scene: { get: () => composer.get('activeScene') },
        camera: { get: () => composer.get('activeCamera') },
        select: { get: () => composer.select.bind(composer) },
        get: { get: () => composer.get.bind(composer) },
    });

    return api;
}

@Component({
    selector: 'ngtp-effect-composer',
    standalone: true,
    template: `
        <ngt-group [ref]="composerRef">
            <ng-content />
        </ngt-group>
    `,
    providers: [
        { provide: NGTP_EFFECT_COMPOSER_API, useFactory: effectComposerApiFactory, deps: [NgtpEffectComposer] },
        RxActionFactory,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NgtpEffectComposer extends NgtRxStore implements OnInit {
    @Input() composerRef = injectNgtRef<Group>();

    @Input() set enabled(enabled: boolean) {
        this.set({ enabled });
    }

    @Input() set depthBuffer(depthBuffer: boolean) {
        this.set({ depthBuffer });
    }

    @Input() set disableNormalPass(disableNormalPass: boolean) {
        this.set({ disableNormalPass });
    }

    @Input() set stencilBuffer(stencilBuffer: boolean) {
        this.set({ stencilBuffer });
    }

    @Input() set autoClear(autoClear: boolean) {
        this.set({ autoClear });
    }

    @Input() set resolutionScale(resolutionScale: number) {
        this.set({ resolutionScale });
    }

    @Input() set multisampling(multisampling: number) {
        this.set({ multisampling });
    }

    @Input() set frameBufferType(frameBufferType: THREE.TextureDataType) {
        this.set({ frameBufferType });
    }

    @Input() set renderPriority(renderPriority: number) {
        this.set({ renderPriority });
    }

    @Input() set camera(camera: THREE.Camera) {
        this.set({ camera });
    }

    @Input() set scene(scene: THREE.Scene) {
        this.set({ scene });
    }

    override initialize(): void {
        super.initialize();
        this.set({
            enabled: true,
            renderPriority: 1,
            autoClear: true,
            multisampling: 0,
            frameBufferType: THREE.HalfFloatType,
        });
    }

    private readonly store = inject(NgtStore);
    private readonly actions = inject(RxActionFactory<{ setBeforeRender: void }>).create();

    ngOnInit() {
        this.connect(
            'activeScene',
            combineLatest([this.store.select('scene'), this.select('scene').pipe(startWithUndefined())]).pipe(
                map(([defaultScene, scene]) => scene || defaultScene)
            )
        );

        this.connect(
            'activeCamera',
            combineLatest([this.store.select('camera'), this.select('camera').pipe(startWithUndefined())]).pipe(
                map(([defaultCamera, camera]) => camera || defaultCamera)
            )
        );

        this.connect(
            'entities',
            combineLatest([
                this.store.select('gl'),
                this.select('activeScene'),
                this.select('activeCamera'),
                this.select('multisampling'),
                this.select('frameBufferType'),
                this.select('depthBuffer').pipe(startWithUndefined()),
                this.select('stencilBuffer').pipe(startWithUndefined()),
                this.select('disableNormalPass').pipe(startWithUndefined()),
                this.select('resolutionScale').pipe(startWithUndefined()),
            ]).pipe(
                map(
                    ([
                        gl,
                        scene,
                        camera,
                        multisampling,
                        frameBufferType,
                        depthBuffer,
                        stencilBuffer,
                        disableNormalPass,
                        resolutionScale,
                    ]) => {
                        const webGL2Available = isWebGL2Available();
                        // Initialize composer
                        const effectComposer = new EffectComposer(gl, {
                            depthBuffer,
                            stencilBuffer,
                            multisampling: multisampling > 0 && webGL2Available ? multisampling : 0,
                            frameBufferType,
                        });

                        // Add render pass
                        effectComposer.addPass(new RenderPass(scene, camera));

                        // Create normal pass
                        let downSamplingPass = null;
                        let normalPass = null;
                        if (!disableNormalPass) {
                            normalPass = new NormalPass(scene, camera);
                            normalPass.enabled = false;
                            effectComposer.addPass(normalPass);
                            if (resolutionScale !== undefined && webGL2Available) {
                                downSamplingPass = new DepthDownsamplingPass({
                                    normalBuffer: normalPass.texture,
                                    resolutionScale,
                                });
                                downSamplingPass.enabled = false;
                                effectComposer.addPass(downSamplingPass);
                            }
                        }

                        return [effectComposer, normalPass, downSamplingPass];
                    }
                )
            )
        );

        this.setComposerSize();
        this.setEffectPassed();
        this.setBeforeRender();
    }

    private setComposerSize() {
        this.hold(
            combineLatest([this.select('entities'), this.store.select('size')]),
            ([[composer], size]) => void (composer as EffectComposer).setSize(size.width, size.height)
        );
    }

    private setEffectPassed() {
        this.effect(
            combineLatest([
                this.select('entities'),
                this.select('activeCamera'),
                this.composerRef.children$('nonObjects'),
            ]),
            ([[composer, normalPass, downSamplingPass], camera, effects]) => {
                let effectPass: EffectPass;
                if (
                    this.composerRef.nativeElement &&
                    Object.keys(getLocalState(this.composerRef.nativeElement)).length &&
                    composer
                ) {
                    effectPass = new EffectPass(camera, ...effects);
                    effectPass.renderToScreen = true;
                    composer.addPass(effectPass);
                    if (normalPass) normalPass.enabled = true;
                    if (downSamplingPass) downSamplingPass.enabled = true;
                }

                return () => {
                    if (effectPass) composer?.removePass(effectPass);
                    if (normalPass) normalPass.enabled = false;
                    if (downSamplingPass) downSamplingPass.enabled = false;
                };
            }
        );
    }

    private setBeforeRender() {
        const renderPriority = this.get('renderPriority');
        const enabled = this.get('enabled');
        this.effect(this.actions.setBeforeRender$, () =>
            this.store.get('internal').subscribe(
                ({ delta }) => {
                    const [composer] = this.get('entities') || [];
                    const enabled = this.get('enabled');
                    const autoClear = this.get('autoClear');
                    const gl = this.store.get('gl');
                    const size = this.store.get('size');
                    const camera = this.store.get('camera');
                    if (composer && enabled) {
                        if (!gl.xr.isPresenting) {
                            gl.autoClear = autoClear;
                            composer.render(delta);
                            return;
                        }

                        // manually handle XR
                        gl.xr.enabled = false;
                        // update camera with XRPose
                        gl.xr.updateCamera(camera as THREE.PerspectiveCamera);

                        // render stereo cameras
                        const { cameras } = gl.xr.getCamera();
                        cameras.forEach(({ viewport, matrixWorld, projectionMatrix }) => {
                            gl.setViewport(viewport);
                            camera.position.setFromMatrixPosition(matrixWorld);
                            camera.projectionMatrix.copy(projectionMatrix);

                            composer.render(delta);
                        });

                        // reset
                        gl.setViewport(0, 0, size.width, size.height);
                        gl.xr.updateCamera(camera as THREE.PerspectiveCamera);
                        gl.xr.enabled = true;
                    }
                },
                enabled ? renderPriority : 0
            )
        );
        this.actions.setBeforeRender();
    }
}
