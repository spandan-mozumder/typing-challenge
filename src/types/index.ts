export type DifficultyLevel = "easy" | "medium" | "hard";

export interface GameSettings {
  initialTime: number;
  timeBonuses: {
    [key in DifficultyLevel]: number;
  };
}
