import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | UniTrack',
  description: 'University management dashboard',
};

export default function Home() {
  redirect('/dashboard');
}