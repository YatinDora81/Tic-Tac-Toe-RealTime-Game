import { ELO_K_FACTOR } from "../constants/game";

export interface EloResult {
  newWinnerRating: number;
  newLoserRating: number;
}

export interface EloDraw {
  newRatingA: number;
  newRatingB: number;
}

function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function calculateEloWin(winnerRating: number, loserRating: number): EloResult {
  const expectedWinner = expectedScore(winnerRating, loserRating);
  const expectedLoser = expectedScore(loserRating, winnerRating);

  return {
    newWinnerRating: Math.round(winnerRating + ELO_K_FACTOR * (1 - expectedWinner)),
    newLoserRating: Math.round(loserRating + ELO_K_FACTOR * (0 - expectedLoser)),
  };
}

export function calculateEloDraw(ratingA: number, ratingB: number): EloDraw {
  const expectedA = expectedScore(ratingA, ratingB);
  const expectedB = expectedScore(ratingB, ratingA);

  return {
    newRatingA: Math.round(ratingA + ELO_K_FACTOR * (0.5 - expectedA)),
    newRatingB: Math.round(ratingB + ELO_K_FACTOR * (0.5 - expectedB)),
  };
}
