import { Icon } from './Icon';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="brand">
            <div className="icon-tile solid brand-mark">
              <Icon name="heartPulse" size={15} color="white" />
            </div>
            MediQueue
          </div>
          <p>
            Real-time clinic appointments and live queue tracking - book an
            exact time or join the queue and watch your wait update live.
          </p>
        </div>

        <div className="footer-col">
          <h4>Product</h4>
          <a href="/">Find a doctor</a>
          <a href="/register">Book an appointment</a>
          <a href="/login">Clinic staff login</a>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <a href="#">About MediQueue</a>
          <a href="#">Contact</a>
          <a href="#">Privacy</a>
        </div>

        <div className="footer-col">
          <h4>Credits</h4>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Visual identity by ARK II <Icon name="external" size={12} />
          </a>
          <a href="#">Built with Laravel + Next.js</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} MediQueue. A student portfolio project.</span>
        <a href="#">Design system by ARK II Studio</a>
      </div>
    </footer>
  );
}

export function MinimalFooter() {
  return (
    <footer style={{ textAlign: 'center', padding: '30px 20px', fontSize: 12, color: 'var(--muted)' }}>
      &copy; {new Date().getFullYear()} MediQueue
    </footer>
  );
}
