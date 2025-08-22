
import { projectStorage } from './analyze-project';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const apiKey = url.searchParams.get('apiKey');

  if (!apiKey) {
    return Response.json({ error: 'API key is required' }, { status: 400 });
  }

  const functionMap = projectStorage.get(apiKey);

  if (!functionMap) {
    return Response.json({ error: 'Invalid API key' }, { status: 404 });
  }

  // Set CORS headers for cross-origin requests
  return Response.json(functionMap, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function OPTIONS() {
  // Handle preflight requests
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
