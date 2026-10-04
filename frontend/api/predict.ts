// api/predict.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const endpointId = process.env.RUNPOD_ENDPOINT_ID;
  const apiKey = process.env.RUNPOD_API_KEY;

  if (!endpointId || !apiKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!req.body?.input) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  try {
    const runpodResponse = await axios.post(
      `https://api.runpod.ai/v2/${endpointId}/runsync`,
      { input: req.body.input },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 90000,
      }
    );

    return res.status(200).json(runpodResponse.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const errorData = error.response?.data || { error: error.message };
    return res.status(status).json(errorData);
  }
}