'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function GridPage() {
  const [snake, setSnake] = useState<Array<number>>([12, 11, 10]);
  const [food, setFood] = useState<number>(15);
  const [direction, setDirection] = useState<'right' | 'left' | 'up' | 'down'>(
    'right',
  );
  const rows = 20;
  const cols = 20;

  // Вычисляем следующий индекс головы
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

  // TODO:Телепортация за границами
  const wrapAround = (index: number): number => {
    // Получаем координаты головы
    let row = Math.floor(index / cols);
    let col = index % cols;

    // Проверяем, не выходит ли голова за границы сетки
    if (col < 0) col = cols - 1;
    if (col >= cols) col = 0;
    if (row < 0) row = rows - 1;
    if (row >= rows) row = 0;

    return row * cols + col;
  };

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
  const moveSnake = () => {
    setSnake((prev) => {
      const newHead = wrapAround(getNextHead(prev[0], direction));
      let newSnake: number[];

      if (newHead === food) {
        // поедание, добавляем голову, не удаляем хвост, перемещаем еду
        newSnake = [newHead, ...prev];
        setFood(getRandomFreeCell(newSnake));
      } else {
        // обычный ход, обрезаем хвост
        newSnake = [newHead, ...prev.slice(0, -1)];
      }

      return newSnake;
    });
  };

  // Автодвижение
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
