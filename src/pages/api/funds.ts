import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Your logic to fetch funds data
    const fundsData = await getFundsData();
    res.status(200).json(fundsData);
  } catch (error) {
    console.error('Error fetching funds data:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}