import './Footer.css';

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-logo">
        <span className="footer-logo-blue">Cours</span>
        <span className="footer-logo-white">ori</span>
      </div>
      <div className="footer-links">
        <span className="footer-link">תנאי שימוש</span>
        <span className="footer-link">מדיניות פרטיות</span>
        <span className="footer-link">צור קשר</span>
        <span className="footer-link">אודותינו</span>
      </div>
      <div className="footer-copyright">
        © 2026 Coursori. כל הזכויות שמורות. נבנה באהבה למען למידה.
      </div>
    </footer>
  );
}

export default Footer;