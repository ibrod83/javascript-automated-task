export function createDeferred<T = void | undefined>(): Deferred<T> {
    return new Deferred<T>();
  }
  
  export class Deferred<T = void | undefined> {
    resolve!: (value: T | PromiseLike<T>) => void;
    reject!: (reason?: any) => void;
    promise: Promise<T>;
  
    constructor() {
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    }
  }