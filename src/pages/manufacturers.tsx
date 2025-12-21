import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import styles from './rates.module.css' // Reusing rates styles for consistency
// Curated color palette for manufacturer badges
const COLOR_PALETTE = [
    '#ef4444', // Red
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#f97316', // Orange
    '#6366f1', // Indigo
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#a855f7'  // Purple
]

interface Manufacturer {
    id: string
    name: string
    contact_person?: string
    phone?: string
    email?: string
    address?: string
    color?: string
}

export default function Manufacturers() {
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        color: '#6b7280'
    })

    useEffect(() => {
        fetchManufacturers()
    }, [])

    const fetchManufacturers = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/manufacturers')
            if (res.ok) setManufacturers(await res.json())
        } catch (error) {
            console.error('Failed to fetch manufacturers', error)
        } finally {
            setLoading(false)
        }
    }

    const getRandomUniqueColor = () => {
        const usedColors = manufacturers.map(m => m.color).filter(Boolean)
        const availableColors = COLOR_PALETTE.filter(c => !usedColors.includes(c))
        const colorPool = availableColors.length > 0 ? availableColors : COLOR_PALETTE
        return colorPool[Math.floor(Math.random() * colorPool.length)]
    }

    const openCreateModal = () => {
        setEditingManufacturer(null)
        const randomColor = getRandomUniqueColor()
        setFormData({ name: '', contact_person: '', phone: '', email: '', address: '', color: randomColor })
        setIsModalOpen(true)
    }

    const openEditModal = (manuf: Manufacturer) => {
        setEditingManufacturer(manuf)
        setFormData({
            name: manuf.name,
            contact_person: manuf.contact_person || '',
            phone: manuf.phone || '',
            email: manuf.email || '',
            address: manuf.address || '',
            color: manuf.color || '#6b7280'
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this manufacturer?')) return
        try {
            const res = await fetch(`/api/manufacturers/${id}`, { method: 'DELETE' })
            if (res.ok) fetchManufacturers()
        } catch (error) {
            console.error('Failed to delete manufacturer', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingManufacturer
                ? `/api/manufacturers/${editingManufacturer.id}`
                : '/api/manufacturers'

            const method = editingManufacturer ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setIsModalOpen(false)
                fetchManufacturers()
            }
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <Layout title="Manufacturers">
            <div className={styles.controls}>
                <h1 style={{ margin: 0 }}>Manufacturers</h1>
                <div className={styles.actionButtons}>
                    <button className={`${styles.button} ${styles.primaryButton}`} onClick={openCreateModal}>
                        + Add Manufacturer
                    </button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact Person</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Address</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {manufacturers.map(m => (
                                <tr key={m.id}>
                                    <td data-label="Name">
                                        <span
                                            style={{
                                                backgroundColor: m.color || '#6b7280',
                                                color: 'white',
                                                padding: '0.35rem 0.75rem',
                                                borderRadius: '999px',
                                                fontSize: '1rem',
                                                fontWeight: 600
                                            }}
                                        >
                                            {m.name}
                                        </span>
                                    </td>
                                    <td data-label="Contact Person">{m.contact_person || '-'}</td>
                                    <td data-label="Phone">{m.phone || '-'}</td>
                                    <td data-label="Email">{m.email || '-'}</td>
                                    <td data-label="Address">{m.address || '-'}</td>
                                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className={`${styles.actionBtn} ${styles.editBtn}`}
                                            onClick={() => openEditModal(m)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                            onClick={() => handleDelete(m.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingManufacturer ? "Edit Manufacturer" : "Add Manufacturer"}
            >
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Company Name</label>
                        <input required className={styles.input} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Contact Person</label>
                        <input className={styles.input} value={formData.contact_person} onChange={e => setFormData({ ...formData, contact_person: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Phone</label>
                        <input className={styles.input} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email</label>
                        <input type="email" className={styles.input} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Address</label>
                        <input className={styles.input} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Badge Color</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input
                                type="color"
                                value={formData.color}
                                onChange={e => setFormData({ ...formData, color: e.target.value })}
                                style={{ height: '40px', width: '60px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.9rem', color: '#666' }}>Pick a color for the manufacturer badge</span>
                        </div>
                    </div>
                    <button type="submit" className={`${styles.button} ${styles.primaryButton} ${styles.submitButton}`}>
                        {editingManufacturer ? 'Update Manufacturer' : 'Create Manufacturer'}
                    </button>
                </form>
            </Modal>
        </Layout>
    )
}

