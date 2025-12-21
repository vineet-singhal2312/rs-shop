import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'
import { generateToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { username, password } = req.body

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' })
        }

        // Fetch user from database
        const { data: user, error } = await supabase
            .from('users')
            .select('id, username, password_hash')
            .eq('username', username)
            .single()

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash)

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        // Generate token
        const token = generateToken(user.username)

        res.status(200).json({
            token,
            user: {
                id: user.id,
                username: user.username
            }
        })
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}
