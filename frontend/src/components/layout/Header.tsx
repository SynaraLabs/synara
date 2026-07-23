import styles from './layout.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <h1>SYNARA</h1>

      <span>
        Tu asistente personal de salud
      </span>
    </header>
  );
}