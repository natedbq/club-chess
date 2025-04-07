export class MoveDelegator {
    protected static delegations: MoveDelegation[] = [];
    protected static disqualifiers: ((data: any) => boolean)[] = [];

    public static addDelegation(d: MoveDelegation): void {
        this.delegations.push(d);
    }

    public static addDisqualifier(func: (data: any) => boolean): void {
        this.disqualifiers.push(func);
    }

    public static clearDelegations(from: string = 'all'): void {
        if(from == 'all'){
            this.delegations = [];
        }else{
            this.delegations = this.delegations.filter(d => d.arbiter != from);
        }
    }

    public static delegate(data: any): void {
        if(this.disqualifiers.some(d => d(data))){
            return;
        }
        let floor = 0;
        let options = this.delegations.filter(d => d.weight > 0 && d.conditional(data))
            .map((o) => {

                let option = <Option>{
                    low: floor,
                    high: floor + o.weight,
                    delgation: o
                }

                floor = floor + o.weight + 1;

                return option;
            });
        let pick = Math.floor(Math.random() * floor);
        options.forEach(o => {
            if(pick >= o.low && pick <= o.high){
                setTimeout(() => {
                    o.delgation.delegate(data);
                  }, 500);
                return;
            }
        })
    }
}

interface Option {
    low: number;
    high: number;
    delgation: MoveDelegation;
}

export class MoveDelegation {
    public conditional: ((data: any) => boolean) = () => false;
    public delegate: (data: any) => void = () => {};
    public weight: number = 1;
    public arbiter: string = 'none'

    constructor(conditional: ((data: any) => boolean), delegate: (data: any) => void, weight: number = 1, arbiter: string = 'none'){
        this.conditional = conditional;
        this.delegate = delegate;
        this.weight = weight;
        this.arbiter = arbiter
    }
}