import { Color, FENChar } from "src/app/chess-logic/models";

export type StockfishQueryParams = {
    fen: string;
    depth: number;
}

export type ChessMove = {
    prevX: number;
    prevY: number;
    newX: number;
    newY: number;
    promotedPiece: FENChar | null;
}

export type StockfishResponse = {
    success: boolean;
    evaulatuion: number | null;
    mate: number | null;
    bestmove: string;
    continuation: string;
}

export type ComputerConfiguration = {
    color: Color;
    level: number;
}

export const stockfishLevels: Readonly<Record<number, number>> = {
    1: 10,
    2: 11,
    3: 12,
    4: 13,
    5: 15
}

export interface Continuation {
    id: string;
    description: string;
    movesToPosition: string[];
    position: Position;
}

export interface Study {
    id: string;
    title: string;
    description: string;
    perspective: Color;
    continuation: Continuation;
    fen:string;
}

export interface Position {
    id: string;
    title: string;
    tags: string[];
    description: string;
    fen: string;
    continuations: Continuation[];
}