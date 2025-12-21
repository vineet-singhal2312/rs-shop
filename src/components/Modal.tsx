import React, { ReactNode } from 'react'
import styles from './Modal.module.css'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null

    return (
        <div className={styles.overlay} onClick={onClose}>
            {/* Stop propagation to prevent closing when clicking inside modal */}
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>&times;</button>
                <h2 className={styles.title}>{title}</h2>
                {children}
            </div>
        </div>
    )
}
