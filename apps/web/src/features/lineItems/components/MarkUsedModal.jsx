import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMarkUsed } from '../hooks/useLineItems';
import Modal from '../../../components/ui/Modal/Modal';
import Input from '../../../components/ui/Input/Input';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';
import { formatCurrency } from '../../../utils/formatCurrency';
import styles from './MarkUsedModal.module.css';

export default function MarkUsedModal({ lineItem, potId, monthId, onClose }) {
  const balance = lineItem.accumulatedBalance ?? 0;

  const schema = z.object({
    amount: z
      .number({ invalid_type_error: 'Enter a number' })
      .positive('Amount must be greater than 0')
      .max(balance, `Cannot exceed the balance of ${formatCurrency(balance)}`),
    note: z.string().max(300, 'Note is too long').optional(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: balance },
  });

  const mutation = useMarkUsed(monthId, potId);

  useEffect(() => {
    if (!mutation.error) return;
    const code = mutation.error.response?.data?.error?.code;
    if (code === 'NOT_READY') {
      setError('root', { message: 'This sinking fund has not reached its target yet.' });
    } else if (code === 'AMOUNT_EXCEEDS_BALANCE') {
      setError('amount', { message: 'Amount exceeds the accumulated balance.' });
    } else if (code === 'MONTH_LOCKED') {
      setError('root', { message: 'This month is locked.' });
    } else {
      setError('root', { message: 'Something went wrong. Please try again.' });
    }
  }, [mutation.error, setError]);

  const onSubmit = (formData) => {
    mutation.mutate(
      { id: lineItem._id, ...formData },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal title="Mark as used" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 12 }}>
        {errors.root && <Alert variant="warn">{errors.root.message}</Alert>}

        <p className={styles.balance}>
          Balance: <strong>{formatCurrency(balance)}</strong>
        </p>

        <Input
          label="Amount"
          type="number"
          inputMode="numeric"
          placeholder="0"
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />

        <Input
          label="Note (optional)"
          placeholder="What was it for?"
          error={errors.note?.message}
          {...register('note')}
        />

        <Button type="submit" loading={mutation.isPending}>
          Confirm
        </Button>
      </form>
    </Modal>
  );
}
