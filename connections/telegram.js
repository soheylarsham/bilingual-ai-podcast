/**
 * Cloudflare Worker for Telegram Bot
 *
 * This worker securely receives podcast data and posts it to a specified Telegram channel.
 *
 * Required secrets (Cloudflare Worker settings -> Variables):
 * - BOT_TOKEN: Your Telegram Bot's API token from @BotFather.
 * - CHAT_ID: The ID of your target Telegram channel (e.g., -1001234567890).
 * - WORKER_SECRET: A secret key you define to authenticate requests to this worker.
 */

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Only accept POST requests
  if (request.method !== 'POST') {
    return new Response('Expected POST', { status: 405 });
  }

  // --- Security Check ---
  // Check for the secret in the Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${WORKER_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const podcast = await request.json();

    // --- Prepare Content for Telegram ---
    const title = podcast.settings?.topic || 'New Podcast Episode';
    const transcriptSnippet = podcast.transcript ? podcast.transcript.substring(0, 700) + '...' : 'Listen to the full episode!';
    const thumbnailUrl = podcast.thumbnailBase64s && podcast.thumbnailBase64s.length > 0 ? podcast.thumbnailBase64s[0] : null;

    let caption = `<b>${escapeHtml(title)}</b>\n\n`;
    caption += `${escapeHtml(transcriptSnippet)}`;

    const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}`;

    // --- Send to Telegram ---
    // If there's a thumbnail, send it as a photo with a caption.
    // Otherwise, send a plain text message.
    if (thumbnailUrl) {
      // Telegram Bot API requires the image to be sent via URL or multipart/form-data.
      // A data URL needs to be converted to a blob to be sent.
      const imageResponse = await fetch(thumbnailUrl);
      const imageBlob = await imageResponse.blob();
      
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('photo', imageBlob, 'thumbnail.jpg');
      formData.append('caption', caption);
      formData.append('parse_mode', 'HTML');

      const response = await fetch(`${apiUrl}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Telegram API (sendPhoto) Error: ${JSON.stringify(errorData)}`);
      }
    } else {
      const response = await fetch(`${apiUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: caption,
          parse_mode: 'HTML',
        }),
      });

       if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Telegram API (sendMessage) Error: ${JSON.stringify(errorData)}`);
      }
    }
    
    // --- Respond to the caller ---
    return new Response(JSON.stringify({ success: true, message: 'Posted to Telegram.' }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Worker Error:', error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Helper function to escape HTML special characters for Telegram's HTML parse_mode
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}