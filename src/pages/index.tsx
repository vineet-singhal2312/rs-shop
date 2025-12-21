import Link from 'next/link'
import Layout from '@/components/Layout'
import styles from './index.module.css'

export default function Home() {
    return (
        <Layout title="Dashboard - Shop Management System">
            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>Welcome Back</h1>
                <p className={styles.heroSubtitle}>Manage your shop inventory, rates, and suppliers efficiently.</p>
            </div>

            <div className={styles.grid}>
                <Link href="/rates" className={styles.card}>
                    <h2 className={styles.cardTitle}>Rates & Inventory</h2>
                    <p className={styles.cardDescription}>
                        Manage item prices, profit margins, and supplier catalogues. Global search and filtering enabled.
                    </p>
                    <span className={styles.cardAction}>Go to Rates &rarr;</span>
                </Link>

                {/* Placeholders for future features */}
                <div className={styles.card} style={{ opacity: 0.7 }}>
                    <h2 className={styles.cardTitle}>Reports (Coming Soon)</h2>
                    <p className={styles.cardDescription}>
                        View sales analytics, profit reports, and inventory turnover stats.
                    </p>
                    <span className={styles.cardAction}>View Reports &rarr;</span>
                </div>

                <div className={styles.card} style={{ opacity: 0.7 }}>
                    <h2 className={styles.cardTitle}>Settings (Coming Soon)</h2>
                    <p className={styles.cardDescription}>
                        Configure shop details, user management, and system preferences.
                    </p>
                    <span className={styles.cardAction}>Manage Settings &rarr;</span>
                </div>
            </div>
        </Layout>
    )
}
