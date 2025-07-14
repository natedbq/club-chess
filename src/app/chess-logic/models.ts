import { Piece } from "./pieces/piece";

export enum Color {
    White,
    Black
}

export type Coords = {
    x: number;
    y: number;
}

export enum FENChar {
    WhitePawn = "P",
    WhiteKnight = "N",
    WhiteBishop = "B",
    WhiteRook = "R",
    WhiteQueen = "Q",
    WhiteKing = "K",
    BlackPawn = "p",
    BlackKnight = "n",
    BlackBishop = "b",
    BlackRook = "r",
    BlackQueen = "q",
    BlackKing = "k"
}

export const pieceImagePaths: Readonly<Record<FENChar, string>> = {
    [FENChar.WhitePawn]: "assets/pieces/white pawn.svg",
    [FENChar.WhiteKnight]: "assets/pieces/white knight.svg",
    [FENChar.WhiteBishop]: "assets/pieces/white bishop.svg",
    [FENChar.WhiteRook]: "assets/pieces/white rook.svg",
    [FENChar.WhiteQueen]: "assets/pieces/white queen.svg",
    [FENChar.WhiteKing]: "assets/pieces/white king.svg",
    [FENChar.BlackPawn]: "assets/pieces/black pawn.svg",
    [FENChar.BlackKnight]: "assets/pieces/black knight.svg",
    [FENChar.BlackBishop]: "assets/pieces/black bishop.svg",
    [FENChar.BlackRook]: "assets/pieces/black rook.svg",
    [FENChar.BlackQueen]: "assets/pieces/black queen.svg",
    [FENChar.BlackKing]: "assets/pieces/black king.svg"
}

export type SafeSquares = Map<string, Coords[]>;

export enum MoveType {
    Capture,
    Castling,
    Promotion,
    Check,
    CheckMate,
    BasicMove
}

export type LastMove = {
    piece: Piece;
    prevX: number;
    prevY: number;
    currX: number;
    currY: number;
    moveType: Set<MoveType>;
}

type KingChecked = {
    isInCheck: true;
    x: number;
    y: number;
}

type KingNotChecked = {
    isInCheck: false;
}

export type CheckState = KingChecked | KingNotChecked;

export type MoveList = ([string, string?])[];

export type GameHistory = {
    lastMove: LastMove | undefined;
    checkState: CheckState;
    board: (FENChar | null)[][];
    boardAsFEN: string;
}[];

export class CastleState{
    blackKingSide: boolean = true;
    blackQueenSide: boolean = true;
    whiteKingSide: boolean = true;
    whiteQueenSide: boolean = true;
}

export interface TaggedObject {
    tags: string[];
}

export class Study implements TaggedObject {
    id: string | null = null;
    title: string | null = null;
    description: string | null = null;
    perspective: Color | null = null;
    position: Position | null = null;
    summaryFEN:string | null = null;
    positionId: string | null = null;
    isDirty: boolean = true;
    lastStudied: Date | null = null;
    accuracy: number | null = null;
    tags: string[] = [];

    public static toStudy(data: any): Study{
        let study = new Study();
        study.id = data.id;
        study.title = data.title;
        study.description = data.description;
        study.perspective = data.perspective;
        study.summaryFEN = data.summaryFEN;
        study.isDirty = false;
        study.positionId = data.positionId;
        study.lastStudied = data.lastStudied;
        study.accuracy = data.accuracy;
        study.tags = data.tags;
    
        if(data.position){
          study.position = Position.toPosition(data.position);
        }
        return study;
      }  
}

export class Position implements TaggedObject {
    id: string | null = null;
    title: string | null = null;
    tags: string[] = [];
    description: string | null = null;
    move: Move | null = null;
    positions: Position[] = [];
    parentId: string | null = null;
    isDirty: boolean = true;
    weight: number = 1;
    plans: string = '';
    liveNotes: string[] = [];
    lastStudied: Date | null = null;
    mistakes: number | null = null;
    isKeyPosition: boolean = false;
    isActive: boolean = true;

    public static toPosition(data: any): Position {
        let position = new Position();
        position.id = data.id;
        position.title = data.title;
        position.tags = data.tags;
        position.description = data.description;
        position.isDirty = false;
        position.plans = data.plans;
        position.lastStudied = data.lastStudied;
        position.mistakes = data.mistakes;
        position.isKeyPosition = data.isKeyPosition;
        position.tags = data.tags;
        position.isActive = data.isActive;
        if(data.move)
            position.move = Move.toMove(data.move);
        if(data.positions){
            position.positions = data.positions.map((c: Position) => this.toPosition(c));

        }else{
            position.positions = [];
        }
        return position;
    }

    public addNote(n: string){
        this.liveNotes.push(n);
    }
}


export class Queue<T> {
    private items: T[] = [];
  
    enqueue(item: T): void {
      this.items.push(item);
    }
  
    dequeue(): T | undefined {
      return this.items.shift();
    }
  
    peek(): T | undefined {
      return this.items[0];
    }
  
    isEmpty(): boolean {
      return this.items.length === 0;
    }
  
    size(): number {
      return this.items.length;
    }
  }

export class Move {
    fen: string | null = null;
    name: string | null = null;
    from: string  | null = null;
    to: string | null = null;

    public copy(): Move {
        let m = new Move();
        m.name = this.name;
        m.fen = this.fen;
        return m;
    }

    public static toMove(data: any): Move {
        let move = new Move();
        move.fen = data.fen;
        move.name = data.name;
        move.from = data.from;
        move.to = data.to;
        return move;
    }
}

export interface ExploreNode {
    white: number;
    black: number;
    draws: number;
    uci: string;
    san: string;
    percent: number;
    opening: {
        name: string;
    }
    moves: ExploreNode[];
}

export interface Evaluation {
    fen: string;
    knodes: number;
    depth: number;
    pvs: PV[];
}
export interface PV{
    moves: string;
    moveNames: string;
    cp: 42;
}

export interface MoveData {
    studyId: string | null;
    studyTitle: string | null;
    move: Move | null;
    source: string | null;
    direction: string | null;
    player: Color | null;
    extra: any;
    position?: Position;
}