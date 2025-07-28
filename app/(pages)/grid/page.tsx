'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function GridPage() {
  const [snake, setSnake] = useState<Array<number>>([12, 11, 10]);
  const [food, setFood] = useState<number>(20);
  const [direction, setDirection] = useState<'right' | 'left' | 'up' | 'down'>(
    'right',
  );
  const rows = 20;
  const cols = 20;

  // Вычисляем следующий индекс головы
  // prettier-ignore
  const getNextHead = (currentHead: number, direction: string): number => {
    switch (direction) {
      case 'right': return currentHead + 1;
      case 'left':  return currentHead - 1;
      case 'up':    return currentHead - cols;
      case 'down':  return currentHead + cols;
      default:      return currentHead;
    }
  };

  // Телепортация за границами
  const wrapAround = (index: number, direction: string): number => {
    // Получаем координаты головы
    const totalCells = rows * cols;
    const col = index % cols;

    // Проверяем, не выходит ли голова за границы сетки
    if (direction === 'right' && col == 0) return index - cols;
    if (direction === 'left' && col == cols - 1) return index + cols;
    if (direction === 'down' && index >= totalCells) return index % totalCells;
    if (direction === 'up' && index < 0) return index + totalCells;

    return index;
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
      // Вычисляем потенциальную следующую позицию
      const nextHead = getNextHead(prev[0], direction);
      // Передаем ее в wrapAround вместе с направлением для коррекции
      const newHead = wrapAround(nextHead, direction);

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

  // Управление
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key;
      if (key === 'ArrowRight' && direction !== 'left') {
        setDirection('right');
      } else if (key === 'ArrowLeft' && direction !== 'right') {
        setDirection('left');
      } else if (key === 'ArrowUp' && direction !== 'down') {
        setDirection('up');
      } else if (key === 'ArrowDown' && direction !== 'up') {
        setDirection('down');
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
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
