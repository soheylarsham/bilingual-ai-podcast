/**
 * Cloudflare Worker for WordPress
 *
 * This worker receives podcast data and creates a new post on a WordPress site.
 *
 * Required secrets (Cloudflare Worker settings -> Variables):
 * - WP_URL: The base URL of your WordPress site (e.g., https://example.com).
 * - WP_USERNAME: Your WordPress admin username.
 * - WP_APP_PASSWORD: A generated Application Password for your user.
 * - WORKER_SECRET: A secret key you define to authenticate requests to this worker.
 */

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method !== 'POST') {
    return new Response('Expected POST', { status: 405 });
  }

  // --- Security Check ---
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${WORKER_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const podcast = await request.json();

    // --- Prepare WordPress Post Content ---
    const title = podcast.settings?.topic || 'New Podcast Episode';
    
    // Create HTML content for the post
    let content = `<!-- wp:heading --><h2>${escapeHtml(title)}</h2><!-- /wp:heading -->`;

    if (podcast.thumbnailBase64s && podcast.thumbnailBase64s.length > 0) {
        // NOTE: WordPress REST API cannot directly upload base64 images without a more complex
        // multipart request. A simple solution is to embed the image, though this is not ideal for performance.
        // A better solution would be to upload the image to the media library first, then use its ID.
        content += `<!-- wp:image --><figure class="wp-block-image"><img src="${podcast.thumbnailBase64s[0]}" alt="${escapeHtml(title)}"/></figure><!-- /wp:image -->`;
    }

    content += `<!-- wp:paragraph --><p>${podcast.transcript.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p><!-- /wp:paragraph -->`;
    
    const postData = {
      title: title,
      content: content,
      status: 'publish', // or 'draft'
    };

    // --- Authentication for WordPress REST API ---
    // We use Basic Auth with the username and application password.
    const credentials = btoa(`${WP_USERNAME}:${WP_APP_PASSWORD}`);
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`,
    };

    // --- Send to WordPress ---
    const apiUrl = `${WP_URL.replace(/\/$/, '')}/wp-json/wp/v2/posts`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postData),
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WordPress API Error: ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();

    return new Response(JSON.stringify({ success: true, message: 'Posted to WordPress.', postLink: responseData.link }), {
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

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}