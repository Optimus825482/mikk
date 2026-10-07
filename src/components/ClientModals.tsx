'use client';

import { useState } from 'react';
import PwaInstallPrompt from './PwaInstallPrompt';
import AboutModal from './AboutModal';

export default function ClientModals() {
  const [showAbout, setShowAbout] = useState(false);

  const handleInstallClosed = () => {
    // Sadece kullanıcı "bir daha gösterme" demediyse aç
    if (typeof window !== 'undefined') {
      const hidePref = localStorage.getItem('milkiq_hide_about_modal');
      if (hidePref === 'true') {
        return;
      }
    }
    setShowAbout(true);
  };

  return (
    <>
      <PwaInstallPrompt onClosed={handleInstallClosed} />
      <AboutModal forceOpen={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}
