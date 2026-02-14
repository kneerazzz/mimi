"use client";

import Image from 'next/image';
import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/favicon-16x16.png"
        alt="Mimi"
        width={30}
        height={30}
        className='rounded-full cursor-pointer'
      />
      <span className="text-[16px] font-bold text-white">Mimi</span>
    </Link>
  );
};

export default Logo;
