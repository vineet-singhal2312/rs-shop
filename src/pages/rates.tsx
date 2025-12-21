import { useState, useEffect, useMemo } from 'react'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import { authFetch } from '@/lib/authFetch'
import styles from './rates.module.css'

interface Manufacturer {
    id: string
    name: string
    contact_person?: string
    phone?: string
    email?: string
    address?: string
}

interface Item {
    id: string
    code?: string
    name: string
    category: string
    buying_price: number
    selling_price: number
    unit: string
    manufacturer_id?: string
    manufacturer?: { name: string, color?: string }
}

interface PaginatedResponse {
    data: Item[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export default function Rates() {
    const [items, setItems] = useState<Item[]>([])
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [activeTab, setActiveTab] = useState<string>('all') // 'all' or manufacturer_id

    // Pagination State
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [totalCount, setTotalCount] = useState(0)

    // Modal States
    const [isItemModalOpen, setIsItemModalOpen] = useState(false)
    const [isManufModalOpen, setIsManufModalOpen] = useState(false)

    const [editingItem, setEditingItem] = useState<Item | null>(null)

    // Form States
    const [newItem, setNewItem] = useState({
        name: '',
        code: '',
        category: '',
        buying_price: '',
        selling_price: '',
        unit: 'pcs',
        manufacturer_id: ''
    })
    const [newManuf, setNewManuf] = useState({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: ''
    })

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500)
        return () => clearTimeout(timer)
    }, [search])

    // Fetch data when dependencies change
    useEffect(() => {
        fetchItems()
    }, [page, debouncedSearch, activeTab])

    // Initial fetch for manufacturers
    useEffect(() => {
        fetchManufacturers()
    }, [])

    const fetchManufacturers = async () => {
        try {
            const res = await authFetch('/api/manufacturers')
            if (res.ok) setManufacturers(await res.json())
        } catch (error) {
            console.error('Failed to fetch manufacturers', error)
        }
    }

    const fetchItems = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search: debouncedSearch,
                manufacturer_id: activeTab
            })
            const res = await authFetch(`/api/items?${params}`)
            if (res.ok) {
                const data: PaginatedResponse = await res.json()
                setItems(data.data)
                setTotalPages(data.pagination.totalPages)
                setTotalCount(data.pagination.total)
            }
        } catch (error) {
            console.error('Failed to fetch items', error)
        } finally {
            setLoading(false)
        }
    }

    const openCreateItemModal = () => {
        setEditingItem(null)
        setNewItem({ name: '', code: '', category: '', buying_price: '', selling_price: '', unit: 'pcs', manufacturer_id: activeTab !== 'all' ? activeTab : '' })
        setIsItemModalOpen(true)
    }

    const openEditItemModal = (item: Item) => {
        setEditingItem(item)
        setNewItem({
            name: item.name,
            code: item.code || '',
            category: item.category,
            buying_price: item.buying_price.toString(),
            selling_price: item.selling_price.toString(),
            unit: item.unit,
            manufacturer_id: item.manufacturer_id || ''
        })
        setIsItemModalOpen(true)
    }

    const handleDeleteItem = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return
        try {
            const res = await authFetch(`/api/items/${id}`, { method: 'DELETE' })
            if (res.ok) fetchItems()
        } catch (error) {
            console.error('Failed to delete item', error)
        }
    }

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingItem ? `/api/items/${editingItem.id}` : '/api/items'
            const method = editingItem ? 'PUT' : 'POST'

            const res = await authFetch(url, {
                method,
                body: JSON.stringify(newItem)
            })
            if (res.ok) {
                setIsItemModalOpen(false)
                setNewItem({ name: '', code: '', category: '', buying_price: '', selling_price: '', unit: 'pcs', manufacturer_id: '' })
                fetchItems()
            }
        } catch (err) {
            console.error(err)
        }
    }


    const handleCreateManufacturer = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await authFetch('/api/manufacturers', {
                method: 'POST',
                body: JSON.stringify(newManuf)
            })
            if (res.ok) {
                setIsManufModalOpen(false)
                setNewManuf({ name: '', contact_person: '', phone: '', email: '', address: '' })
                fetchManufacturers() // Refresh manufacturers list
            }
        } catch (err) {
            console.error(err)
        }
    }

    // Removed client-side filtering useMemo since we do it backend side now

    const calculateProfit = (buy: number, sell: number) => {
        if (buy === 0) return 0
        return ((sell - buy) / buy) * 100
    }

    const getUnitBadgeClass = (unit: string) => {
        if (unit === 'kg' || unit === 'g') return styles.badgeKg
        if (unit.includes('pc')) return styles.badgePcs
        return styles.badgeDefault
    }



    return (
        <Layout title="Rates & Inventory">
            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder="Search items..."
                    className={styles.searchBar}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className={styles.actionButtons}>
                    <button className={`${styles.button} ${styles.secondaryButton}`} onClick={() => setIsManufModalOpen(true)}>
                        + Manufacturer
                    </button>
                    {activeTab !== 'all' && (
                        <button
                            className={`${styles.button} ${styles.primaryButton}`}
                            onClick={() => {
                                setNewItem(prev => ({ ...prev, manufacturer_id: activeTab }))
                                openCreateItemModal()
                            }}
                        >
                            + Add Item
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
                    onClick={() => { setActiveTab('all'); setPage(1) }}
                >
                    All Items
                </button>
                {manufacturers.map(m => (
                    <button
                        key={m.id}
                        className={`${styles.tab} ${activeTab === m.id ? styles.activeTab : ''}`}

                        onClick={() => { setActiveTab(m.id); setPage(1) }}
                    >
                        {m.name}
                    </button>
                ))}
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Manufacturer</th>
                                <th>Buying Price</th>
                                <th>Selling Price</th>
                                <th>Profit %</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => {
                                const profit = calculateProfit(Number(item.buying_price), Number(item.selling_price))
                                return (
                                    <tr key={item.id}>
                                        <td data-label="Item">
                                            <div style={{ fontWeight: 500 }}>{item.name}</div>
                                            {item.code && <div style={{ fontSize: '0.8rem', color: '#666' }}>Code: {item.code}</div>}
                                        </td>
                                        <td data-label="Category">{item.category}</td>
                                        <td data-label="Manufacturer">
                                            {item.manufacturer ? (
                                                <span
                                                    style={{
                                                        backgroundColor: item.manufacturer.color || '#6b7280',
                                                        color: 'white',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '999px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 600,
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {item.manufacturer.name}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td data-label="Buying Price">
                                            ${Number(item.buying_price).toFixed(2)}
                                            <span className={`${styles.badge} ${getUnitBadgeClass(item.unit)}`}>{item.unit}</span>
                                        </td>
                                        <td data-label="Selling Price">
                                            ${Number(item.selling_price).toFixed(2)}
                                            <span className={`${styles.badge} ${getUnitBadgeClass(item.unit)}`}>{item.unit}</span>
                                        </td>
                                        <td data-label="Profit" className={profit >= 0 ? styles.profitPositive : styles.profitNegative}>
                                            {profit.toFixed(1)}%
                                        </td>
                                        <td style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className={`${styles.actionBtn} ${styles.editBtn}`}
                                                onClick={() => openEditItemModal(item)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                onClick={() => handleDeleteItem(item.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No items found.</td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                )}
                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className={styles.pageButton}
                        >
                            Previous
                        </button>
                        <span>Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className={styles.pageButton}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Item Modal */}
            <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title={editingItem ? "Edit Item" : "Add New Item"}>
                <form onSubmit={handleCreateItem}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Name</label>
                        <input required className={styles.input} value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Item Code</label>
                        <input className={styles.input} value={newItem.code} onChange={e => setNewItem({ ...newItem, code: e.target.value })} placeholder="E.g. SKU-123" />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Category</label>
                        <input required className={styles.input} value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Unit</label>
                        <select
                            className={styles.select}
                            value={newItem.unit}
                            onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                        >
                            <option value="pcs">Pieces (pcs)</option>
                            <option value="kg">Kilogram (kg)</option>
                            <option value="g">Gram (g)</option>
                            <option value="l">Liter (l)</option>
                            <option value="ml">Milliliter (ml)</option>
                            <option value="m">Meter (m)</option>
                            <option value="sqm">Square Meter (sqm)</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Manufacturer</label>
                        <select
                            className={styles.select}
                            value={newItem.manufacturer_id}
                            onChange={e => setNewItem({ ...newItem, manufacturer_id: e.target.value })}
                            disabled={activeTab !== 'all'} // Disable if specific tab selected
                        >
                            <option value="">Select Manufacturer</option>
                            {manufacturers.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label className={styles.label}>Buying Price</label>
                            <input required type="number" step="0.01" className={styles.input} value={newItem.buying_price} onChange={e => setNewItem({ ...newItem, buying_price: e.target.value })} />
                        </div>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label className={styles.label}>Selling Price</label>
                            <input required type="number" step="0.01" className={styles.input} value={newItem.selling_price} onChange={e => setNewItem({ ...newItem, selling_price: e.target.value })} />
                        </div>
                    </div>
                    <button type="submit" className={`${styles.button} ${styles.primaryButton} ${styles.submitButton}`}>
                        {editingItem ? 'Update Item' : 'Create Item'}
                    </button>
                </form>
            </Modal>

            {/* Manufacturer Modal */}
            <Modal isOpen={isManufModalOpen} onClose={() => setIsManufModalOpen(false)} title="Add Manufacturer">
                <form onSubmit={handleCreateManufacturer}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Company Name</label>
                        <input required className={styles.input} value={newManuf.name} onChange={e => setNewManuf({ ...newManuf, name: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Contact Person</label>
                        <input className={styles.input} value={newManuf.contact_person} onChange={e => setNewManuf({ ...newManuf, contact_person: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Phone</label>
                        <input className={styles.input} value={newManuf.phone} onChange={e => setNewManuf({ ...newManuf, phone: e.target.value })} />
                    </div>
                    <button type="submit" className={`${styles.button} ${styles.primaryButton} ${styles.submitButton}`}>Create Manufacturer</button>
                </form>
            </Modal>
        </Layout >
    )
}
