import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRecordInterest } from '../hooks/useLineItems';
import Modal from '../../../components/ui/Modal/Modal';
import Input from '../../../components/ui/Input/Input';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';
import { formatCurrency } from '../../../utils/formatCurrency';
import styles from './MarkUsedModal.module.css';

const schema = z.object({
  amount: z
    .number({ invalid_type_error: 'Enter a number' })
    .positive('Amount must be greater than 0'),
  note: z.string().max(300, 'Note is too long').optional(),
});

// Log interest the bank really paid into this fund. It is added to the
// balance and to the running "interest earned" total, and is compared with
// what the fund's rate predicted. It is new money: the pot's budget is not
// touched.
export default function RecordInterestModal({ lineItem, potId, monthId, onClose }) {
  const balance = lineItem.accumulatedBalance ?? 0;
  const expected = (balance * (lineItem.annualInterestRate ?? 0)) / 100 / 12;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  const mutation = useRecordInterest(monthId, potId);

  useEffect(() => {
    if (!mutation.error) return;
    const code = mutation.error.response?.data?.error?.code;
    setError('root', {
      message:
        code === 'MONTH_LOCKED'
          ? 'This month is locked.'
          : 'Something went wrong. Please try again.',
    });
  }, [mutation.error, setError]);

  const onSubmit = (formData) => {
    mutation.mutate({ id: lineItem._id, ...formData }, { onSuccess: onClose });
  };

  return (
    <Modal title={`Record interest — ${lineItem.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 12 }}>
        {errors.root && <Alert variant="warn">{errors.root.message}</Alert>}

        <p className={styles.balance}>
          At {lineItem.annualInterestRate}% p.a. on {formatCurrency(balance)}, one month
          should pay about <strong>R {expected.toFixed(2)}</strong>.{' '}
          <button
            type="button"
            onClick={() => setValue('amount', Number(expected.toFixed(2)), { shouldValidate: true })}
            style={{ all: 'unset', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}
          >
            Use this
          </button>
        </p>

        <Input
          label="Interest the bank paid"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          autoFocus
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />

        <Input
          label="Note (optional)"
          placeholder="e.g. October interest"
          error={errors.note?.message}
          {...register('note')}
        />

        <Button type="submit" loading={mutation.isPending}>
          Record interest
        </Button>
      </form>
    </Modal>
  );
}
