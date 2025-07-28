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
      const head = prev[0];
      let newHead;
      const totalCells = rows * cols;

      // Определяем новую голову змейки с учетом телепортации
      switch (direction) {
        case 'right':
          // Если у правой границы, телепорт на левую сторону той же строки
          if (head % cols === cols - 1) {
            newHead = head - cols + 1;
          } else {
            newHead = head + 1;
          }
          break;
        case 'left':
          // Если у левой границы, телепорт на правую сторону той же строки
          if (head % cols === 0) {
            newHead = head + cols - 1;
          } else {
            newHead = head - 1;
          }
          break;
        case 'up':
          // Если у верхней границы, телепорт на нижнюю
          newHead = head - cols;
          if (newHead < 0) {
            newHead += totalCells; // newHead = head - cols + totalCells
          }
          break;
        case 'down':
          // Если у нижней границы, телепорт на верхнюю
          // Оператор остатка от деления (%) отлично справляется с этим
          newHead = (head + cols) % totalCells;
          break;
        default:
          // Этот случай не должен произойти
          newHead = head;
          break;
      }

      let newSnake: number[];

      if (newHead === food) {
        // Поедание: добавляем голову, не удаляем хвост, перемещаем еду
        newSnake = [newHead, ...prev];
        setFood(getRandomFreeCell(newSnake));
      } else {
        // Обычный ход: добавляем голову, обрезаем хвост
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
