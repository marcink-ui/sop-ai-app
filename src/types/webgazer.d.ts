declare module 'webgazer' {
    interface GazeData {
        x: number;
        y: number;
    }

    interface WebGazer {
        setRegression(type: string): WebGazer;
        setTracker(type: string): WebGazer;
        showVideoPreview(show: boolean): WebGazer;
        showPredictionPoints(show: boolean): WebGazer;
        setGazeListener(callback: (data: GazeData | null, elapsedTime?: number) => void): WebGazer;
        begin(): Promise<WebGazer>;
        end(): void;
        pause(): void;
        resume(): void;
        clearData(): void;
    }

    const webgazer: WebGazer;
    export default webgazer;
}
