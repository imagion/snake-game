'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export default function GridPage() {
  const rows = 20;
  const cols = 20;

  const [snake, setSnake] = useState<Array<number>>([12, 11, 10]);
  const [food, setFood] = useState<number>(15);
  const [direction, setDirection] = useState<'right' | 'left' | 'up' | 'down'>(
    'right',
  );
  const [score, setScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [gameStatus, setGameStatus] = useState<'playing' | 'gameOver'>(
    'playing',
  );
  const directionChangeLockRef = useRef(false);

  const generateNewGameState = useCallback(() => {
    const directions: Array<'right' | 'left' | 'up' | 'down'> = [
      'right',
      'left',
      'up',
      'down',
    ];
    const randomDirection =
      directions[Math.floor(Math.random() * directions.length)];
    const startHead = Math.floor(rows / 2) * cols + Math.floor(cols / 2);
    let snake: number[];

    switch (randomDirection) {
      case 'right':
        snake = [startHead, startHead - 1, startHead - 2];
        break;
      case 'left':
        snake = [startHead, startHead + 1, startHead + 2];
        break;
      case 'down':
        snake = [startHead, startHead - cols, startHead - 2 * cols];
        break;
      case 'up':
        snake = [startHead, startHead + cols, startHead + 2 * cols];
        break;
    }

    // Внутренняя функция для получения еды, чтобы избежать конфликтов видимости
    const getFood = (occupied: number[]): number => {
      const maxIndex = rows * cols - 1;
      let rand: number;
      do {
        rand = Math.floor(Math.random() * (maxIndex + 1));
      } while (occupied.includes(rand));
      return rand;
    };

    return {
      snake,
      food: getFood(snake),
      direction: randomDirection,
    };
  }, [rows, cols]);

  // Сброс игры
  const resetGame = useCallback(() => {
    const newState = generateNewGameState();
    setDirection(newState.direction);
    setSnake(newState.snake);
    setFood(newState.food);
    setScore(0);
    setGameStatus('playing');
  }, [generateNewGameState]);

  // Случайный старт
  useEffect(() => {
    resetGame();
    setIsLoading(false);
  }, [resetGame]);

  // Получаем случайную свободную клетку
  const getRandomFreeCell = (occupied: number[]): number => {
    const maxIndex = rows * cols - 1;
    let rand: number;
    do {
      rand = Math.floor(Math.random() * (maxIndex + 1));
    } while (occupied.includes(rand));
    return rand;
  };

  // Движение змейки
  const moveSnake = useCallback(() => {
    directionChangeLockRef.current = false;

    setSnake((prev) => {
      const head = prev[0];
      const tail = prev.slice(1);
      let newHead;
      const totalCells = rows * cols;

      // Определяем новую голову змейки с учетом телепортации
      switch (direction) {
        case 'right':
          // Если у правой границы, телепорт на левую сторону той же строки
          newHead = head % cols === cols - 1 ? head - cols + 1 : head + 1;
          break;
        case 'left':
          // Если у левой границы, телепорт на правую сторону той же строки
          newHead = head % cols === 0 ? head + cols - 1 : head - 1;
          break;
        case 'up':
          // Если у верхней границы, телепорт на нижнюю
          newHead = head - cols;
          if (newHead < 0) newHead += totalCells;
          break;
        case 'down':
          // Если у нижней границы, телепорт на верхнюю
          newHead = (head + cols) % totalCells;
          break;
        default:
          newHead = head;
          break;
      }

      if (tail.includes(newHead)) {
        setGameStatus('gameOver');
        return prev;
      }

      let newSnake: number[];

      if (newHead === food) {
        // Поедание: добавляем голову, не удаляем хвост, перемещаем еду
        newSnake = [newHead, ...prev];
        setFood(getRandomFreeCell(newSnake));
        setScore((prevScore) => prevScore + 1);
      } else {
        // Обычный ход: добавляем голову, обрезаем хвост
        newSnake = [newHead, ...prev.slice(0, -1)];
      }

      return newSnake;
    });
  }, [direction, food]);

  // Автодвижение
  useEffect(() => {
    if (gameStatus !== 'playing') {
      return;
    }

    const interval = setInterval(() => {
      moveSnake();
    }, 300);

    return () => clearInterval(interval);
  }, [gameStatus, moveSnake]);

  // Управление
  useEffect(() => {
    // Карта, которая связывает клавиши с направлениями
    // prettier-ignore
    const keyMap: Record<string, 'right' | 'left' | 'up' | 'down'> = {
      ArrowRight: 'right', KeyD: 'right',
      ArrowLeft: 'left',   KeyA: 'left',
      ArrowUp: 'up',       KeyW: 'up',
      ArrowDown: 'down',   KeyS: 'down',
    };

    // Карта противоположных направлений для удобной проверки
    const oppositeDirections: Record<string, string> = {
      right: 'left',
      left: 'right',
      up: 'down',
      down: 'up',
    };

    const handler = (e: KeyboardEvent) => {
      if (directionChangeLockRef.current) {
        return;
      }

      const key = e.code;
      const intendedDirection = keyMap[key];

      if (
        intendedDirection &&
        intendedDirection !== oppositeDirections[direction]
      ) {
        setDirection(intendedDirection);
        directionChangeLockRef.current = true;
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [direction]);

  return (
    <div className='flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900'>
      <div className='flex flex-col items-center gap-5 rounded-xl bg-slate-200 p-6 shadow-2xl dark:bg-slate-700'>
        {/* Панель счета */}
        <div className='w-full rounded-md bg-white p-2 text-center dark:bg-gray-800'>
          <p className='text-lg font-medium text-gray-500 dark:text-gray-400'>
            Счет:{' '}
            <span className='font-mono text-xl font-bold text-green-500'>
              {score}
            </span>
          </p>
        </div>
        <div className='relative'>
          <div
            className='grid gap-0.5'
            style={{
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              width: '400px',
              height: '400px',
            }}>
            {/* Рендерим клетки */}
            {Array.from({ length: rows * cols }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'bg-slate-100 dark:bg-slate-900',
                  !isLoading && snake.includes(index)
                    ? 'bg-green-500 dark:bg-green-900'
                    : '',
                  !isLoading && food === index
                    ? 'bg-red-500 dark:bg-red-900'
                    : '',
                )}
              />
            ))}
          </div>

          {/* Экран "Конец игры" */}
          {gameStatus === 'gameOver' && (
            <div className='animate-in fade-in absolute inset-0 flex flex-col items-center justify-center rounded-md bg-black/60 backdrop-blur-sm duration-500'>
              <h2 className='text-5xl font-extrabold text-white drop-shadow-lg'>
                Конец игры
              </h2>
              <p className='mt-4 text-xl text-white drop-shadow-lg'>
                Итоговый счет: {score}
              </p>
              <button
                onClick={resetGame}
                className='mt-6 rounded-lg bg-green-500 px-6 py-2 font-bold text-white transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800'>
                Играть снова
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
