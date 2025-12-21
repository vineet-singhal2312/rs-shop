import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from './supabase'

export interface AuthUser {
    id: string
    username: string
}

// Verify token and return user
export async function verifyAuth(req: NextApiRequest): Promise<AuthUser | null> {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
        return null
    }

    try {
        // Token format: base64(username:timestamp:signature)
        const decoded = Buffer.from(token, 'base64').toString('utf-8')
        const [username, timestamp] = decoded.split(':')

        // Check if token is expired (24 hours)
        const tokenAge = Date.now() - parseInt(timestamp)
        if (tokenAge > 24 * 60 * 60 * 1000) {
            return null
        }

        // Verify user exists
        const { data, error } = await supabase
            .from('users')
            .select('id, username')
            .eq('username', username)
            .single()

        if (error || !data) {
            return null
        }

        return data
    } catch (error) {
        return null
    }
}

// Middleware to protect API routes
export function withAuth(handler: (req: NextApiRequest, res: NextApiResponse, user: AuthUser) => Promise<any>) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const user = await verifyAuth(req)

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        return handler(req, res, user)
    }
}

// Generate token
export function generateToken(username: string): string {
    const timestamp = Date.now().toString()
    const tokenData = `${username}:${timestamp}`
    return Buffer.from(tokenData).toString('base64')
}
