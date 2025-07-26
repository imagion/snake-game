'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function GridPage() {
  const [snake, setSnake] = useState<Array<number>>([12, 11, 10]);
  const [food, setFood] = useState<number>(15);
  const [direction, setDirection] = useState<'right' | 'left' | 'up' | 'down'>(
    'right',
  );

  // Размер сетки: количество строк и колонок
  const rows = 20;
  const cols = 20;

  // Функция для вычисления следующего хода змейки
  const getNextHead = (currentHead: number, direction: string): number => {
    switch (direction) {
      case 'right':
        return currentHead + 1;
      case 'left':
        return currentHead - 1;
      case 'up':
        return currentHead - cols;
      case 'down':
        return currentHead + cols;
      default:
        return currentHead;
    }
  };

  // Функция для движения змейки
  const moveSnake = () => {
    setSnake((prev) => {
      const newHead = getNextHead(prev[0], direction);
      const newSnake = [newHead, ...prev.slice(0, -1)];
      return newSnake;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      moveSnake();
    }, 300);

    return () => clearInterval(interval);
  }, [direction]);

  return (
    <div className='flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900'>
      {/* Контейнер грида */}
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
              snake.includes(index) ? 'bg-green-500 dark:bg-green-900' : '',
              food === index ? 'bg-red-500 dark:bg-red-900' : '',
            )}
          />
        ))}
      </div>
    </div>
  );
}
