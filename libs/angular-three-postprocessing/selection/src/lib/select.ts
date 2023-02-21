import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, Input, OnInit } from '@angular/core';
import { extend, injectNgtRef, NgtRxStore } from 'angular-three';
import { combineLatest } from 'rxjs';
import { Group } from 'three';
import { NGTP_SELECTION_API } from './selection';

extend({ Group });

@Component({
    selector: 'ngtp-select',
    standalone: true,
    template: `
        <ngt-group ngtCompound [ref]="groupRef">
            <ng-content />
        </ngt-group>
    `,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NgtpSelect extends NgtRxStore implements OnInit {
    readonly groupRef = injectNgtRef<THREE.Group>();

    private readonly selectionApi = inject(NGTP_SELECTION_API);

    @Input() set enabled(enabled: boolean) {
        this.set({ enabled });
    }

    override initialize(): void {
        super.initialize();
        this.set({ enabled: false });
    }

    ngOnInit() {
        this.setSelectEffect();
    }

    private setSelectEffect() {
        this.effect(combineLatest([this.select('enabled'), this.groupRef.children$()]), ([enabled]) => {
            if (enabled) {
                let changed = false;
                const current: THREE.Object3D[] = [];
                this.groupRef.nativeElement.traverse((obj) => {
                    if (obj.type === 'Mesh') current.push(obj);
                    if (this.selectionApi.selected.indexOf(obj) === -1) changed = true;
                });
                if (changed) {
                    this.selectionApi.select((state) => ({ selected: [...state.selected, ...current] }));
                    return () => {
                        this.selectionApi.select((state) => ({
                            selected: state.selected.filter((selected) => !current.includes(selected)),
                        }));
                    };
                }
            }
        });
    }
}
