import { withBcAppCspHeaders } from '~/lib/content-security-policy';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function bcAppHtmlResponse(title: string, body: string, redirectTo?: string): Response {
  const redirectScript = redirectTo
    ? `<script>window.location.replace(${JSON.stringify(redirectTo)});</script>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      body {
        margin: 0;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #faf8f5;
        color: #2c2a26;
      }
      .wrap {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
      }
      .card {
        width: min(480px, 100%);
        border: 1px solid #e5dfd5;
        border-radius: 16px;
        background: #fff;
        padding: 24px;
        box-shadow: 0 8px 24px rgba(44, 42, 38, 0.06);
      }
      h1 {
        margin: 0 0 8px;
        font-size: 1.25rem;
      }
      p {
        margin: 0;
        line-height: 1.5;
        color: #6b6560;
      }
    </style>
    ${redirectScript}
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <h1>${escapeHtml(title)}</h1>
        ${body}
      </div>
    </div>
  </body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: withBcAppCspHeaders({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    }),
  });
}
