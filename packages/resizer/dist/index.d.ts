import { Controller } from "stimulus";
export declare abstract class ResizerController extends Controller {
    private readonly handler;
    connect(): void;
    disconnect(): void;
    abstract resized(): void;
}
