import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { withAuth, AuthUser } from '@/lib/auth'

async function handler(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
    const { method } = req

    switch (method) {
        case 'GET':
            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 10
            const search = req.query.search as string || ''
            const manufacturer_id = req.query.manufacturer_id as string || ''

            const from = (page - 1) * limit
            const to = from + limit - 1

            let query = supabase
                .from('items')
                .select(`
                    *,
                    manufacturer:manufacturers!inner(name, color)
                `, { count: 'exact' })
                .order('name', { ascending: true })
                .range(from, to)

            if (search) {
                const terms = search.trim().split(/\s+/).filter(Boolean)

                for (const term of terms) {
                    let orConditions = `name.ilike.%${term}%,code.ilike.%${term}%,category.ilike.%${term}%`

                    // Find manufacturers matching this specific term
                    const { data: foundManufs } = await supabase
                        .from('manufacturers')
                        .select('id')
                        .ilike('name', `%${term}%`)

                    if (foundManufs && foundManufs.length > 0) {
                        const manufIds = foundManufs.map(m => m.id).join(',')
                        orConditions += `,manufacturer_id.in.(${manufIds})`
                    }

                    query = query.or(orConditions)
                }
            }

            if (manufacturer_id && manufacturer_id !== 'all') {
                query = query.eq('manufacturer_id', manufacturer_id)
            }

            const { data: items, count, error: fetchError } = await query

            if (fetchError) return res.status(500).json({ error: fetchError.message })

            return res.status(200).json({
                data: items,
                pagination: {
                    page,
                    limit,
                    total: count,
                    totalPages: count ? Math.ceil(count / limit) : 0
                }
            })

        case 'POST':
            const { name, code, category, buying_price, selling_price, unit, manufacturer_id: manufId } = req.body

            const { data: newItem, error: createError } = await supabase
                .from('items')
                .insert([{ name, code, category, buying_price, selling_price, unit, manufacturer_id: manufId }])
                .select()
                .single()

            if (createError) return res.status(500).json({ error: createError.message })
            return res.status(201).json(newItem)

        default:
            res.setHeader('Allow', ['GET', 'POST'])
            return res.status(405).end(`Method ${method} Not Allowed`)
    }
}


export default withAuth(handler)
