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
        resetGame();
        return prev; // Возвращаем старое состояние, чтобы избежать ошибки обновления
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
  }, [direction, food, resetGame]);

  // Автодвижение
  useEffect(() => {
    const interval = setInterval(() => {
      moveSnake();
    }, 300);

    return () => clearInterval(interval);
  }, [moveSnake]);

  // Управление
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Если замок закрыт, ничего не делаем
      if (directionChangeLockRef.current) {
        return;
      }

      const key = e.key;
      const currentDirection = direction;

      if (key === 'ArrowRight' && currentDirection !== 'left') {
        setDirection('right');
        directionChangeLockRef.current = true;
      } else if (key === 'ArrowLeft' && currentDirection !== 'right') {
        setDirection('left');
        directionChangeLockRef.current = true;
      } else if (key === 'ArrowUp' && currentDirection !== 'down') {
        setDirection('up');
        directionChangeLockRef.current = true;
      } else if (key === 'ArrowDown' && currentDirection !== 'up') {
        setDirection('down');
        directionChangeLockRef.current = true;
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [direction]);

  return (
    <div className='flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900'>
      <div className='flex flex-col items-center gap-4'>
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
                'border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
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
        <div className='text-2xl font-bold text-gray-800 dark:text-gray-200'>
          Счет: {score}
        </div>
      </div>
    </div>
  );
}
