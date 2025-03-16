import { Move, Position } from "../../chess-logic/models";
import { StudyPointer } from "../study-navigation/study-navigation.component";

export class StudyEditor {
    studyPointer: StudyPointer;
    constructor(sp: StudyPointer){
        this.studyPointer = sp;
    }


    private isNextMove(move: Move): boolean{
        return false;
    }
}