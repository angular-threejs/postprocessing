import { Directive, inject, Input, OnChanges, OnInit, reflectComponentType, SimpleChanges, Type } from '@angular/core';
import { NgtAnyRecord, NgtRxStore, NgtStore, startWithUndefined } from 'angular-three';
import { BlendFunction, Effect } from 'postprocessing';
import { combineLatest, Observable } from 'rxjs';

@Directive()
export abstract class NgtpEffect<T extends Effect> extends NgtRxStore implements OnInit, OnChanges {
    @Input() set blendFunction(blendFunction: BlendFunction) {
        this.set({ blendFunction });
    }

    @Input() set opacity(opacity: number) {
        this.set({ opacity });
    }

    abstract get effectConstructor(): new (...args: any[]) => T;

    protected defaultBlendMode = BlendFunction.NORMAL;
    protected readonly store = inject(NgtStore);

    ngOnChanges(changes: SimpleChanges) {
        this.set((s) => ({
            ...s,
            ...simpleChangesToStateObject(changes, ['blendFunction', 'opacity']),
        }));
    }

    ngOnInit() {
        this.connect('effect', componentInputsToCombinedStream(this), (props) => {
            delete props['__ngt_dummy__'];
            delete props['effect'];
            return new this.effectConstructor(props);
        });
        this.configureBlendMode();
    }

    private configureBlendMode() {
        this.hold(
            combineLatest([
                this.select('effect'),
                this.select('blendFunction').pipe(startWithUndefined()),
                this.select('opacity').pipe(startWithUndefined()),
            ]),
            ([effect, blendFunction, opacity]) => {
                const invalidate = this.store.get('invalidate');
                effect.blendMode.blendFunction =
                    !blendFunction && blendFunction !== 0 ? this.defaultBlendMode : blendFunction;
                if (opacity !== undefined) effect.blendMode.opacity.value = opacity;
                invalidate();
            }
        );
    }
}

export function simpleChangesToStateObject(changes: SimpleChanges, keysToDelete: string[] = []) {
    for (const key of keysToDelete) {
        if (changes[key]) delete changes[key];
    }

    return Object.entries(changes).reduce((obj, [key, change]) => {
        obj[key] = change.currentValue;
        return obj;
    }, {} as NgtAnyRecord);
}

export function componentInputsToCombinedStream(
    component: NgtRxStore,
    filterFn: (input: { propName: string; templateName: string }) => boolean = () => true
): Observable<NgtAnyRecord> {
    const inputs =
        reflectComponentType(component.constructor as Type<any>)
            ?.inputs.filter(filterFn)
            .map((input) => input.propName) || [];

    return combineLatest(
        inputs.reduce((combined, input) => {
            let input$ = component.select(input);
            if (component.get(input) === undefined) {
                input$ = input$.pipe(startWithUndefined());
            }
            combined[input] = input$;
            return combined;
        }, {} as Record<string, Observable<any>>)
    );
}
