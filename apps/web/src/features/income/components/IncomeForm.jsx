import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateIncome } from '../hooks/useIncome';
import Input from '../../../components/ui/Input/Input';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';

const schema = z.object({
  label: z
    .string()
    .min(1, 'Label is required')
    .max(100, 'Label is too long'),
  amount: z
    .number({ invalid_type_error: 'Enter a number' })
    .positive('Amount must be greater than 0'),
});

export default function IncomeForm({ monthId, onSuccess }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  const mutation = useCreateIncome(monthId);

  // Map API errors to field- or form-level messages.
  useEffect(() => {
    if (!mutation.error) return;
    const code = mutation.error.response?.data?.error?.code;
    if (code === 'MONTH_LOCKED') {
      setError('root', { message: 'This month is locked and cannot be edited.' });
    } else {
      setError('root', { message: 'Something went wrong. Please try again.' });
    }
  }, [mutation.error, setError]);

  const onSubmit = (formData) => {
    mutation.mutate(formData, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 12 }}>
      {errors.root && (
        <Alert variant="warn">{errors.root.message}</Alert>
      )}

      <Input
        label="Label"
        placeholder="e.g. Side hustle"
        autoFocus
        error={errors.label?.message}
        {...register('label')}
      />

      <Input
        label="Amount"
        type="number"
        inputMode="numeric"
        placeholder="0"
        error={errors.amount?.message}
        {...register('amount', { valueAsNumber: true })}
      />

      <Button type="submit" loading={mutation.isPending}>
        Add income source
      </Button>
    </form>
  );
}
