import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../services';
import { useAuthStore } from '../../store';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    async function processCallback() {
      try {
        // Check hash or search params for id_token or code
        const hash = location.hash ? location.hash.substring(1) : '';
        const search = location.search ? location.search.substring(1) : '';
        const params = new URLSearchParams(hash || search);

        const idToken = params.get('id_token') || params.get('credential');
        if (idToken) {
          const data = await authService.googleAuth(idToken);
          setAuth(data.user, data.access_token);
          toast.success('Signed in successfully! 👋');
          navigate('/dashboard', { replace: true });
          return;
        }

        // If no token in URL
        toast.error('Authentication cancelled or token missing');
        navigate('/login', { replace: true });
      } catch (err: any) {
        toast.error(err?.response?.data?.detail || 'Authentication failed');
        navigate('/login', { replace: true });
      }
    }
    processCallback();
  }, [location, navigate, setAuth]);

  return (
    <div className="page-container flex justify-center items-center" style={{ minHeight: '80vh' }}>
      <div className="card-3d text-center" style={{ padding: '3rem 2rem', maxWidth: '420px' }}>
        <div className="spinner mb-4" style={{ width: 44, height: 44, margin: '0 auto 1.5rem auto' }} />
        <h2 className="text-xl font-bold gradient-text">Completing Sign In...</h2>
        <p className="text-secondary text-sm mt-2">Securing your session and loading your curriculum dashboard.</p>
      </div>
    </div>
  );
}
