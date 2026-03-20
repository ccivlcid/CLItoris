import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.js';
import ConnectForm from '../components/auth/ConnectForm.js';
import { useAuthStore } from '../stores/authStore.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkSession, isAuthenticated, isLoading } = useAuthStore();

  const errorParam = searchParams.get('error');

  // Redirect if already authenticated
  useEffect(() => {
    checkSession().then(() => {
      const auth = useAuthStore.getState();
      if (auth.isAuthenticated) {
        navigate('/', { replace: true });
      }
    });
  }, [checkSession, navigate]);

  // Redirect after successful session check
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  let errorMessage: string | null = null;
  if (errorParam === 'config')
    errorMessage = 'error: GITHUB_CLIENT_ID not set — add it to .env and restart the server';
  else if (errorParam === 'denied')
    errorMessage = 'error: github authorization denied — check that the OAuth App callback URL is http://localhost:3771/api/auth/github/callback';
  else if (errorParam === 'token_failed')
    errorMessage = 'error: token exchange failed — GITHUB_CLIENT_SECRET may be wrong or expired, regenerate it on github.com/settings/developers';
  else if (errorParam === 'no_code')
    errorMessage = 'error: no authorization code received from github';
  else if (errorParam === 'conflict') errorMessage = 'error: this github account is already linked (409)';
  else if (errorParam === 'state_mismatch') errorMessage = 'error: authorization state mismatch (400)';
  else if (errorParam === 'rate_limited') errorMessage = 'error: too many attempts. try again in 60s (429)';
  else if (errorParam === 'server_error') errorMessage = 'error: connection failed. please try again (500)';
  else if (errorParam) errorMessage = `error: ${errorParam}`;

  return (
    <AuthLayout>
      <ConnectForm errorFromCallback={errorMessage} />
    </AuthLayout>
  );
}
