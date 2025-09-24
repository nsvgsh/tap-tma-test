export default function ClickPage() {
  return (
    <html>
      <head>
        <title>Redirecting...</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h1>Redirecting...</h1>
          <p>Please wait while we redirect you to the app.</p>
        </div>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const urlParams = new URLSearchParams(window.location.search);
              const clickid = urlParams.get('clickid');
              
              if (!clickid) {
                window.location.href = '/';
                return;
              }

              // Log the click
              fetch('/api/v1/ad/click-log', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  clickid: clickid,
                  originalUrl: window.location.href,
                  queryParams: Object.fromEntries(urlParams.entries()),
                  userAgent: navigator.userAgent,
                  ipAddress: 'unknown',
                  redirectUrl: 'https://t.me/test_tma_213124214_bot/testtap?startapp=' + encodeURIComponent(clickid)
                }),
              }).then(response => {
                if (response.ok) {
                  console.log('Click logged successfully');
                }
              }).catch(error => {
                console.error('Failed to log click:', error);
              });

              // Redirect to Telegram bot
              window.location.href = 'https://t.me/test_tma_213124214_bot/testtap?startapp=' + encodeURIComponent(clickid);
            })();
          `
        }} />
      </body>
    </html>
  )
}
