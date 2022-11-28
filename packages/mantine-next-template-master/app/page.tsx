'use client';

import { Welcome } from '../components/Welcome/Welcome';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Demo } from './demo';
import Search from '../../react/src/components/Search';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <Welcome />
      <Link href="/search">Search page</Link>
      <ColorSchemeToggle />
      <Demo />
    </>
  );
}
