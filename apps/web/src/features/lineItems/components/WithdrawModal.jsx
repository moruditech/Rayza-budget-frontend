import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWithdraw } from '../hooks/useLineItems';
import Modal from '../../../components/ui/Modal/Modal';
import Input from '../../../components/ui/Input/Input';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';
import { formatCurrency } from '../../../utils/formatCurrency';
import styles from './MarkUsedModal.module.css';

// Withdraw from a sinking fund at any time — the target does not need to
// have been reached. Buying something with the money? Add a note; it shows
// up in Activity as a spend and the fund balance drops by the same amount.
export default function WithdrawModal({ lineItem, potId, monthId, onClose }) {
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
    setValue,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  const mutation = useWithdraw(monthId, potId);

  useEffect(() => {
    if (!mutation.error) return;
    const code = mutation.error.response?.data?.error?.code;
    if (code === 'AMOUNT_EXCEEDS_BALANCE') {
      setError('amount', { message: 'Amount exceeds the fund balance.' });
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
    <Modal title={`Withdraw — ${lineItem.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 12 }}>
        {errors.root && <Alert variant="warn">{errors.root.message}</Alert>}

        <p className={styles.balance}>
          Balance: <strong>{formatCurrency(balance)}</strong>{' '}
          <button
            type="button"
            onClick={() => setValue('amount', balance, { shouldValidate: true })}
            style={{ all: 'unset', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}
          >
            Use all
          </button>
        </p>

        <Input
          label="Amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0"
          autoFocus
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />

        <Input
          label="What is it for? (optional)"
          placeholder="e.g. House plan"
          error={errors.note?.message}
          {...register('note')}
        />

        <Button type="submit" loading={mutation.isPending}>
          Withdraw
        </Button>
      </form>
    </Modal>
  );
}
