'use client';

import Script from 'next/script';

export default function GoogleAnalytics() {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-0W0WQY9CTF"
        strategy="afterInteractive"
        crossOrigin="anonymous"
        nonce="google-analytics"
      />
      <Script id="google-analytics" strategy="afterInteractive" nonce="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-0W0WQY9CTF');
        `}
      </Script>
    </>
  );
} 