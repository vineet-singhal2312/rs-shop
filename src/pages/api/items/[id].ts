import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { withAuth, AuthUser } from '@/lib/auth'

async function handler(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
    const { method, query } = req
    const id = query.id as string

    switch (method) {
        case 'PUT':
            const { name, code, category, buying_price, selling_price, unit, manufacturer_id } = req.body
            const { data: updatedItem, error: updateError } = await supabase
                .from('items')
                .update({ name, code, category, buying_price, selling_price, unit, manufacturer_id })
                .eq('id', id)
                .select()
                .single()

            if (updateError) return res.status(500).json({ error: updateError.message })
            return res.status(200).json(updatedItem)

        case 'DELETE':
            const { error: deleteError } = await supabase
                .from('items')
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
