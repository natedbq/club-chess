import { ChessBoard } from '../chess-logic/chess-board';


export class Data {

 

    static defaultGame(): string[] {
        return ["r","n","b","q","k","b","n","r",
                "p","p","p","p","p","p","p","p",
                "o","o","o","o","o","o","o","o",
                "o","o","o","o","o","o","o","o",
                "o","o","o","o","o","o","o","o",
                "o","o","o","o","o","o","o","o",
                "P","P","P","P","P","P","P","P",
                "R","N","B","Q","K","B","N","R"];
    }
}