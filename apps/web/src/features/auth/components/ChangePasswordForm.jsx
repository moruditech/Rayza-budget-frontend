import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import authService from '../../../services/auth.service';
import Input from '../../../components/ui/Input/Input';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';
import styles from './ChangePasswordForm.module.css';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword:     z
      .string()
      .min(8,  'New password must be at least 8 characters')
      .max(72, 'Password is too long'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path:    ['confirmPassword'],
  });

export default function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({ mutationFn: authService.changePassword });

  useEffect(() => {
    if (!mutation.error) return;
    const code = mutation.error.response?.data?.error?.code;
    if (code === 'INVALID_CREDENTIALS') {
      setError('currentPassword', { message: 'Current password is incorrect.' });
    } else {
      setError('root', { message: 'Something went wrong. Please try again.' });
    }
  }, [mutation.error, setError]);

  const onSubmit = ({ currentPassword, newPassword }) => {
    mutation.mutate(
      { currentPassword, newPassword },
      { onSuccess: () => reset() }
    );
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
    >
      {mutation.isSuccess && (
        <Alert variant="ready">Password updated successfully.</Alert>
      )}
      {errors.root && (
        <Alert variant="warn">{errors.root.message}</Alert>
      )}

      <Input
        label="Current password"
        type="password"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />

      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />

      <Input
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" loading={mutation.isPending}>
        Update password
      </Button>
    </form>
  );
}
