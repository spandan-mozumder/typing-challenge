
"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, CheckCircle2, XCircle, Play, RotateCcw, TimerIcon, Trophy } from "lucide-react";
import { getRandomSentence } from "@/lib/sentences";
import type { DifficultyLevel, GameSettings } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const INITIAL_TIME = 20;
const GAME_SETTINGS: GameSettings = {
  initialTime: INITIAL_TIME,
  timeBonuses: {
    easy: 20,
    medium: 15,
    hard: 10,
  },
};

export default function TypingChallenge() {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("easy");
  const [currentSentence, setCurrentSentence] = useState<string>("");
  const [typedValue, setTypedValue] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(GAME_SETTINGS.initialTime);
  const [score, setScore] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [inputCorrect, setInputCorrect] = useState<boolean | null>(null);
  const { toast } = useToast();

  const timeBonus = useMemo(() => GAME_SETTINGS.timeBonuses[difficulty], [difficulty]);

  const startNewGame = useCallback(() => {
    const initialScore = 0;
    setCurrentSentence(getRandomSentence(null, initialScore));
    setTypedValue("");
    setTimeLeft(GAME_SETTINGS.initialTime);
    setScore(initialScore);
    setGameStarted(true);
    setGameOver(false);
    setInputCorrect(null);
  }, []);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setGameOver(false);
    setTimeLeft(GAME_SETTINGS.initialTime);
    setScore(0);
    setCurrentSentence("");
    setTypedValue("");
    setInputCorrect(null);
  }, []);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      if (timeLeft > 0) {
        const timerId = setTimeout(() => {
          setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);
        return () => clearTimeout(timerId);
      } else {
        setGameOver(true);
        setGameStarted(false);
        toast({
          title: "Time's Up!",
          description: `Your final score is ${score}. Difficulty: ${difficulty}.`,
          variant: "default",
        });
      }
    }
  }, [gameStarted, timeLeft, gameOver, score, toast, difficulty]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!gameStarted || gameOver) return;
    const value = event.target.value;
    setTypedValue(value);

    if (value === currentSentence) {
      setInputCorrect(true);
      setTimeout(() => {
        const newScore = score + 1;
        setScore(newScore);
        setTimeLeft((prevTime) => Math.min(prevTime + timeBonus, 120)); // Cap max time
        setCurrentSentence(getRandomSentence(currentSentence, newScore));
        setTypedValue("");
        setInputCorrect(null);
        toast({
          title: "Correct!",
          description: `+${timeBonus} seconds added.`,
          variant: "default",
          className: "bg-accent text-accent-foreground border-accent",
        });
      }, 300); // Small delay for feedback
    } else if (value.length >= currentSentence.length || !currentSentence.startsWith(value)) {
      setInputCorrect(false);
    } else {
      setInputCorrect(null);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Logic is handled in handleInputChange
  };

  const renderSentenceDisplay = () => {
    if (!currentSentence) return null;
    return (
      <div className="text-2xl font-mono p-4 bg-secondary rounded-md shadow-inner min-h-[72px] flex items-center justify-center text-center whitespace-pre-wrap">
        {currentSentence.split("").map((char, index) => {
          let charClass = "text-foreground/70";
          if (index < typedValue.length) {
            charClass = char === typedValue[index] ? "text-accent" : "text-destructive";
          }
          return (
            <span key={index} className={cn("transition-colors duration-100", charClass)}>
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  if (gameOver) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-2xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-3xl text-center text-primary">Challenge Over!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <Trophy className="w-24 h-24 text-primary mx-auto" />
          <p className="text-xl">Your final score is:</p>
          <p className="text-6xl font-bold text-accent">{score}</p>
          <p className="text-muted-foreground">Difficulty Setting: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={resetGame} size="lg" className="shadow-md hover:shadow-lg transition-shadow">
            <RotateCcw className="mr-2 h-5 w-5" />
            Play Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!gameStarted) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-2xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-3xl text-center text-primary">TypeMaster Challenge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="difficulty" className="text-lg mb-2 block text-center">Select Difficulty for Time Bonus</Label>
            <RadioGroup
              id="difficulty"
              value={difficulty}
              onValueChange={(value: DifficultyLevel) => setDifficulty(value)}
              className="flex justify-center space-x-4"
            >
              {(["easy", "medium", "hard"] as DifficultyLevel[]).map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <RadioGroupItem value={level} id={level} className="focus:ring-primary focus:ring-offset-1"/>
                  <Label htmlFor={level} className="text-base capitalize cursor-pointer">
                    {level}
                  </Label>
                </div>
              ))}
            </RadioGroup>
             <p className="text-xs text-muted-foreground text-center mt-2">Sentence difficulty adapts to your score.</p>
          </div>
          <Alert className="shadow-sm">
            <Terminal className="h-4 w-4" />
            <AlertTitle>How to Play</AlertTitle>
            <AlertDescription>
              Type the displayed sentences. Correct sentences add time based on difficulty setting. Score increases. Challenge ends when time runs out.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={startNewGame} size="lg" className="w-full shadow-md hover:shadow-lg transition-shadow">
            <Play className="mr-2 h-5 w-5" />
            Start Challenge
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl text-center text-primary">Type The Sentence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
           {renderSentenceDisplay()}
           <Progress value={(timeLeft / GAME_SETTINGS.initialTime) * 100} className="absolute bottom-[-10px] left-0 w-full h-1.5 transition-all duration-300 ease-linear shadow-sm" 
            indicatorClassName={ timeLeft <= 5 ? "bg-destructive" : timeLeft <= 10 ? "bg-yellow-400" : "bg-accent"}
           />
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <Input
            type="text"
            value={typedValue}
            onChange={handleInputChange}
            placeholder="Start typing here..."
            className={cn(
              "text-lg p-4 h-14 focus:ring-2 focus:ring-primary shadow-sm",
              inputCorrect === true && "ring-2 ring-accent animate-flash-accent",
              inputCorrect === false && "ring-2 ring-destructive animate-flash-accent border-destructive"
            )}
            aria-label="Typing input"
            autoFocus
            disabled={gameOver || !gameStarted}
          />
          {inputCorrect === true && (
            <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-accent" />
          )}
          {inputCorrect === false && (
            <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-destructive" />
          )}
        </form>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t">
        <div className="flex items-center text-lg font-semibold mb-2 sm:mb-0">
          <TimerIcon className="mr-2 h-6 w-6 text-primary" />
          Time Left: <span className={cn("ml-1 tabular-nums", timeLeft <= 5 ? "text-destructive" : timeLeft <= 10 ? "text-yellow-500" : "text-accent")}>{timeLeft}s</span>
        </div>
        <div className="flex items-center text-lg font-semibold">
          <Trophy className="mr-2 h-6 w-6 text-primary" />
          Score: <span className="ml-1 text-accent tabular-nums">{score}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
