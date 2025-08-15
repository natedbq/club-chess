import { columns } from "../modules/chess-board/models";
import { ChessBoard } from "./chess-board";
import { CastleState, Color, FENChar, LastMove } from "./models";
import { Bishop } from "./pieces/bishop";
import { King } from "./pieces/king";
import { Knight } from "./pieces/knight";
import { Pawn } from "./pieces/pawn";
import { Piece } from "./pieces/piece";
import { Queen } from "./pieces/queen";
import { Rook } from "./pieces/rook";

export class FENConverter {
    public static readonly initalPosition: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    public convertBoardToFEN(
        board: (Piece | null)[][],
        playerColor: Color,
        lastMove: LastMove | undefined,
        fiftyMoveRuleCounter: number,
        numberOfFullMoves: number,
        castleState: CastleState
    ): string {
        let FEN: string = "";

        for (let i = 7; i >= 0; i--) {
            let FENRow: string = "";
            let consecutiveEmptySquaresCounter = 0;

            for (const piece of board[i]) {
                if (!piece) {
                    consecutiveEmptySquaresCounter++;
                    continue;
                }

                if (consecutiveEmptySquaresCounter !== 0)
                    FENRow += String(consecutiveEmptySquaresCounter);

                consecutiveEmptySquaresCounter = 0;
                FENRow += piece.FENChar;
            }

            if (consecutiveEmptySquaresCounter !== 0)
                FENRow += String(consecutiveEmptySquaresCounter);

            FEN += (i === 0) ? FENRow : FENRow + "/";
        }

        let castleStateFEN: string = '';
        castleStateFEN += castleState.whiteKingSide ? 'K' : '';  
        castleStateFEN += castleState.whiteQueenSide ? 'Q' : '';  
        castleStateFEN += castleState.blackKingSide ? 'k' : '';  
        castleStateFEN += castleState.blackQueenSide ? 'q' : '';      

        castleStateFEN = castleStateFEN == '' ? '-' : castleStateFEN;

        const player: string = playerColor === Color.White ? "w" : "b";
        FEN += " " + player;
        //FEN += " " + this.castlingAvailability(board);
        FEN += " " + castleStateFEN
        FEN += " " + this.enPassantPosibility(lastMove, playerColor);
        FEN += " " + fiftyMoveRuleCounter * 2;
        FEN += " " + numberOfFullMoves;
        return FEN;
    }

    public static getPlayer(fen: string): Color{
        return fen.split(' ')[1] == 'w' ? Color.White : Color.Black;
    }

    private castlingAvailability(board: (Piece | null)[][]): string {
        const castlingPossibilities = (color: Color): string => {
            let castlingAvailability: string = "";

            const kingPositionX: number = color === Color.White ? 0 : 7;
            const king: Piece | null = board[kingPositionX][4];

            if (king instanceof King && !king.hasMoved) {
                const rookPositionX: number = kingPositionX;
                const kingSideRook = board[rookPositionX][7];
                const queenSideRook = board[rookPositionX][0];

                if (kingSideRook instanceof Rook && !kingSideRook.hasMoved)
                    castlingAvailability += "k";

                if (queenSideRook instanceof Rook && !queenSideRook.hasMoved)
                    castlingAvailability += "q";

                if (color === Color.White)
                    castlingAvailability = castlingAvailability.toUpperCase();
            }
            return castlingAvailability;
        }

        const castlingAvailability: string = castlingPossibilities(Color.White) + castlingPossibilities(Color.Black);
        return castlingAvailability !== "" ? castlingAvailability : "-";
    }

    private enPassantPosibility(lastMove: LastMove | undefined, color: Color): string {
        if (!lastMove) return "-";
        const { piece, currX: newX, prevX, prevY } = lastMove;

        if (piece instanceof Pawn && Math.abs(newX - prevX) === 2) {
            const row: number = color === Color.White ? 6 : 3;
            return columns[prevY] + String(row);
        }
        return "-";
    }

    public fenToBoard(fen: string){
        let chessBoard: (Piece | null)[][] =[
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null]
        ];
        let row = 7;
        
        let parts = fen.split(" ");
        

        let position = parts[0].split('/');

        [...position].forEach((r, i) => {
            let piece: Piece | null = null;
            let col = 0;
            [...r].forEach(c => {
                piece = null;
                switch(c){
                    case "p":
                        piece = new Pawn(Color.Black);
                        break;
                    case "n":
                        piece = new Knight(Color.Black);
                        break;
                    case "b":
                        piece = new Bishop(Color.Black);
                        break;
                    case "r":
                        piece = new Rook(Color.Black);
                        break;
                    case "q":
                        piece = new Queen(Color.Black);
                        break;
                    case "k":
                        piece = new King(Color.Black);
                        break;
                    case "P":
                        piece = new Pawn(Color.White);
                        break;
                    case "N":
                        piece = new Knight(Color.White);
                        break;
                    case "B":
                        piece = new Bishop(Color.White);
                        break;
                    case "R":
                        piece = new Rook(Color.White);
                        break;
                    case "Q":
                        piece = new Queen(Color.White);
                        break;
                    case "K":
                        piece = new King(Color.White);
                        break;

                }
                if(/\d+/.test(c)){
                    let n = Number(c);
                    for(let x = 0; x < n; x++){
                        chessBoard[row][col] = piece;
                        col++;
                    }
                }else{
                    chessBoard[row][col] = piece;
                    col++;
                }
                if(piece instanceof Pawn){
                    if(piece.color == Color.White){
                        if(row != 1){
                            piece.hasMoved = true;
                        }
                    }else{
                        if(row != 6){
                            piece.hasMoved = true;
                        }
                    }
                }
            });
            row--;
        });
    }
}

export class BoardUtility {
    public static DateNow(){
        const now = new Date();
        return new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            now.getUTCHours(),
            now.getUTCMinutes(),
            now.getUTCSeconds()
        ));
    }

    public static pieceOn(coord: string, fen: string): string | null { 
        let col = "abcdefgh".indexOf(coord[0].toLowerCase());
        let row = (Number(coord[1]) - 1);
        let rows = fen.split(" ")[0].split("/");
        if(rows.length < 8){
            return null;
        }


        let rowOfInterest = rows[7-row];
        let colOfInterest: string | null = null;
        console.log(rowOfInterest, fen.split(" ")[0])
        for(let i = 0; i < rowOfInterest.length && i <= col; i = i){
            let c = rowOfInterest[i];

            if(i == col){
                colOfInterest = c;
                console.log()
                i = 8;
            }
            if(/\d+/.test(c)){
                if(colOfInterest != null){
                    colOfInterest = null;
                }
                i +=  Number(c);
            }else{
                i ++;
            }
        }

        return colOfInterest;
    }

    public static getMoveNames(uci: string, fen: string): string{
        let moveNames: string[] = [];
        try{
            let chessBoard = new ChessBoard();
            
            chessBoard.loadFromFEN(fen);
            uci.split(" ").forEach(e => {
                let x1 = "abcdefgh".indexOf(e[0]);
                let y1 = Number.parseInt(e[1]) - 1;
                let x2 = "abcdefgh".indexOf(e[2]);
                let y2 = Number.parseInt(e[3]) - 1;
                let promotedPiece: FENChar|null = null;
                if(e.length == 5){
                    let p = e[4];
                    switch(p){
                        case "r":
                            promotedPiece = FENChar.BlackRook;
                            break;
                        case "n":
                            promotedPiece = FENChar.BlackKnight;
                            break;
                        case "b":
                            promotedPiece = FENChar.BlackBishop;
                            break;
                        case "q":
                            promotedPiece = FENChar.BlackQueen;
                            break;
                        case "R":
                            promotedPiece = FENChar.WhiteRook;
                            break;
                        case "N":
                            promotedPiece = FENChar.WhiteKnight;
                            break;
                        case "B":
                            promotedPiece = FENChar.WhiteBishop;
                            break;
                        case "Q":
                            promotedPiece = FENChar.WhiteQueen;
                            break;
                    }
                }
                
                let moveName = chessBoard.move(y1,x1,y2,x2,promotedPiece);
                moveNames.push(moveName);
            });
            return moveNames.join(" ");
        }catch(err){
            alert(err);
            return moveNames.join(" ");
        }
    }
}