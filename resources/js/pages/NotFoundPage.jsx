import { Link } from 'react-router-dom';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="not-found-page container">
      <div className="not-found-card">
        <p className="not-found-code">404</p>
        <h1 className="not-found-title">Page not found</h1>
        <p className="not-found-text">
          Sorry, the page you're looking for doesn't exist or may have moved.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">Go to home page</Link>
        </div>
      </div>
    </div>
  );
}
