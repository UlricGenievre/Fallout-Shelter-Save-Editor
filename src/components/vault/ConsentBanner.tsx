import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Shield, Info } from 'lucide-react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const ConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si un choix a déjà été fait
    const consent = localStorage.getItem('vault_consent_status');
    if (!consent) {
      setIsVisible(true);
    } else if (consent === 'granted') {
      updateConsent(true);
    }
  }, []);

  const updateConsent = (granted: boolean) => {
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': granted ? 'granted' : 'denied',
        'ad_storage': granted ? 'granted' : 'denied',
        'ad_user_data': granted ? 'granted' : 'denied',
        'ad_personalization': granted ? 'granted' : 'denied'
      });
    }
  };

  const handleConsent = (granted: boolean) => {
    localStorage.setItem('vault_consent_status', granted ? 'granted' : 'denied');
    updateConsent(granted);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="max-w-4xl mx-auto bg-black border-2 border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.2)] rounded-lg overflow-hidden backdrop-blur-md">
        <div className="bg-primary/20 px-4 py-2 border-b border-primary/30 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-display text-primary">Vault-Tec Privacy Protocol V.2.0</span>
        </div>
        
        <div className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 space-y-2">
            <h3 className="text-primary font-display text-lg tracking-wider flex items-center gap-2">
              <Info className="w-5 h-5" />
              MONITORING INITIALIZATION
            </h3>
            <p className="text-primary/70 text-sm leading-relaxed font-mono">
              To improve the Vault-Tec Save Editor experience, we would like to monitor anonymous usage statistics. 
              This data helps our Overseers optimize the recruitment process and resource management. 
              <span className="text-primary block mt-1 italic">Do you allow transmission of telemetry data to Vault-Tec HQ?</span>
            </p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={() => handleConsent(false)}
              className="flex-1 md:w-32 border-primary/30 text-primary/60 hover:bg-red-900/20 hover:text-red-400 hover:border-red-500/50 transition-all font-display tracking-widest text-xs uppercase"
            >
              DECLINE
            </Button>
            <Button 
              onClick={() => handleConsent(true)}
              className="flex-1 md:w-32 bg-primary/20 hover:bg-primary/40 text-primary border border-primary/50 transition-all font-display tracking-widest text-xs uppercase shadow-[0_0_10px_rgba(var(--primary),0.3)]"
            >
              AUTHORIZE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
