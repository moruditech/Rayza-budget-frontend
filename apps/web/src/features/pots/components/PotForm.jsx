import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { POT_TYPES } from '@budget-app/shared';
import { useCreatePot, useUpdatePot } from '../hooks/usePots';
import Input from '../../../components/ui/Input/Input';
import Select from '../../../components/ui/Select/Select';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';

const schema = z.object({
  name:        z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  type:        z.enum(Object.values(POT_TYPES), { errorMap: () => ({ message: 'Select a type' }) }),
  budgetLimit: z
    .number({ invalid_type_error: 'Enter a number' })
    .positive('Budget limit must be greater than 0'),
});

// Renders for both create (no `pot` prop) and edit (`pot` prop provided).
export default function PotForm({ monthId, pot, onSuccess }) {
  const isEditing = !!pot;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: pot
      ? { name: pot.name, type: pot.type, budgetLimit: pot.budgetLimit }
      : { type: POT_TYPES.SPENDING },
  });

  const createMutation = useCreatePot(monthId);
  const updateMutation = useUpdatePot(monthId);
  const mutation = isEditing ? updateMutation : createMutation;

  useEffect(() => {
    if (!mutation.error) return;
    const code = mutation.error.response?.data?.error?.code;
    if (code === 'BUDGET_EXCEEDED') {
      setError('budgetLimit', {
        message: 'This would push total allocations over your monthly income.',
      });
    } else if (code === 'MONTH_LOCKED') {
      setError('root', { message: 'This month is locked.' });
    } else {
      setError('root', { message: 'Something went wrong. Please try again.' });
    }
  }, [mutation.error, setError]);

  const onSubmit = (formData) => {
    if (isEditing) {
      mutation.mutate(
        { id: pot._id, ...formData },
        { onSuccess: () => { reset(); onSuccess?.(); } }
      );
    } else {
      mutation.mutate(formData, {
        onSuccess: () => { reset(); onSuccess?.(); },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 12 }}>
      {errors.root && <Alert variant="warn">{errors.root.message}</Alert>}

      <Input
        label="Name"
        placeholder="e.g. Groceries"
        autoFocus
        error={errors.name?.message}
        {...register('name')}
      />

      <Select
        label="Type"
        error={errors.type?.message}
        {...register('type')}
      >
        <option value={POT_TYPES.SPENDING}>Spending</option>
        <option value={POT_TYPES.SAVING}>Saving</option>
        <option value={POT_TYPES.INVESTMENT}>Investment</option>
      </Select>

      <Input
        label="Budget limit"
        type="number"
        inputMode="numeric"
        placeholder="0"
        error={errors.budgetLimit?.message}
        {...register('budgetLimit', { valueAsNumber: true })}
      />

      <Button type="submit" loading={mutation.isPending}>
        {isEditing ? 'Save changes' : 'Add pot'}
      </Button>
    </form>
  );
}
