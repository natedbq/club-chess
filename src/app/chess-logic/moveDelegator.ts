import { Queue } from "./models";

export class MoveDelegator {

    private static run: boolean = false;
    private static ready: boolean = false;

    private static queue: Queue<MoveDelegation[]> = new Queue();

    public static addDelegations(d: MoveDelegation | MoveDelegation[]): void {
        if(Array.isArray(d)){
            this.queue.enqueue(d);
        }else{
            this.queue.enqueue([d]);
        }
    }

    
    public static start = (): void => {
        this.run = true;
        this.consume();
    }

    public static stop = (): void => {
        this.run = false;
        this.ready = false;
    }

    public static clear = (): void => {
        this.queue = new Queue();
    }

    private static consume = (): void => {
        if(this.ready){
            this.ready = this.delegate();
        }else{
            this.ready = true;
        }
        if(this.run){
            setTimeout(() => {
                this.consume();
            }, 500);
        }
    }

    private static delegate(): boolean {
        let delegations = this.queue.dequeue();

        if(!delegations){
            return false;
        }else{
            let floor = 0;
            let options = delegations.filter(d => d.weight > 0)
                .map((o) => {
    
                    let option = <Option>{
                        low: floor,
                        high: floor + o.weight - 1,
                        delgation: o
                    }
    
                    floor = floor + o.weight;
    
                    return option;
                });
            let pick = Math.floor(Math.random() * floor);
    
            let c = options.map(o => {
                return 0;
            });

            for(let i = 0; i < 1000; i++){
                let choose = Math.floor(Math.random() * floor);
                options.forEach((o,i) => {
                    if(choose >= o.low && choose <= o.high){
                        c[i]++;
                    }
                })
            }
            console.log(JSON.stringify(options.map(o => o.high - o.low)), JSON.stringify(c));
            
            options.forEach(o => {
                if(pick >= o.low && pick <= o.high){
                    o.delgation.delegate();
                }
            })
            return true;
        }
    }
}

interface Option {
    low: number;
    high: number;
    delgation: MoveDelegation;
}

export class MoveDelegation {
    public delegate: () => void = () => {};
    public weight: number = 1;
    public arbiter: string = 'none'

    constructor(delegate: () => void, weight: number = 1, arbiter: string = 'none'){
        this.delegate = delegate;
        this.weight = weight;
        this.arbiter = arbiter
    }
}

export class DelegationSet {
    public delegations: MoveDelegation[] = [];
}