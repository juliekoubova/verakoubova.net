import { Controller } from 'stimulus';
export declare abstract class IntersectorController extends Controller {
    private intersectionObserver?;
    threshold?: number | number[];
    abstract intersect(entries: IntersectionObserverEntry[]): void;
    connect(): void;
    disconnect(): void;
    observe(target: Element): void;
    unobserve(target: Element): void;
}
