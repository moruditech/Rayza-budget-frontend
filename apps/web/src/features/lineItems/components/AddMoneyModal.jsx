import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDeposit } from '../hooks/useLineItems';
import Modal from '../../../components/ui/Modal/Modal';
import Input from '../../../components/ui/Input/Input';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';
import { formatCurrency } from '../../../utils/formatCurrency';
import styles from './MarkUsedModal.module.css';

// Invest what is left in the pot straight into this sinking fund — no need to
// create a new line item. It is a one-off top-up for this month: the money
// leaves the pot's remaining budget and lands in the fund balance now, but is
// not repeated next month (only the fund's normal allocation is).
export default function AddMoneyModal({ lineItem, pot, monthId, defaultAmount, onClose }) {
  const remaining = Math.max(0, pot.remaining ?? 0);

  const schema = z.object({
    amount: z
      .number({ invalid_type_error: 'Enter a number' })
      .positive('Amount must be greater than 0')
      .max(remaining, `Only ${formatCurrency(remaining)} is left in ${pot.name}`),
    note: z.string().max(300, 'Note is too long').optional(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultAmount != null ? { amount: defaultAmount } : undefined,
  });

  const mutation = useDeposit(monthId, pot._id);

  useEffect(() => {
    if (!mutation.error) return;
    const code = mutation.error.response?.data?.error?.code;
    if (code === 'ALLOCATION_EXCEEDED') {
      setError('amount', { message: 'That is more than what is left in this pot.' });
    } else if (code === 'MONTH_LOCKED') {
      setError('root', { message: 'This month is locked.' });
    } else {
      setError('root', { message: 'Something went wrong. Please try again.' });
    }
  }, [mutation.error, setError]);

  const onSubmit = (formData) => {
    mutation.mutate({ id: lineItem._id, ...formData }, { onSuccess: onClose });
  };

  return (
    <Modal title={`Add money — ${lineItem.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 12 }}>
        {errors.root && <Alert variant="warn">{errors.root.message}</Alert>}

        <p className={styles.balance}>
          Left in {pot.name}: <strong>{formatCurrency(remaining)}</strong>{' '}
          <button
            type="button"
            onClick={() => setValue('amount', remaining, { shouldValidate: true })}
            style={{ all: 'unset', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}
          >
            Use all
          </button>
        </p>

        <Input
          label="Amount to invest"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0"
          autoFocus
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />

        <Input
          label="Note (optional)"
          placeholder="e.g. Leftover from August"
          error={errors.note?.message}
          {...register('note')}
        />

        <Button type="submit" loading={mutation.isPending}>
          Add to {lineItem.name}
        </Button>
      </form>
    </Modal>
  );
}
