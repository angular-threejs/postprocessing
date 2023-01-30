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
        if (changes['opacity']) delete changes['opacity'];
        if (changes['blendFunction']) delete changes['blendFunction'];

        this.set((s) => ({
            ...s,
            ...Object.entries(changes).reduce((props, [key, change]) => {
                props[key] = change.currentValue;
                return props;
            }, {} as NgtAnyRecord),
        }));
    }

    ngOnInit() {
        const inputs = reflectComponentType(this.constructor as Type<any>)?.inputs.map((input) => input.propName) || [];
        this.connect(
            'effect',
            combineLatest(
                inputs.reduce((combined, input) => {
                    let input$ = this.select(input);
                    if (this.get(input) !== undefined) {
                        input$ = input$.pipe(startWithUndefined());
                    }
                    combined[input] = input$;
                    return combined;
                }, {} as Record<string, Observable<any>>)
            ),
            (props) => {
                delete props['__ngt_dummy__'];
                delete props['effect'];
                return new this.effectConstructor(props);
            }
        );
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
