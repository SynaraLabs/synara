import styles from './layout.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div>
        <h1>SYNARA</h1>

        <span>
          Tu espacio personal de salud
        </span>
      </div>
    </header>
  );
}