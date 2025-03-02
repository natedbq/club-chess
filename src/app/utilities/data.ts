import data from 'src/fake-data/data.json'
import { ChessBoard } from '../chess-logic/chess-board';

export interface Game {
    studyId: string;
    title: string;
    opening: string;
    fen: string;
    fromWhitePerspective: boolean;
    whiteTurn: boolean;
}

export class Data {


    static save(game: Game, chessBoard: ChessBoard): void {        
        console.log(chessBoard.boardAsFEN, chessBoard.moveList[chessBoard.moveList.length - 1])
    } 

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