import Link from 'next/link';

export default function Home() {
  return (
    <div className='flex h-screen flex-col items-center justify-items-center gap-16 bg-neutral-50 p-4 dark:bg-neutral-600'>
      <h1 className='mb-4 text-2xl'>Snake Game</h1>
      <Link href='/grid' className='rounded bg-blue-500 px-4 py-2 text-white'>
        Grid
      </Link>
    </div>
  );
}
