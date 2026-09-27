import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'react-router-dom';
import { useLoginMutation } from '../hooks/useAuth';
import Input from '../../../components/ui/Input/Input';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';
import styles from './AuthForm.module.css';

const schema = z.object({
  email:    z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginForm() {
  const location = useLocation();
  const justRegistered = location.state?.registered === true;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  const mutation = useLoginMutation();

  // Map API error codes to field-level or form-level errors.
  useEffect(() => {
    if (!mutation.error) return;
    const code = mutation.error.response?.data?.error?.code;
    if (code === 'INVALID_CREDENTIALS') {
      setError('root', { message: 'Email or password is incorrect.' });
    } else if (code === 'RATE_LIMITED') {
      setError('root', { message: 'Too many attempts. Try again in a moment.' });
    } else {
      setError('root', { message: 'Something went wrong. Please try again.' });
    }
  }, [mutation.error, setError]);

  return (
    <form className={styles.form} onSubmit={handleSubmit((d) => mutation.mutate(d))}>
      {justRegistered && (
        <Alert variant="ready">Account created — log in to get started.</Alert>
      )}

      {errors.root && (
        <Alert variant="warn">{errors.root.message}</Alert>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Your password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" loading={mutation.isPending}>
        Log in
      </Button>

      <p className={styles.switchLink}>
        No account?{' '}
        <Link to="/register">Create one</Link>
      </p>
    </form>
  );
}
