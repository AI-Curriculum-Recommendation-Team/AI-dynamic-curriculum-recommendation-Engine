import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../services';
import { useAuthStore } from '../../store';
import './GoogleAuthButton.css';

declare global {
  interface Window {
    google?: any;
    gapi?: any;
  }
}

interface Props {
  mode: 'login' | 'register';
}

export default function GoogleAuthButton({ mode }: Props) {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '537093897734-ngnvo1o5803et4ap92j3fj01vnqv6jqs.apps.googleusercontent.com';
  const GOOGLE_CLIENT_ID = rawClientId.trim().replace(/^['"]|['"]$/g, '');

  const handleCredentialResponse = async (response: { credential: string }) => {
    if (!response?.credential) {
      toast.error('Google sign-in did not return credentials');
      return;
    }
    setLoading(true);
    try {
      const data = await authService.googleAuth(response.credential);
      setAuth(data.user, data.access_token);
      toast.success(mode === 'register' ? 'Account created with Google! 🎉' : 'Signed in with Google! 👋');
      navigate(mode === 'register' ? '/profile' : '/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Google sign-in failed on server');
    } finally {
      setLoading(false);
    }
  };

  // Load Google Identity Services SDK
  useEffect(() => {
    const existingScript = document.getElementById('google-jssdk');
    if (existingScript) {
      if (window.google?.accounts?.id) {
        setGisLoaded(true);
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-jssdk';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        setGisLoaded(true);
      }
    };
    script.onerror = () => {
      console.warn('Google Identity Services script failed to load');
    };
    document.body.appendChild(script);
  }, []);

  // Initialize and render Google button when GIS is ready
  useEffect(() => {
    if (gisLoaded && window.google?.accounts?.id && googleBtnContainerRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render official GIS button — always "Continue with Google"
        googleBtnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'continue_with',
          logo_alignment: 'left',
          width: 380,
        });
      } catch (err) {
        console.error('Google button render error:', err);
      }
    }
  }, [gisLoaded, mode, GOOGLE_CLIENT_ID]);

  return (
    <div className="google-auth-wrapper">
      {/* Official Google Identity "Continue with Google" button */}
      <div 
        ref={googleBtnContainerRef} 
        className="gis-btn-container" 
        style={{ minHeight: '44px', display: 'flex', justifyContent: 'center' }} 
      />

      {loading && (
        <div className="flex justify-center mt-2">
          <div className="spinner" />
        </div>
      )}
    </div>
  );
}
