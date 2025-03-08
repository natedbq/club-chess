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
        }else{
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
        }else{
        }
    }

    private addContinuationToPosition(position: Position, move: Move){
    }
}