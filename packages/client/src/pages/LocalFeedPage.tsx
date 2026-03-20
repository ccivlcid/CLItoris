import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Local feed is now integrated into GlobalFeedPage as a tab.
// This page redirects for backwards compatibility.
export default function LocalFeedPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);
  return null;
}
