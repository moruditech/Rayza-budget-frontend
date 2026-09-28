import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LINE_ITEM_TYPES } from '@budget-app/shared';
import { useTransfer } from '../hooks/useLineItems';
import { useMonth } from '../../months/hooks/useMonth';
import Modal from '../../../components/ui/Modal/Modal';
import Input from '../../../components/ui/Input/Input';
import Select from '../../../components/ui/Select/Select';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';
import { formatCurrency } from '../../../utils/formatCurrency';
import styles from './MarkUsedModal.module.css';

// Move money from this sinking fund into another one (any pot, same month).
// The source balance goes down, the destination goes up, and both funds get
// an entry in Activity. Pot budgets are unchanged.
export default function TransferModal({ lineItem, monthId, onClose }) {
  const balance = lineItem.accumulatedBalance ?? 0;
  const { data: month } = useMonth(monthId);

  const destinations = useMemo(
    () =>
      (month?.pots ?? []).flatMap((p) =>
        (p.lineItems ?? [])
          .filter((li) => li.type === LINE_ITEM_TYPES.SINKING_FUND && li._id !== lineItem._id)
          .map((li) => ({ ...li, potName: p.name }))
      ),
    [month, lineItem._id]
  );

  const schema = z.object({
    toLineItemId: z.string().min(1, 'Choose a fund'),
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
  } = useForm({ resolver: zodResolver(schema), defaultValues: { toLineItemId: '' } });

  const mutation = useTransfer(monthId);

  useEffect(() => {
    if (!mutation.error) return;
    const code = mutation.error.response?.data?.error?.code;
    if (code === 'AMOUNT_EXCEEDS_BALANCE') {
      setError('amount', { message: 'Amount exceeds the fund balance.' });
    } else if (code === 'SAME_FUND') {
      setError('toLineItemId', { message: 'Choose a different fund.' });
    } else if (code === 'MONTH_LOCKED') {
      setError('root', { message: 'This month is locked.' });
    } else {
      setError('root', { message: 'Something went wrong. Please try again.' });
    }
  }, [mutation.error, setError]);

  const onSubmit = (formData) => {
    mutation.mutate(
      { fromLineItemId: lineItem._id, ...formData },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal title={`Move money — ${lineItem.name}`} onClose={onClose}>
      {destinations.length === 0 ? (
        <p className={styles.balance}>
          You need another sinking fund in this month to move money into.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 12 }}>
          {errors.root && <Alert variant="warn">{errors.root.message}</Alert>}

          <p className={styles.balance}>
            Available: <strong>{formatCurrency(balance)}</strong>
          </p>

          <Select label="Move to" error={errors.toLineItemId?.message} {...register('toLineItemId')}>
            <option value="">Select a fund…</option>
            {destinations.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} · {d.potName} · {formatCurrency(d.accumulatedBalance ?? 0)}
              </option>
            ))}
          </Select>

          <Input
            label="Amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="0"
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />

          <Input
            label="Note (optional)"
            error={errors.note?.message}
            {...register('note')}
          />

          <Button type="submit" loading={mutation.isPending}>
            Move money
          </Button>
        </form>
      )}
    </Modal>
  );
}
