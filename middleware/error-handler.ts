import { NextApiRequest, NextApiResponse } from 'next'
import { logger } from '../lib/logger'

export function errorHandler(err: any, req: NextApiRequest, res: NextApiResponse, next: () => void) {
  logger.error(err, { 
    url: req.url, 
    method: req.method,
    headers: req.headers
  })

  res.status(500).json({ message: 'Internal Server Error' })
}
