import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import { useResetPasswordMutation } from '../hooks/useAuth';
import Input from '../../../components/ui/Input/Input';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';
import styles from './AuthForm.module.css';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .max(128, 'Password is too long')
      .regex(/[a-zA-Z]/, 'Include a letter')
      .regex(/[0-9]/, 'Include a number'),
    confirm: z.string().min(1, 'Confirm your password'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

export default function ResetPasswordForm() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  const mutation = useResetPasswordMutation();

  const onSubmit = (data) =>
    mutation.mutate(
      { token, password: data.password },
      {
        onError: (err) => {
          const code = err.response?.data?.error?.code;
          setError('root', {
            message:
              code === 'TOKEN_INVALID' || code === 'VALIDATION_ERROR'
                ? 'This reset link is invalid or has expired.'
                : code === 'RATE_LIMITED'
                  ? 'Too many attempts. Try again later.'
                  : 'Something went wrong. Please try again.',
          });
        },
      }
    );

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return (
      <div className={styles.form}>
        <Alert variant="warn">This reset link is invalid or has expired.</Alert>
        <p className={styles.switchLink}>
          <Link to="/forgot-password">Get a new link</Link>
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      {errors.root && (
        <Alert variant="warn">
          {errors.root.message}{' '}
          {errors.root.message.includes('expired') && (
            <Link to="/forgot-password">Get a new link</Link>
          )}
        </Alert>
      )}

      <Input
        label="New password"
        type="password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        error={errors.confirm?.message}
        {...register('confirm')}
      />

      <Button type="submit" loading={mutation.isPending}>
        Set new password
      </Button>
    </form>
  );
}
