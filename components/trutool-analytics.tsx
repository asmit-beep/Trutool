'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const CONSENT_KEY = 'trutool_analytics_consent';
const SETTINGS_EVENT = 'trutool:analytics-settings';
type Consent = 'loading' | 'accepted' | 'declined' | 'unset';

/**
 * A lightweight, consent-gated GA4 tag. No code, cookies or requests to Google
 * are sent until a visitor explicitly accepts optional analytics.
 * Google Analytics Enhanced Measurement should track browser-history page changes.
 */
export function TruToolAnalytics({ measurementId }: { measurementId: string }) {
  const [consent, setConsent] = useState<Consent>('loading');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CONSENT_KEY);
      setConsent(stored === 'accepted' || stored === 'declined' ? stored : 'unset');
    } catch {
      setConsent('unset');
    }
    const open = () => setEditing(true);
    window.addEventListener(SETTINGS_EVENT, open);
    return () => window.removeEventListener(SETTINGS_EVENT, open);
  }, []);

  if (!/^G-[A-Z0-9]+$/.test(measurementId)) return null;

  function choose(value: 'accepted' | 'declined') {
    try { window.localStorage.setItem(CONSENT_KEY, value); } catch { /* storage disabled */ }
    // Once the script has loaded, a reload is needed to stop it running.
    if (value === 'declined' && consent === 'accepted') {
      window.location.reload();
      return;
    }
    setConsent(value);
    setEditing(false);
  }

  return <>
    {consent === 'accepted' && <>
      <Script id="trutool-ga4-config" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config',${JSON.stringify(measurementId)},{allow_google_signals:false,allow_ad_personalization_signals:false});`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
    </>}
    {(consent === 'unset' || editing) && <section role="region" aria-label="Optional analytics preferences"
      style={{position:'fixed',right:16,bottom:16,zIndex:100,width:'min(440px, calc(100vw - 32px))',
        background:'#151E2D',color:'#FFFFFF',border:'1px solid #465264',borderRadius:16,
        boxShadow:'0 12px 40px rgba(0,0,0,0.25)',padding:20,fontFamily:'Arial, sans-serif'}}>
      <strong style={{display:'block',fontSize:16,marginBottom:8}}>Help us improve TruTool?</strong>
      <p style={{fontSize:14,lineHeight:1.5,margin:'0 0 14px'}}>
        With your permission, Google Analytics helps us understand which pages are useful.
        Optional analytics is off unless you accept. See our <a href="/cookies"
          style={{color:'#D6EF82',textDecoration:'underline'}}>cookie policy</a>.
      </p>
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        <button type="button" onClick={() => choose('accepted')}
          style={{background:'#D6EF82',color:'#151E2D',border:0,borderRadius:8,
            padding:'10px 16px',fontSize:14,fontWeight:700,cursor:'pointer'}}>Allow analytics</button>
        <button type="button" onClick={() => choose('declined')}
          style={{background:'transparent',color:'#FFFFFF',border:'1px solid #B6C1CF',
            borderRadius:8,padding:'10px 16px',fontSize:14,cursor:'pointer'}}>No, thanks</button>
      </div>
    </section>}
  </>;
}

/** Let visitors revisit analytics consent without requiring a browser reset. */
export function AnalyticsSettings() {
  return <button type="button"
    onClick={() => window.dispatchEvent(new Event(SETTINGS_EVENT))}
    style={{border:'1px solid currentColor',borderRadius:8,padding:'8px 12px',
      background:'transparent',color:'inherit',font: 'inherit',cursor:'pointer'}}>
    Change analytics preferences
  </button>;
}
