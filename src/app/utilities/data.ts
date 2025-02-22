import data from 'src/fake-data/data.json'
import { ChessBoard } from '../chess-logic/chess-board';

export interface Game {
    position: string[];
    title: string;
    opening: string;
    fromWhitePerspective: boolean;
    whiteTurn: boolean;
}

export class Data {

    static getData(): Game[] {
        
        return data.games;
    }

    static save(game: Game, chessBoard: ChessBoard): void {        
        const jsonString = JSON.stringify(chessBoard,null,2);
        
        console.log(jsonString);
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