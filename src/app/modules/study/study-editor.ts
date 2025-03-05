import { Continuation, Move, Position } from "../../chess-logic/models";
import { StudyPointer } from "../study-navigation/study-navigation.component";

export class StudyEditor {
    studyPointer: StudyPointer;
    constructor(sp: StudyPointer){
        this.studyPointer = sp;
    }

    public addMove(move: Move){
        let pointer = this.studyPointer.peek();
        if(!this.isNextMove(move)){
            console.log('is not next move');
        }else{
            console.log('is next move');
            if(pointer instanceof Continuation){
                this.addToContinuation(pointer, move);
            }
            if(pointer instanceof Position){
                this.addContinuationToPosition(pointer, move)
            }
        }
    }

    private isNextMove(move: Move): boolean{
        return false;
    }

    private addToContinuation(continuation: Continuation, move: Move){
        let index = this.studyPointer.index;
        if(index == continuation.movesToPosition.length - 1){
            console.log('maxed', continuation.movesToPosition[index].name, continuation.movesToPosition[continuation.movesToPosition.length - 1].name);
        }else{
            console.log(index, JSON.stringify(continuation.movesToPosition.map(m => m.name)), continuation.movesToPosition[index].name);
        }
    }

    private addContinuationToPosition(position: Position, move: Move){
        console.log('to pos');
    }
}