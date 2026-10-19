import { useState, useEffect, type FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from 'features/auth/context/AuthContext';
import { login as loginService } from 'features/auth/services/authService';
import AuthLayout from 'components/layout/AuthLayout';
import { Field } from 'components/form/Field';
import { PasswordInput } from 'components/form/PasswordInput';
import { Checkbox } from 'components/form/Checkbox';
import { Button } from 'components/ui/Button';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
      return;
    }

    // Si venimos de una sesión expirada (401/403), mostramos un mensaje claro.
    const sessionExpiredFlag = localStorage.getItem('sessionExpired');
    if (sessionExpiredFlag === '1') {
      toast.error('Tu sesión ha expirado. Vuelve a iniciar sesión.');
      localStorage.removeItem('sessionExpired');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);

    try {
      const authResponse = await loginService({ username, password });
      login(authResponse);
      toast.success(`Bienvenido, ${authResponse.username}`);
    } catch (error) {
      let errorMessage = 'No se pudo iniciar sesión. Inténtalo de nuevo en unos instantes.';

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseMessage = error.response?.data?.message;

        if (status === 401 || status === 403) {
          errorMessage = 'Usuario o contraseña incorrectos. Verifica tus datos.';
        } else if (typeof responseMessage === 'string' && responseMessage.trim().length > 0) {
          errorMessage = responseMessage;
        }
      }

      setLoginError(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-layout__content">
        <h1 className="auth-layout__title">Bienvenido</h1>
        <p className="auth-layout__subtitle">Inicia sesión para acceder al sistema</p>

        {loginError && (
          <div className="auth-layout__error" role="alert">
            <AlertCircle className="auth-layout__error-icon" aria-hidden="true" />
            <span>{loginError}</span>
          </div>
        )}

        <form className="auth-layout__form" onSubmit={handleSubmit}>
          <Field id="username" label="Usuario" required>
            {(control) => (
              <input
                {...control}
                type="text"
                placeholder="usuario"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (loginError) setLoginError(null);
                }}
                autoComplete="username"
                required
              />
            )}
          </Field>

          <Field id="password" label="Contraseña" required>
            {(control) => (
              <PasswordInput
                {...control}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (loginError) setLoginError(null);
                }}
                autoComplete="current-password"
                required
              />
            )}
          </Field>

          <Checkbox
            id="remember"
            label="Recordar sesión en este equipo"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />

          <Button type="submit" className="auth-layout__submit" loading={loading}>
            {loading ? 'Iniciando sesión...' : (
              <>
                Iniciar sesión
                <ArrowRight className="auth-layout__submit-arrow" aria-hidden="true" />
              </>
            )}
          </Button>
        </form>

        <p className="auth-layout__footer">
          Acceso restringido a personal autorizado de Proveedorio.
          Las actividades son monitoreadas.
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
