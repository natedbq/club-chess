export class FIFOCache {
    private cache: Map<string, any>;

    constructor(private maxSize: number){
        this.cache = new Map();
    }

    get(key: string): any | undefined {
        return this.cache.get(key);
    }

    put(key: string, value: any): void {
        if(this.cache.has(key)){
            this.cache.delete(key);
        }
        this.cache.set(key,value);
        if(this.cache.size > this.maxSize){
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    size(): number {
        return this.cache.size;
    }

    keys(): IterableIterator<string> {
        return this.cache.keys();
    }

    values(): IterableIterator<any> {
        return this.cache.values();
    }
}