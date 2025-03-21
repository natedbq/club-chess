import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ChessBoard } from 'src/app/chess-logic/chess-board';
import { CheckState, Color, Coords, FENChar, GameHistory, LastMove, MoveList, MoveType, SafeSquares, pieceImagePaths } from 'src/app/chess-logic/models';
import { SelectedSquare } from './models';
import { ChessBoardService } from './chess-board.service';
import { EmptyError, Subscription, filter, fromEvent, tap } from 'rxjs';
import { FENConverter } from 'src/app/chess-logic/FENConverter';
import { Game } from 'src/app/utilities/data';
import { Move, Study } from '../../chess-logic/models';
import {CdkDragEnd, CdkDragMove, CdkDragStart, DragDropModule} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.css']
})
export class ChessBoardComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isPreview: boolean = false;
  @Input() game: Game| null = null;
  @Input() onUpdate: (move: Move | null) => void = () => {console.log('If you would like to edit studies, please provide chess-board with update callback')};
  @Input() saveAction: () => void = () => {};
  @ViewChild('chessBoard') chessBoardElement: any;
  flipMode: boolean = false;
  lastFEN: string = '-';

  public pieceImagePaths = pieceImagePaths;


  protected chessBoard = new ChessBoard();
  public chessBoardView: (FENChar | null)[][] = this.chessBoard.chessBoardView;
  public get playerColor(): Color { return this.chessBoard.playerColor; };
  public get safeSquares(): SafeSquares { return this.chessBoard.safeSquares; };
  public get gameOverMessage(): string | undefined { return this.chessBoard.gameOverMessage; };

  private selectedSquare: SelectedSquare = { piece: null };
  private pieceSafeSquares: Coords[] = [];
  private lastMove: LastMove | undefined = this.chessBoard.lastMove;
  private checkState: CheckState = this.chessBoard.checkState;

  public get moveList(): MoveList { return this.chessBoard.moveList; };
  public get gameHistory(): GameHistory { return this.chessBoard.gameHistory; };
  public gameHistoryPointer: number = 0;

  // promotion properties
  public isPromotionActive: boolean = false;
  private promotionCoords: Coords | null = null;
  private promotedPiece: FENChar | null = null;
  public promotionPieces(): FENChar[] {
    return this.playerColor === Color.White ?
      [FENChar.WhiteKnight, FENChar.WhiteBishop, FENChar.WhiteRook, FENChar.WhiteQueen] :
      [FENChar.BlackKnight, FENChar.BlackBishop, FENChar.BlackRook, FENChar.BlackQueen];
  }

  private subscriptions$ = new Subscription();

  constructor(protected chessBoardService: ChessBoardService) { }

  public ngOnInit(): void {
    const keyEventSubscription$: Subscription = fromEvent<KeyboardEvent>(document, "keyup")
      .pipe(
        filter(event => event.key === "ArrowRight" || event.key === "ArrowLeft"),
        tap(event => {
          switch (event.key) {
            case "ArrowRight":
              if (this.gameHistoryPointer === this.gameHistory.length - 1) return;
              this.gameHistoryPointer++;
              break;
            case "ArrowLeft":
              if (this.gameHistoryPointer === 0) return;
              this.gameHistoryPointer--;
              break;
            default:
              break;
          }

          this.showPreviousPosition(this.gameHistoryPointer);
        })
      )
      .subscribe();

    this.subscriptions$.add(keyEventSubscription$);
  }

  public save(): void {
    try{
      let move = this.chessBoard.moveList[this.chessBoard.moveList.length - 1]?.length == 1 ? this.chessBoard.moveList[this.chessBoard.moveList.length - 1][0] : this.chessBoard.moveList[this.chessBoard.moveList.length - 1][1]
      console.log(this.chessBoard.boardAsFEN,'-',move);
    }catch(e){
      console.log(e);
    }
    this.saveAction();
  }

  public ngOnChanges(changes: SimpleChanges){
    if(this.game){
      this.chessBoard.loadFromFEN(this.game.fen);
      this.chessBoardView = this.chessBoard.chessBoardView;
      this.flipMode = !this.game.fromWhitePerspective; // we only flip if player is Black. Its not racist, though.
      if(this.lastFEN != '-' && this.lastFEN != this.game.fen){
        this.moveSound(new Set<MoveType>([this.pickSoundForNavigator()]));
      }
      this.lastFEN = this.game.fen;
    }
  }

  onDragStart(x:number, y:number, element: HTMLElement): void {
    if(this.flipMode){
      this.move(x,y);
    }else{
      this.move(x,y);
    }
    console.log(x,y)
  }

  onDragEnd($event: CdkDragEnd, element: HTMLElement): void {
    let boardRect = this.chessBoardElement.nativeElement.getBoundingClientRect();
    let y = Math.floor(($event.dropPoint.x - boardRect.left) / (boardRect.right / 8) )
    let x = Math.floor(($event.dropPoint.y - boardRect.top) / (boardRect.right / 8) );
      console.log(y)
    
    if(!this.flipMode){
      if(!this.isSquareSafeForSelectedPiece(7-x,y)){
        this.chessBoardView = this.chessBoard.chessBoardView;
      }else{
        this.move(7-x,y);
      }
    }else{
      if(!this.isSquareSafeForSelectedPiece(x,7-y)){
          this.chessBoardView = this.chessBoard.chessBoardView;
      }else{
        this.move(x,7-y);
      }
    }
  }

  pickSoundForNavigator(): MoveType {
    let last = this.lastFEN.split(' ')[0];
    let now = this.game?.fen?.split(' ')[0] ?? '';
    if(((last.match(/P/g) || []).length > (now.match(/P/) || []).length && (last.match(/[NBRQ]/g) || []).length  < (now.match(/[NBRQ]/g) || []).length) 
      || ((last.match(/p/g) || []).length > (now.match(/p/) || []).length && (last.match(/[nbrq]/g) || []).length  < (now.match(/[nbrq]/g) || []).length)){
      return MoveType.Promotion;
    }
    if((last.match(/\D/g) || []).length > (now.match(/\D/g) || []).length){
      return MoveType.Capture;
    }

    return MoveType.BasicMove;
  }

  public ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
    this.chessBoardService.chessBoardState$.next(FENConverter.initalPosition);
  }

  public flipBoard(): void {
    this.flipMode = !this.flipMode;
  }

  public isSquareDark(x: number, y: number): boolean {
    return ChessBoard.isSquareDark(x, y);
  }

  public isSquareSelected(x: number, y: number): boolean {
    if (!this.selectedSquare.piece) return false;
    return this.selectedSquare.x === x && this.selectedSquare.y === y;
  }

  public isSquareSafeForSelectedPiece(x: number, y: number): boolean {
    return this.pieceSafeSquares.some(coords => coords.x === x && coords.y === y);
  }

  public isSquareLastMove(x: number, y: number): boolean {
    if (!this.lastMove) return false;
    const { prevX, prevY, currX, currY } = this.lastMove;
    return x === prevX && y === prevY || x === currX && y === currY;
  }

  public isSquareChecked(x: number, y: number): boolean {
    return this.checkState.isInCheck && this.checkState.x === x && this.checkState.y === y;
  }

  public isSquarePromotionSquare(x: number, y: number): boolean {
    if (!this.promotionCoords) return false;
    return this.promotionCoords.x === x && this.promotionCoords.y === y;
  }

  private unmarkingPreviouslySlectedAndSafeSquares(): void {
    this.selectedSquare = { piece: null };
    this.pieceSafeSquares = [];

    if (this.isPromotionActive) {
      this.isPromotionActive = false;
      this.promotedPiece = null;
      this.promotionCoords = null;
    }
  }

  private selectingPiece(x: number, y: number): void {
    if(this.isPreview){
      return
    }
    
    if (this.gameOverMessage !== undefined) return;
    const piece: FENChar | null = this.chessBoardView[x][y];
    if (!piece) return;
    if (this.isWrongPieceSelected(piece)) return;

    const isSameSquareClicked: boolean = !!this.selectedSquare.piece && this.selectedSquare.x === x && this.selectedSquare.y === y;
    this.unmarkingPreviouslySlectedAndSafeSquares();
    if (isSameSquareClicked) return;

    this.selectedSquare = { piece, x, y };
    this.pieceSafeSquares = this.safeSquares.get(x + "," + y) || [];
  }

  private placingPiece(newX: number, newY: number): void {
    if (!this.selectedSquare.piece) return;
    if (!this.isSquareSafeForSelectedPiece(newX, newY)) return;

    // pawn promotion
    const isPawnSelected: boolean = this.selectedSquare.piece === FENChar.WhitePawn || this.selectedSquare.piece === FENChar.BlackPawn;
    const isPawnOnlastRank: boolean = isPawnSelected && (newX === 7 || newX === 0);
    const shouldOpenPromotionDialog: boolean = !this.isPromotionActive && isPawnOnlastRank;

    if (shouldOpenPromotionDialog) {
      this.pieceSafeSquares = [];
      this.isPromotionActive = true;
      this.promotionCoords = { x: newX, y: newY };
      // because now we wait for player to choose promoted piece
      return;
    }

    const { x: prevX, y: prevY } = this.selectedSquare;
    this.updateBoard(prevX, prevY, newX, newY, this.promotedPiece);
  }

  protected updateBoard(prevX: number, prevY: number, newX: number, newY: number, promotedPiece: FENChar | null): void {
    let moveName = this.chessBoard.move(prevX, prevY, newX, newY, promotedPiece);
    this.chessBoardView = this.chessBoard.chessBoardView;
    this.markLastMoveAndCheckState(this.chessBoard.lastMove, this.chessBoard.checkState);
    this.unmarkingPreviouslySlectedAndSafeSquares();
    this.chessBoardService.chessBoardState$.next(this.chessBoard.boardAsFEN);

    this.gameHistoryPointer++;

    let move = new Move();
    move.name = moveName;
    move.fen = this.chessBoard.boardAsFEN
    this.onUpdate(move)
  }

  public promotePiece(piece: FENChar): void {
    if (!this.promotionCoords || !this.selectedSquare.piece) return;
    this.promotedPiece = piece;
    const { x: newX, y: newY } = this.promotionCoords;
    const { x: prevX, y: prevY } = this.selectedSquare;
    this.updateBoard(prevX, prevY, newX, newY, this.promotedPiece);
  }

  public closePawnPromotionDialog(): void {
    this.unmarkingPreviouslySlectedAndSafeSquares();
  }

  private markLastMoveAndCheckState(lastMove: LastMove | undefined, checkState: CheckState): void {
    this.lastMove = lastMove;
    this.checkState = checkState;

    if (this.lastMove)
      this.moveSound(this.lastMove.moveType);
    else
      this.moveSound(new Set<MoveType>([MoveType.BasicMove]));
  }
  public move(x: number, y: number): void {
    this.selectingPiece(x, y);
    this.placingPiece(x, y);
  }

  private isWrongPieceSelected(piece: FENChar): boolean {
    const isWhitePieceSelected: boolean = piece === piece.toUpperCase();
    return isWhitePieceSelected && this.playerColor === Color.Black ||
      !isWhitePieceSelected && this.playerColor === Color.White;
  }

  public showPreviousPosition(moveIndex: number): void {
    const { board, checkState, lastMove } = this.gameHistory[moveIndex];
    this.chessBoardView = board;
    this.markLastMoveAndCheckState(lastMove, checkState);
    this.gameHistoryPointer = moveIndex;
  }

  private moveSound(moveType: Set<MoveType>): void {
    const moveSound = new Audio("assets/sound/move.mp3");

    if (moveType.has(MoveType.Promotion)) moveSound.src = "assets/sound/promote.mp3";
    else if (moveType.has(MoveType.Capture)) moveSound.src = "assets/sound/capture.mp3";
    else if (moveType.has(MoveType.Castling)) moveSound.src = "assets/sound/castling.mp3";

    if (moveType.has(MoveType.CheckMate)) moveSound.src = "assets/sound/checkmate.mp3";
    else if (moveType.has(MoveType.Check)) moveSound.src = "assets/sound/check.mp3";

    moveSound.play();
  }
}
