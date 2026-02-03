export function generateEmailTemplate({ brandName, brandUrl, brandColor, logoUrl, title, message, ctaText, ctaLink }) {
  return `
  <!DOCTYPE html>
  <html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      :root {
        color-scheme: light dark;
        supported-color-schemes: light dark;
      }
      body {
        margin: 0;
        padding: 0;
        background-color: #0E0E0E;
        font-family: Arial, sans-serif;
      }
      .wrapper {
        max-width: 600px;
        margin: auto;
        background-color: #0E0E0E;
        color: #EAEAEA;
        padding: 20px;
      }
      .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #2A2A2A; }
      .logo { width: 150px; margin-bottom: 10px; }
      .title { color: ${brandColor}; font-size: 22px; font-weight: bold; }
      .content {
        background-color: #1A1A1A; border-radius: 10px; padding: 25px; margin-top: 20px;
        font-size: 15px; line-height: 1.7;
      }
      .button {
        display: inline-block; background-color: ${brandColor}; color: #0E0E0E !important;
        padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;
        margin: 25px auto; text-align: center;
      }
      .footer { text-align: center; margin-top: 25px; font-size: 12px; color: #888; }

      @media (prefers-color-scheme: light) {
        body { background-color: #FAFAFA; color: #222; }
        .wrapper { background-color: #FFFFFF; color: #333; }
        .content { background-color: #F3F3F3; color: #222; }
      }
      @media only screen and (max-width: 600px) {
        .wrapper { padding: 15px; }
        .title { font-size: 18px; }
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <img src="${logoUrl}" alt="${brandName}" class="logo" />
        <h1 class="title">${title}</h1>
      </div>
      <div class="content">
        ${message}
        <div style="text-align:center;">
          <a href="${ctaLink}" class="button">${ctaText}</a>
        </div>
        <p style="margin-top: 20px;">Met vriendelijke groet,<br /><strong>Het ${brandName} Team</strong></p>
      </div>
      <div class="footer">
        <p>${brandName} · Strategische Groei door Inzicht</p>
        <p><a href="${brandUrl}" style="color: ${brandColor}; text-decoration: none;">${brandUrl}</a></p>
      </div>
    </div>
  </body>
  </html>`;
}

