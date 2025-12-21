import Head from 'next/head'
import Link from 'next/link'
import { ReactNode, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from './Layout.module.css'

interface LayoutProps {
    children: ReactNode
    title?: string
}

export default function Layout({ children, title = 'Shop Management System' }: LayoutProps) {
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [username, setUsername] = useState<string>('')

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('auth_token')
        const user = localStorage.getItem('user')

        if (!token || !user) {
            router.push('/login')
            return
        }

        try {
            const userData = JSON.parse(user)
            setUsername(userData.username)
        } catch (error) {
            router.push('/login')
        }
    }, [router])

    const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen)
    const closeMenu = () => setMobileMenuOpen(false)

    const handleLogout = () => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        router.push('/login')
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>{title}</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <header className={styles.header}>
                <div className={styles.logo}>
                    <Link href="/" onClick={closeMenu}>ShopManager</Link>
                </div>

                {/* Hamburger Button */}
                <button
                    className={styles.hamburger}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span className={mobileMenuOpen ? styles.hamburgerOpen : ''}></span>
                    <span className={mobileMenuOpen ? styles.hamburgerOpen : ''}></span>
                    <span className={mobileMenuOpen ? styles.hamburgerOpen : ''}></span>
                </button>

                {/* Desktop Nav */}
                <nav className={styles.nav}>
                    <Link href="/" className={styles.navLink}>Dashboard</Link>
                    <Link href="/rates" className={styles.navLink}>Rates</Link>
                    <Link href="/manufacturers" className={styles.navLink}>Manufacturers</Link>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        Logout ({username})
                    </button>
                </nav>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className={styles.mobileMenuOverlay} onClick={closeMenu}>
                    <nav className={styles.mobileNav} onClick={(e) => e.stopPropagation()}>
                        <Link href="/" className={styles.mobileNavLink} onClick={closeMenu}>
                            📊 Dashboard
                        </Link>
                        <Link href="/rates" className={styles.mobileNavLink} onClick={closeMenu}>
                            💰 Rates
                        </Link>
                        <Link href="/manufacturers" className={styles.mobileNavLink} onClick={closeMenu}>
                            🏭 Manufacturers
                        </Link>
                        <button
                            onClick={() => { closeMenu(); handleLogout(); }}
                            className={styles.mobileLogoutBtn}
                        >
                            🚪 Logout ({username})
                        </button>
                    </nav>
                </div>
            )}

            <main className={styles.main}>{children}</main>
            <footer className={styles.footer}>
                <span>© {new Date().getFullYear()} Shop Management System</span>
            </footer>
        </div>
    )
}
