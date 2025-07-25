'use client';

export default function GridPage() {
  // Размер сетки: количество строк и колонок
  const rows = 20;
  const cols = 20;

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
            className='border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
          />
        ))}
      </div>
    </div>
  );
}
