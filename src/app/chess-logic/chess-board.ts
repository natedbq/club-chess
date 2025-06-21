import { columns } from "../modules/chess-board/models";
import { StudyNavigationService } from "../modules/study-navigation/study-navigation.service";
import { Data } from "../utilities/data";
import { FENConverter } from "./FENConverter";
import { CastleState, CheckState, Color, Coords, FENChar, GameHistory, LastMove, MoveList, MoveType, Position, SafeSquares } from "./models";
import { Bishop } from "./pieces/bishop";
import { King } from "./pieces/king";
import { Knight } from "./pieces/knight";
import { Pawn } from "./pieces/pawn";
import { Piece } from "./pieces/piece";
import { Queen } from "./pieces/queen";
import { Rook } from "./pieces/rook";

export class ChessBoard {
    private chessBoard: (Piece | null)[][];
    private castlePieces: Piece[] = [];
    private readonly chessBoardSize: number = 8;
    private _playerColor = Color.White;
    private _safeSquares: SafeSquares;
    private _lastMove: LastMove | undefined;
    private _checkState: CheckState = { isInCheck: false };
    private _castleState: CastleState = new CastleState();



    private fiftyMoveRuleCounter: number = 0;

    private _isGameOver: boolean = false;
    private _gameOverMessage: string | undefined;

    private fullNumberOfMoves: number = 1;
    private threeFoldRepetitionDictionary = new Map<string, number>();
    private threeFoldRepetitionFlag: boolean = false;

    private _boardAsFEN: string = FENConverter.initalPosition;
    private FENConverter = new FENConverter();

    private _moveList: MoveList = [];
    private _gameHistory: GameHistory;

    constructor(private navService: StudyNavigationService | null = null) {
        let wqRook = new Rook(Color.White);
        let wkRook = new Rook(Color.White);
        let bqRook = new Rook(Color.Black);
        let bkRook = new Rook(Color.Black);

        this.castlePieces = [wqRook, wkRook, bqRook, bkRook];

        this.chessBoard = [
            [
                wqRook, new Knight(Color.White), new Bishop(Color.White), new Queen(Color.White),
                new King(Color.White), new Bishop(Color.White), new Knight(Color.White), wkRook
            ],
            [
                new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White),
                new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White)
            ],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [
                new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black),
                new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black)
            ],
            [
                bqRook, new Knight(Color.Black), new Bishop(Color.Black), new Queen(Color.Black),
                new King(Color.Black), new Bishop(Color.Black), new Knight(Color.Black), bkRook
            ],
        ];

        this._safeSquares = this.findSafeSqures();


        let fenConvert = new FENConverter();
        let boardAsFEN = fenConvert.convertBoardToFEN(this.chessBoard, this.playerColor, this._lastMove, this.fiftyMoveRuleCounter, this.fullNumberOfMoves, this._castleState)

        this._gameHistory = [{ board: this.chessBoardView, lastMove: this._lastMove, checkState: this._checkState,  boardAsFEN: boardAsFEN}];
    }

    public loadFromFEN(fen: string): void {
        let row = 7;

        let parts = fen.split(" ");
        
        this._playerColor = parts[1] == 'w' ? Color.White : Color.Black;
        this.fiftyMoveRuleCounter = Number(parts[4]);
        this.fullNumberOfMoves = Number(parts[5]);

        let position = parts[0].split('/');

        this._castleState = {
            blackKingSide: parts[2].includes('k'),
            blackQueenSide: parts[2].includes('q'),
            whiteKingSide: parts[2].includes('K'),
            whiteQueenSide: parts[2].includes('Q')
        };

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
                        this.chessBoard[row][col] = piece;
                        col++;
                    }
                }else{
                    this.chessBoard[row][col] = piece;
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

        this._boardAsFEN = fen;
        
        this._safeSquares = this.findSafeSqures();
    }

    public get playerColor(): Color {
        return this._playerColor;
    }

    public get chessBoardView(): (FENChar | null)[][] {
        let fen = this.boardAsFEN;
            let chessBoard:(FENChar | null)[][] = [
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
                        let piece: FENChar | null = null;
                        let col = 0;
                        [...r].forEach(c => {
                            piece = null;
                            switch(c){
                                case "p":
                                    piece = FENChar.BlackPawn
                                    break;
                                case "n":
                                    piece = FENChar.BlackKnight
                                    break;
                                case "b":
                                    piece = FENChar.BlackBishop
                                    break;
                                case "r":
                                    piece = FENChar.BlackRook
                                    break;
                                case "q":
                                    piece = FENChar.BlackQueen
                                    break;
                                case "k":
                                    piece = FENChar.BlackKing
                                    break;
                                case "P":
                                    piece = FENChar.WhitePawn
                                    break;
                                case "N":
                                    piece = FENChar.WhiteKnight
                                    break;
                                case "B":
                                    piece = FENChar.WhiteBishop
                                    break;
                                case "R":
                                    piece = FENChar.WhiteRook
                                    break;
                                case "Q":
                                    piece = FENChar.WhiteQueen
                                    break;
                                case "K":
                                    piece = FENChar.WhiteKing
                                    break;
            
                            }
                            if(/\d+/.test(c)){
                                let n = Number(c);
                                for(let x = 0; x < n; x++){
                                    chessBoard[row][col] = null;
                                    col++;
                                }
                            }else{
                                chessBoard[row][col] = piece;
                                col++;
                            }
                        });
                        row--;
                    });
        
                    return chessBoard;
    }

    public get safeSquares(): SafeSquares {
        return this._safeSquares;
    }

    public get lastMove(): LastMove | undefined {
        return this._lastMove;
    }

    public get checkState(): CheckState {
        return this._checkState;
    }

    public get isGameOver(): boolean {
        return this._isGameOver;
    }

    public get gameOverMessage(): string | undefined {
        return this._gameOverMessage;
    }

    public get boardAsFEN(): string {
        return this._boardAsFEN;
    }

    public get moveList(): MoveList {
        return this._moveList;
    }

    public get gameHistory(): GameHistory {
        return this._gameHistory;
    }

    public static isSquareDark(x: number, y: number): boolean {
        return x % 2 === 0 && y % 2 === 0 || x % 2 === 1 && y % 2 === 1;
    }

    private areCoordsValid(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this.chessBoardSize && y < this.chessBoardSize;
    }


    public isInCheck(playerColor: Color, checkingCurrentPosition: boolean): boolean {
        for (let x = 0; x < this.chessBoardSize; x++) {
            for (let y = 0; y < this.chessBoardSize; y++) {
                const piece: Piece | null = this.chessBoard[x][y];
                if (!piece || piece.color === playerColor) continue;

                for (const { x: dx, y: dy } of piece.directions) {
                    let newX: number = x + dx;
                    let newY: number = y + dy;

                    if (!this.areCoordsValid(newX, newY)) continue;

                    if (piece instanceof Pawn || piece instanceof Knight || piece instanceof King) {
                        if (piece instanceof Pawn && dy === 0) continue;

                        const attackedPiece: Piece | null = this.chessBoard[newX][newY];
                        if (attackedPiece instanceof King && attackedPiece.color === playerColor) {
                            if (checkingCurrentPosition) this._checkState = { isInCheck: true, x: newX, y: newY };
                            return true;
                        }
                    }
                    else {
                        while (this.areCoordsValid(newX, newY)) {
                            const attackedPiece: Piece | null = this.chessBoard[newX][newY];
                            if (attackedPiece instanceof King && attackedPiece.color === playerColor) {
                                if (checkingCurrentPosition) this._checkState = { isInCheck: true, x: newX, y: newY };
                                return true;
                            }

                            if (attackedPiece !== null) break;

                            newX += dx;
                            newY += dy;
                        }
                    }
                }
            }
        }
        if (checkingCurrentPosition) this._checkState = { isInCheck: false };
        return false;
    }

    private isPositionSafeAfterMove(prevX: number, prevY: number, newX: number, newY: number): boolean {
        const piece: Piece | null = this.chessBoard[prevX][prevY];
        if (!piece) return false;

        let position = this.navService?.getPointer()?.pointer ?? new Position();

        const newPiece: Piece | null = this.chessBoard[newX][newY];
        // we cant put piece on a square that already contains piece of the same color
        if (newPiece && newPiece.color === piece.color){ 
            return false
        };

        // simulate position
        this.chessBoard[prevX][prevY] = null;
        this.chessBoard[newX][newY] = piece;

        const isPositionSafe: boolean = !this.isInCheck(piece.color, false);

        // restore position back
        this.chessBoard[prevX][prevY] = piece;
        this.chessBoard[newX][newY] = newPiece;

        return isPositionSafe;
    }

    public findSafeSqures(): SafeSquares {
        const safeSqures: SafeSquares = new Map<string, Coords[]>();

        for (let x = 0; x < this.chessBoardSize; x++) {
            for (let y = 0; y < this.chessBoardSize; y++) {
                const piece: Piece | null = this.chessBoard[x][y];
                if (!piece || piece.color !== this._playerColor) continue;

                const pieceSafeSquares: Coords[] = [];

                for (const { x: dx, y: dy } of piece.directions) {
                    let newX: number = x + dx;
                    let newY: number = y + dy;

                    if (!this.areCoordsValid(newX, newY)) continue;

                    let newPiece: Piece | null = this.chessBoard[newX][newY];
                    if (newPiece && newPiece.color === piece.color) continue;

                    // need to restrict pawn moves in certain directions
                    if (piece instanceof Pawn) {
                        // cant move pawn two squares straight if there is piece infront of him
                        if (dx === 2 || dx === -2) {
                            if (newPiece) continue;
                            if (this.chessBoard[newX + (dx === 2 ? -1 : 1)][newY]) continue;
                        }

                        // cant move pawn one square straight if piece is infront of him
                        if ((dx === 1 || dx === -1) && dy === 0 && newPiece) continue;

                        // cant move pawn diagonally if there is no piece, or piece has same color as pawn
                        if ((dy === 1 || dy === -1) && (!newPiece || piece.color === newPiece.color)) continue;
                    }

                    if (piece instanceof Pawn || piece instanceof Knight || piece instanceof King) {
                        if (this.isPositionSafeAfterMove(x, y, newX, newY))
                            pieceSafeSquares.push({ x: newX, y: newY });
                    }
                    else {
                        while (this.areCoordsValid(newX, newY)) {
                            newPiece = this.chessBoard[newX][newY];
                            if (newPiece && newPiece.color === piece.color) break;

                            if (this.isPositionSafeAfterMove(x, y, newX, newY))
                                pieceSafeSquares.push({ x: newX, y: newY });

                            if (newPiece !== null) break;

                            newX += dx;
                            newY += dy;
                        }
                    }
                }

                if (piece instanceof King) {
                    if (this.canCastle(piece, true))
                        pieceSafeSquares.push({ x, y: 6 });

                    if (this.canCastle(piece, false))
                        pieceSafeSquares.push({ x, y: 2 });
                }
                else if (piece instanceof Pawn && this.canCaptureEnPassant(piece, x, y))
                    pieceSafeSquares.push({ x: x + (piece.color === Color.White ? 1 : -1), y: this._lastMove!.prevY });

                if (pieceSafeSquares.length)
                    safeSqures.set(x + "," + y, pieceSafeSquares);
            }
        }

        return safeSqures;
    }

    private canCaptureEnPassant(pawn: Pawn, pawnX: number, pawnY: number): boolean {
        if (!this._lastMove) return false;
        const { piece, prevX, prevY, currX, currY } = this._lastMove;

        let enPassant = this._boardAsFEN.split(" ")[3];
        let enPassantColumn = "abcdefgh".indexOf(enPassant.charAt(0));
        if(Math.abs(pawnY - enPassantColumn) != 1){
            return false;
        }
        if(pawn.color == Color.White){
            if(pawnX != 4){
                return false;
            }
        }else{
            if(pawnX != 3){
                return false;
            }
        }

        const pawnNewPositionX: number = pawnX + (pawn.color === Color.White ? 1 : -1);
        const pawnNewPositionY: number = currY;

        this.chessBoard[currX][currY] = null;
        const isPositionSafe: boolean = this.isPositionSafeAfterMove(pawnX, pawnY, pawnNewPositionX, pawnNewPositionY);
        this.chessBoard[currX][currY] = piece;

        return isPositionSafe;
    }

    private canCastle(king: King, kingSideCastle: boolean): boolean {
        let position = this.navService?.getPointer()?.pointer ?? new Position();
        position.liveNotes = [];
        let side = kingSideCastle ? 'kingSide' : 'queenSide';
        if (king.hasMoved){
            position.addNote("Can't castle "+side+" because king has moved");
            return false;
        }

        if(king.color == Color.White){
            if(kingSideCastle && !this._castleState.whiteKingSide){
                position.addNote("Can't castle "+side+" because king has moved kingSideCastle=true && this._castleState.whiteKingSide=false");
                return false;
            }
            
            if(!kingSideCastle && !this._castleState.whiteQueenSide){
                position.addNote("Can't castle "+side+" because king has moved kingSideCastle=false && this._castleState.whiteQueenSide=false");
                return false;
            }
        }else{
            if(kingSideCastle && !this._castleState.blackKingSide){
                position.addNote("Can't castle "+side+" because king has moved kingSideCastle=true && this._castleState.blackKingSide=false");
                return false;
            }
            
            if(!kingSideCastle && !this._castleState.blackQueenSide){
                position.addNote("Can't castle "+side+" because king has moved kingSideCastle=false && this._castleState.blackQueenSide=false");
                return false;
            }
        }

        const kingPositionX: number = king.color === Color.White ? 0 : 7;
        const kingPositionY: number = 4;

        if (this._checkState.isInCheck){
            position.addNote("Can't castle "+side+" because king is in check");
            return false;
        } 

        const firstNextKingPositionY: number = kingPositionY + (kingSideCastle ? 1 : -1);
        const secondNextKingPositionY: number = kingPositionY + (kingSideCastle ? 2 : -2);

        if(!this.isPositionSafeAfterMove(kingPositionX, kingPositionY, kingPositionX, firstNextKingPositionY)){
            position.addNote("Can't castle "+side+" because king can't move once that way");
        } else
        if(!this.isPositionSafeAfterMove(kingPositionX, kingPositionY, kingPositionX, secondNextKingPositionY)){
            position.addNote("Can't castle "+side+" because king can't move twice that way");
        }

        return this.isPositionSafeAfterMove(kingPositionX, kingPositionY, kingPositionX, firstNextKingPositionY) &&
            this.isPositionSafeAfterMove(kingPositionX, kingPositionY, kingPositionX, secondNextKingPositionY);
    }


    /*
        NOTE: this goober mixed up his arguments. 
            prevX= row
            prevY = col
    */
    public move(prevX: number, prevY: number, newX: number, newY: number, promotedPieceType: FENChar | null): string {
        this.updateCastleState(prevY, prevX, newY, newX);

        if (this._isGameOver) throw new Error("Game is over, you cant play move");

        if (!this.areCoordsValid(prevX, prevY) || !this.areCoordsValid(newX, newY)) return '-';
        const piece: Piece | null = this.chessBoard[prevX][prevY];
        if (!piece || piece.color !== this._playerColor) return '-';

        const pieceSafeSquares: Coords[] | undefined = this._safeSquares.get(prevX + "," + prevY);
        if (!pieceSafeSquares || !pieceSafeSquares.find(coords => coords.x === newX && coords.y === newY))
            throw new Error("Square is not safe");

        if ((piece instanceof Pawn || piece instanceof King || piece instanceof Rook) && !piece.hasMoved)
            piece.hasMoved = true;

        const moveType = new Set<MoveType>();

        const isPieceTaken: boolean = this.chessBoard[newX][newY] !== null;
        if (isPieceTaken) moveType.add(MoveType.Capture);

        if (piece instanceof Pawn || isPieceTaken) this.fiftyMoveRuleCounter = 0;
        else this.fiftyMoveRuleCounter += 0.5;

        this.handlingSpecialMoves(piece, prevX, prevY, newX, newY, moveType);
        // update the board
        if (promotedPieceType) {
            this.chessBoard[newX][newY] = this.promotedPiece(promotedPieceType);
            moveType.add(MoveType.Promotion);
        } else {
            this.chessBoard[newX][newY] = piece;
        }

        this.chessBoard[prevX][prevY] = null;

        this._lastMove = { prevX, prevY, currX: newX, currY: newY, piece, moveType };
        this._playerColor = this._playerColor === Color.White ? Color.Black : Color.White;
        this.isInCheck(this._playerColor, true);
        const safeSquares: SafeSquares = this.findSafeSqures();

        if (this._checkState.isInCheck)
            moveType.add(!safeSquares.size ? MoveType.CheckMate : MoveType.Check);
        else if (!moveType.size)
            moveType.add(MoveType.BasicMove);

        let moveName = this.storeMove(promotedPieceType);
        this.updateGameHistory();

        if (this._playerColor === Color.White) this.fullNumberOfMoves++;
        this._boardAsFEN = this.FENConverter.convertBoardToFEN(this.chessBoard, this._playerColor, this._lastMove, this.fiftyMoveRuleCounter, this.fullNumberOfMoves, this._castleState);
        //this.updateThreeFoldRepetitionDictionary(this._boardAsFEN);
        this._safeSquares = this.findSafeSqures();


        this._isGameOver = this.isGameFinished();

        return moveName;
    }

    private updateCastleState(col: number, row: number, newCol: number, newRow: number){
        let piece = this.chessBoard[row][col];

        if(newRow == 7){
            if(newCol == 0){
                this._castleState.blackQueenSide = false;
            }
            if(newCol == 7){
                this._castleState.blackKingSide = false;
            }
        }
        if(newRow == 0){
            if(newCol == 0){
                this._castleState.whiteQueenSide = false;
            }
            if(newCol == 7){
                this._castleState.whiteKingSide = false;
            }
        }

        if(piece){
            if(piece instanceof King){
                if(piece.color == Color.White){
                    this._castleState.whiteKingSide = false;
                    this._castleState.whiteQueenSide = false;
                }else{
                    this._castleState.blackKingSide = false;
                    this._castleState.blackQueenSide = false;
                }
            }else if(piece instanceof Rook){
                if(piece.color == Color.White){
                    if(col == 0){
                        this._castleState.whiteQueenSide = false;
                    }
                    if(col == 7){
                        this._castleState.whiteKingSide = false;
                    }
                }else{
                    if(col == 0){
                        this._castleState.blackQueenSide = false;
                    }
                    if(col == 7){
                        this._castleState.blackKingSide = false;
                    }
                }
            }
        }
    }

    private handlingSpecialMoves(piece: Piece, prevX: number, prevY: number, newX: number, newY: number, moveType: Set<MoveType>): void {
        if (piece instanceof King && Math.abs(newY - prevY) === 2) {
            // newY > prevY  === king side castle

            const rookPositionX: number = prevX;
            const rookPositionY: number = newY > prevY ? 7 : 0;
            const rook = this.chessBoard[rookPositionX][rookPositionY] as Rook;
            const rookNewPositionY: number = newY > prevY ? 5 : 3;
            this.chessBoard[rookPositionX][rookPositionY] = null;
            this.chessBoard[rookPositionX][rookNewPositionY] = rook;
            rook.hasMoved = true;
            moveType.add(MoveType.Castling);
        }
        else if (
            piece instanceof Pawn &&
            this._lastMove &&
            this._lastMove.piece instanceof Pawn &&
            Math.abs(this._lastMove.currX - this._lastMove.prevX) === 2 &&
            prevX === this._lastMove.currX &&
            newY === this._lastMove.currY
        ) {
            this.chessBoard[this._lastMove.currX][this._lastMove.currY] = null;
            moveType.add(MoveType.Capture);
        }
    }

    private promotedPiece(promtoedPieceType: FENChar): Knight | Bishop | Rook | Queen {
        if (promtoedPieceType === FENChar.WhiteKnight || promtoedPieceType === FENChar.BlackKnight)
            return new Knight(this._playerColor);

        if (promtoedPieceType === FENChar.WhiteBishop || promtoedPieceType === FENChar.BlackBishop)
            return new Bishop(this._playerColor);

        if (promtoedPieceType === FENChar.WhiteRook || promtoedPieceType === FENChar.BlackRook)
            return new Rook(this._playerColor);

        return new Queen(this._playerColor);
    }

    private isGameFinished(): boolean {
        if (this.insufficientMaterial()) {
            this._gameOverMessage = "Draw due insufficient material";
            return true;
        }

        if (!this._safeSquares.size) {
            if (this._checkState.isInCheck) {
                const prevPlayer: string = this._playerColor === Color.White ? "Black" : "White";
                this._gameOverMessage = prevPlayer + " won by checkmate";
            }
            else this._gameOverMessage = "Stalemate";

            return true;
        }

        if (this.threeFoldRepetitionFlag) {
            this._gameOverMessage = "Draw due three fold repetition rule";
            return true;
        }

        if (this.fiftyMoveRuleCounter === 50) {
            this._gameOverMessage = "Draw due fifty move rule";
            return true;
        }

        return false;
    }

    // Insufficient material

    private playerHasOnlyTwoKnightsAndKing(pieces: { piece: Piece, x: number, y: number }[]): boolean {
        return pieces.filter(piece => piece.piece instanceof Knight).length === 2;
    }

    private playerHasOnlyBishopsWithSameColorAndKing(pieces: { piece: Piece, x: number, y: number }[]): boolean {
        const bishops = pieces.filter(piece => piece.piece instanceof Bishop);
        const areAllBishopsOfSameColor = new Set(bishops.map(bishop => ChessBoard.isSquareDark(bishop.x, bishop.y))).size === 1;
        return bishops.length === pieces.length - 1 && areAllBishopsOfSameColor;
    }

    private insufficientMaterial(): boolean {
        const whitePieces: { piece: Piece, x: number, y: number }[] = [];
        const blackPieces: { piece: Piece, x: number, y: number }[] = [];

        for (let x = 0; x < this.chessBoardSize; x++) {
            for (let y = 0; y < this.chessBoardSize; y++) {
                const piece: Piece | null = this.chessBoard[x][y];
                if (!piece) continue;

                if (piece.color === Color.White) whitePieces.push({ piece, x, y });
                else blackPieces.push({ piece, x, y });
            }
        }

        // King vs King
        if (whitePieces.length === 1 && blackPieces.length === 1)
            return true;

        // King and Minor Piece vs King
        if (whitePieces.length === 1 && blackPieces.length === 2)
            return blackPieces.some(piece => piece.piece instanceof Knight || piece.piece instanceof Bishop);

        else if (whitePieces.length === 2 && blackPieces.length === 1)
            return whitePieces.some(piece => piece.piece instanceof Knight || piece.piece instanceof Bishop);

        // both sides have bishop of same color
        else if (whitePieces.length === 2 && blackPieces.length === 2) {
            const whiteBishop = whitePieces.find(piece => piece.piece instanceof Bishop);
            const blackBishop = blackPieces.find(piece => piece.piece instanceof Bishop);

            if (whiteBishop && blackBishop) {
                const areBishopsOfSameColor: boolean = ChessBoard.isSquareDark(whiteBishop.x, whiteBishop.y) && ChessBoard.isSquareDark(blackBishop.x, blackBishop.y) || !ChessBoard.isSquareDark(whiteBishop.x, whiteBishop.y) && !ChessBoard.isSquareDark(blackBishop.x, blackBishop.y);

                return areBishopsOfSameColor;
            }
        }

        if (whitePieces.length === 3 && blackPieces.length === 1 && this.playerHasOnlyTwoKnightsAndKing(whitePieces) ||
            whitePieces.length === 1 && blackPieces.length === 3 && this.playerHasOnlyTwoKnightsAndKing(blackPieces)
        ) return true;

        if (whitePieces.length >= 3 && blackPieces.length === 1 && this.playerHasOnlyBishopsWithSameColorAndKing(whitePieces) ||
            whitePieces.length === 1 && blackPieces.length >= 3 && this.playerHasOnlyBishopsWithSameColorAndKing(blackPieces)
        ) return true;

        return false;
    }

    private updateThreeFoldRepetitionDictionary(FEN: string): void {
        const threeFoldRepetitionFENKey: string = FEN.split(" ").slice(0, 4).join("");
        const threeFoldRepetionValue: number | undefined = this.threeFoldRepetitionDictionary.get(threeFoldRepetitionFENKey);

        if (threeFoldRepetionValue === undefined)
            this.threeFoldRepetitionDictionary.set(threeFoldRepetitionFENKey, 1);
        else {
            if (threeFoldRepetionValue === 2) {
                this.threeFoldRepetitionFlag = true;
                return;
            }
            this.threeFoldRepetitionDictionary.set(threeFoldRepetitionFENKey, 2);
        }
    }

    private storeMove(promotedPiece: FENChar | null): string {
        const { piece, currX, currY, prevX, prevY, moveType } = this._lastMove!;
        let pieceName: string = !(piece instanceof Pawn) ? piece.FENChar.toUpperCase() : "";
        let move: string;

        if (moveType.has(MoveType.Castling))
            move = currY - prevY === 2 ? "O-O" : "O-O-O";
        else {
            move = pieceName + this.startingPieceCoordsNotation();
            if (moveType.has(MoveType.Capture))
                move += (piece instanceof Pawn) ? columns[prevY] + "x" : "x";
            move += columns[currY] + String(currX + 1);

            if (promotedPiece)
                move += "=" + promotedPiece.toUpperCase();
        }

        if (moveType.has(MoveType.Check)) move += "+";
        else if (moveType.has(MoveType.CheckMate)) move += "#";

        if (!this._moveList[this.fullNumberOfMoves - 1])
            this._moveList[this.fullNumberOfMoves - 1] = [move];
        else
            this._moveList[this.fullNumberOfMoves - 1].push(move);

        return move
    }

    private startingPieceCoordsNotation(): string {
        const { piece: currPiece, prevX, prevY, currX, currY } = this._lastMove!;
        if (currPiece instanceof Pawn || currPiece instanceof King) return "";

        const samePiecesCoords: Coords[] = [{ x: prevX, y: prevY }];

        for (let x = 0; x < this.chessBoardSize; x++) {
            for (let y = 0; y < this.chessBoardSize; y++) {
                const piece: Piece | null = this.chessBoard[x][y];
                if (!piece || (currX === x && currY === y)) continue;

                if (piece.FENChar === currPiece.FENChar) {
                    const safeSquares: Coords[] = this._safeSquares.get(x + "," + y) || [];
                    const pieceHasSameTargetSquare: boolean = safeSquares.some(coords => coords.x === currX && coords.y === currY);
                    if (pieceHasSameTargetSquare) samePiecesCoords.push({ x, y });
                }
            }
        }

        if (samePiecesCoords.length === 1) return "";

        const piecesFile = new Set(samePiecesCoords.map(coords => coords.y));
        const piecesRank = new Set(samePiecesCoords.map(coords => coords.x));

        // means that all of the pieces are on different files (a, b, c, ...)
        if (piecesFile.size === samePiecesCoords.length)
            return columns[prevY];

        // means that all of the pieces are on different rank (1, 2, 3, ...)
        if (piecesRank.size === samePiecesCoords.length)
            return String(prevX + 1);

        // in case that there are pieces that shares both rank and a file with multiple or one piece
        return columns[prevY] + String(prevX + 1);
    }

    private updateGameHistory(): void {
        let fenConvert = new FENConverter();

        this._gameHistory.push({
            board: [...this.chessBoardView.map(row => [...row])],
            checkState: { ...this._checkState },
            lastMove: this._lastMove ? { ...this._lastMove } : undefined,
            boardAsFEN: fenConvert.convertBoardToFEN(this.chessBoard, this.playerColor, this._lastMove, this.fiftyMoveRuleCounter, this.fullNumberOfMoves, this._castleState)
        });
    }
}