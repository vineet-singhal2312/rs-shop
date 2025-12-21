import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { withAuth, AuthUser } from '@/lib/auth'

async function handler(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
    const { method } = req

    switch (method) {
        case 'GET':
            const { data: manufacturers, error: fetchError } = await supabase
                .from('manufacturers')
                .select('*')
                .order('name', { ascending: true })

            if (fetchError) return res.status(500).json({ error: fetchError.message })
            return res.status(200).json(manufacturers)

        case 'POST':
            const { name, contact_person, phone, email, address, color } = req.body
            if (!name) return res.status(400).json({ error: 'Name is required' })

            const { data: newManufacturer, error: createError } = await supabase
                .from('manufacturers')
                .insert([{ name, contact_person, phone, email, address, color }])
                .select()
                .single()

            if (createError) return res.status(500).json({ error: createError.message })
            return res.status(201).json(newManufacturer)

        default:
            res.setHeader('Allow', ['GET', 'POST'])
            return res.status(405).end(`Method ${method} Not Allowed`)
    }
}


export default withAuth(handler)
