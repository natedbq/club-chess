import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ChessBoardComponent } from '../chess-board/chess-board.component';
import { StockfishService } from './stockfish.service';
import { ChessBoardService } from '../chess-board/chess-board.service';
import { Subscription, firstValueFrom } from 'rxjs';
import { Color } from 'src/app/chess-logic/models';
import { StudyNavigationService } from '../study-navigation/study-navigation.service';
import { ActivateStudyService } from '../study/activate-study.service';
import { DrawingService } from '../drawing/drawing.service';
import { ExternalBoardControlService } from '../chess-board/external-board-control.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-computer-mode',
  templateUrl: '../chess-board/chess-board.component.html',
  styleUrls: ['../chess-board/chess-board.component.css']
})
export class ComputerModeComponent extends ChessBoardComponent implements OnInit, OnDestroy {
  private computerSubscriptions$ = new Subscription();

  constructor(private stockfishService: StockfishService) {
    super(inject(ChessBoardService), 
      inject(StudyNavigationService), 
      inject(ActivateStudyService), 
      inject(ExternalBoardControlService), 
      inject(DrawingService),
      inject(Router)
    );
  }

  public override ngOnInit(): void {
    super.ngOnInit();

    const computerConfiSubscription$: Subscription = this.stockfishService.computerConfiguration$.subscribe({
      next: (computerConfiguration) => {
        if (computerConfiguration.color === Color.White) this.flipBoard();
      }
    });

    const chessBoardStateSubscription$: Subscription = this.chessBoardService.chessBoardState$.subscribe({
      next: async (FEN: string) => {
        if (this.chessBoard.isGameOver) {
          chessBoardStateSubscription$.unsubscribe();
          return;
        }

        const player: Color = FEN.split(" ")[1] === "w" ? Color.White : Color.Black;
        if (player !== this.stockfishService.computerConfiguration$.value.color) return;

        const { prevX, prevY, newX, newY, promotedPiece } = await firstValueFrom(this.stockfishService.getBestMove(FEN));
        this.updateBoard(prevX, prevY, newX, newY, promotedPiece, player);
      }
    });

    this.computerSubscriptions$.add(chessBoardStateSubscription$);
    this.computerSubscriptions$.add(computerConfiSubscription$);
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.computerSubscriptions$.unsubscribe();
  }
}
