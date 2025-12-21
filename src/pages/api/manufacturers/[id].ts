import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { withAuth, AuthUser } from '@/lib/auth'

async function handler(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
    const { method, query } = req
    const id = query.id as string

    switch (method) {
        case 'PUT':
            const { name, contact_person, phone, email, address, color } = req.body
            const { data: updatedManufacturer, error: updateError } = await supabase
                .from('manufacturers')
                .update({ name, contact_person, phone, email, address, color })
                .eq('id', id)
                .select()
                .single()

            if (updateError) return res.status(500).json({ error: updateError.message })
            return res.status(200).json(updatedManufacturer)

        case 'DELETE':
            const { error: deleteError } = await supabase
                .from('manufacturers')
                .delete()
                .eq('id', id)

            if (deleteError) return res.status(500).json({ error: deleteError.message })
            return res.status(204).end()

        default:
            res.setHeader('Allow', ['PUT', 'DELETE'])
            return res.status(405).end(`Method ${method} Not Allowed`)
    }
}


export default withAuth(handler)
