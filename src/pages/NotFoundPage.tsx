import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
export function NotFoundPage() { return <main className="not-found"><span>404</span><h1>This page wandered off.</h1><p>We couldn’t find the page you were looking for.</p><Link to="/dashboard" className="primary-btn"><ArrowLeft size={16}/> Back to dashboard</Link></main>; }
