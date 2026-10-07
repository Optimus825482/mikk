'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RehberRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ayarlar?tab=kilavuz');
  }, [router]);

  return (
    <div className="max-w-md mx-auto py-16 text-center text-slate-500 font-medium">
      Kullanım Kılavuzu & Hakkında sayfasına yönlendiriliyorsunuz...
    </div>
  );
}
