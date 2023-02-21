import { Component, InjectionToken, Input } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { NgtRxStore } from 'angular-three';

export interface NgtpSelectionAPI {
    selected: THREE.Object3D[];
    select: RxState<{ selected: THREE.Object3D[] }>['set'];
    enabled: boolean;
}

export const NGTP_SELECTION_API = new InjectionToken<NgtpSelectionAPI>('NgtpSelection API');
function ngtpSelectionApiFactory(selection: NgtpSelection) {
    const api: NgtpSelectionAPI = {
        get selected() {
            return selection.get('selected');
        },
        select: selection.set.bind(selection),
        get enabled() {
            return selection.get('enabled');
        },
    };
    return api;
}

@Component({
    selector: 'ngtp-selection',
    standalone: true,
    template: `
        <ng-content />
    `,
    providers: [{ provide: NGTP_SELECTION_API, useFactory: ngtpSelectionApiFactory, deps: [NgtpSelection] }],
})
export class NgtpSelection extends NgtRxStore {
    @Input() set enabled(enabled: boolean) {
        this.set({ enabled });
    }

    override initialize(): void {
        super.initialize();
        this.set({ selected: [], enabled: true });
    }
}
