import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../hooks/useAuth';
import Input from '../../../components/ui/Input/Input';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';
import styles from './AuthForm.module.css';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

export default function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  const mutation = useForgotPasswordMutation();

  const onSubmit = (data) =>
    mutation.mutate(data.email, {
      onError: (err) =>
        setError('root', {
          message:
            err.response?.data?.error?.code === 'RATE_LIMITED'
              ? 'Too many requests. Try again later.'
              : 'Something went wrong. Please try again.',
        }),
    });

  if (mutation.isSuccess) {
    return (
      <div className={styles.form}>
        <Alert variant="ready">If that email has an account, a reset link is on its way.</Alert>
        <p className={styles.switchLink}>
          <Link to="/login">Back to log in</Link>
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      {errors.root && <Alert variant="warn">{errors.root.message}</Alert>}

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Button type="submit" loading={mutation.isPending}>
        Send reset link
      </Button>

      <p className={styles.switchLink}>
        <Link to="/login">Back to log in</Link>
      </p>
    </form>
  );
}
