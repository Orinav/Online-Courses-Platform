function Footer() {
  return (
    <footer style={{ backgroundColor: '#111827', color: '#9ca3af', padding: '30px 20px', textAlign: 'center', borderTop: '1px solid #374151' }}>
      <div style={{ marginBottom: '15px', fontSize: '24px', fontWeight: '900' }}>
        <span style={{ color: '#60a5fa' }}>Cours</span><span style={{ color: 'white' }}>ori</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '25px', marginBottom: '20px', fontSize: '14px' }}>
        <span style={{ cursor: 'pointer' }}>תנאי שימוש</span>
        <span style={{ cursor: 'pointer' }}>מדיניות פרטיות</span>
        <span style={{ cursor: 'pointer' }}>צור קשר</span>
        <span style={{ cursor: 'pointer' }}>אודותינו</span>
      </div>
      <div style={{ fontSize: '13px', color: '#6b7280' }}>
        © 2026 Coursori. כל הזכויות שמורות. נבנה באהבה למען למידה.
      </div>
    </footer>
  );
}

export default Footer;