/**
 * Cloudflare Worker for Generic Webhook
 *
 * This worker acts as a secure forwarder. It receives data, validates a secret,
 * and then forwards the data to a final destination URL you control.
 * This is useful for integrating with services like Zapier or your own custom API.
 *
 * Required secrets (Cloudflare Worker settings -> Variables):
 * - DESTINATION_URL: The final URL to which the data should be POSTed.
 * - WORKER_SECRET: A secret key you define to authenticate requests to this worker.
 *                  This key will also be passed to your destination URL.
 */

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method !== 'POST') {
    return new Response('Expected POST', { status: 405 });
  }

  // --- Security Check ---
  // Authenticate the request coming from the app
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${WORKER_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const podcastData = await request.json();

    // --- Forward the request to the destination URL ---
    
    // Prepare new headers for the forwarded request.
    // We'll pass along the secret in the Authorization header so your
    // destination server can also validate the request.
    const forwardHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WORKER_SECRET}`,
    };

    const response = await fetch(DESTINATION_URL, {
      method: 'POST',
      headers: forwardHeaders,
      body: JSON.stringify(podcastData),
    });

    // Check if the forward was successful
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Destination server responded with status ${response.status}: ${errorText}`);
    }

    // Return a success response to the original caller (the app)
    return new Response(JSON.stringify({ success: true, message: 'Webhook forwarded successfully.' }), {
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