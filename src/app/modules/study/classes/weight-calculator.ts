import { Position } from "../../../chess-logic/models";
import { LichessService } from "../../../services/lichess.service";

export class WeightCalculator {
    public static setWeight(node: Position) 
    {
        this.setWeightRec(new Date(node.lastStudied ?? '') ?? new Date(), node);        
    }

    private static setWeightRec(oldest: Date, node: Position): Components{
        let nodeDate = new Date(node.lastStudied ?? '');
        oldest = oldest.getTime() > nodeDate.getTime() ? nodeDate : oldest;

        let components = node.positions.map(p => this.setWeightRec(oldest, p));
        let mistakes = 0;
        components.forEach(c => {
            let nodeDate = new Date(node.lastStudied ?? '');
            oldest = oldest.getTime() > c.oldest.getTime() ? nodeDate : oldest;
            mistakes += c.mistakes;
        })

        //TODO: for now, percent is set 0 and the calculation is delegated to study copmonent
        //  reason - lichess explorer only allows so many requests in a small amount of time, 
        //      putting that calculation here will require some load time and optimization,
        //  actually - lets try it and see what happens



        return {oldest, mistakes, percent: 0};
    }
}

interface Components {
    oldest: Date;
    mistakes: number;
    percent: number;
}