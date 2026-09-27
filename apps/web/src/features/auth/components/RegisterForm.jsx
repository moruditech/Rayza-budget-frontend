import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useRegisterMutation } from '../hooks/useAuth';
import Input from '../../../components/ui/Input/Input';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';
import styles from './AuthForm.module.css';

const schema = z.object({
  name:     z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email:    z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long'),
});

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  const mutation = useRegisterMutation();

  useEffect(() => {
    if (!mutation.error) return;
    const code = mutation.error.response?.data?.error?.code;
    if (code === 'DUPLICATE') {
      setError('email', { message: 'An account with this email already exists.' });
    } else {
      setError('root', { message: 'Something went wrong. Please try again.' });
    }
  }, [mutation.error, setError]);

  return (
    <form className={styles.form} onSubmit={handleSubmit((d) => mutation.mutate(d))}>
      {errors.root && (
        <Alert variant="warn">{errors.root.message}</Alert>
      )}

      <Input
        label="Name"
        type="text"
        placeholder="Your name"
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />

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
        placeholder="At least 8 characters"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" loading={mutation.isPending}>
        Create account
      </Button>

      <p className={styles.switchLink}>
        Already have an account?{' '}
        <Link to="/login">Log in</Link>
      </p>
    </form>
  );
}
