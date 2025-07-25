'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function GridPage() {
  const [snake, setSnake] = useState<Array<number>>([10, 11, 12]);
  const [food, setFood] = useState<number>(15);

  // Размер сетки: количество строк и колонок
  const rows = 20;
  const cols = 20;
  console.log(Array.from({ length: rows * cols }).map((_, index) => index));

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
              snake.includes(index) ? 'bg-green-500' : '',
              food.includes(index) ? 'bg-red-500' : '',
            )}
          />
        ))}
      </div>
    </div>
  );
}
