import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  
  return (
    
    <header className={styles.headerContainer}>

      <Link href="/">
        <div className={styles.headerContent}>
          <img src="/images/logo.svg" alt="logo" />
        </div>
      </Link>

    </header>
  );
}
