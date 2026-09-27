import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PAYMENT_METHODS } from '@budget-app/shared';
import {
  useCreateTransaction,
  useUpdateTransaction,
} from '../hooks/useTransactions';
import Input from '../../../components/ui/Input/Input';
import Select from '../../../components/ui/Select/Select';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';
import { inputDate } from '../../../utils/formatDate';

const schema = z.object({
  amount: z
    .number({ invalid_type_error: 'Enter a number' })
    .positive('Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  note: z.string().max(300, 'Note is too long').optional(),
  paymentMethod: z.enum(Object.values(PAYMENT_METHODS)).default(PAYMENT_METHODS.OTHER),
});

// Used for both creating a new transaction (no `transaction` prop) and
// editing an existing one (`transaction` prop provided).
//
// monthId, potId, lineItemId — required to build the correct API endpoint.
export default function TransactionForm({
  monthId,
  potId,
  lineItemId,
  transaction,
  onSuccess,
}) {
  const isEditing = !!transaction;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: isEditing
      ? {
          amount:        transaction.amount,
          date:          inputDate(transaction.date),
          note:          transaction.note ?? '',
          paymentMethod: transaction.paymentMethod,
        }
      : {
          date:          inputDate(new Date()),
          paymentMethod: PAYMENT_METHODS.OTHER,
        },
  });

  const createMutation = useCreateTransaction(monthId, potId, lineItemId);
  const updateMutation = useUpdateTransaction(monthId, potId, lineItemId);
  const mutation = isEditing ? updateMutation : createMutation;

  useEffect(() => {
    if (!mutation.error) return;
    const code = mutation.error.response?.data?.error?.code;
    if (code === 'WRONG_TYPE') {
      setError('root', {
        message: 'Transactions can only be logged against Instant Spend line items.',
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
        { id: transaction._id, ...formData },
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
        label="Amount"
        type="number"
        inputMode="decimal"
        placeholder="0"
        autoFocus
        error={errors.amount?.message}
        {...register('amount', { valueAsNumber: true })}
      />

      <Input
        label="Date"
        type="date"
        error={errors.date?.message}
        {...register('date')}
      />

      <Select
        label="Payment method"
        error={errors.paymentMethod?.message}
        {...register('paymentMethod')}
      >
        <option value={PAYMENT_METHODS.OTHER}>Other</option>
        <option value={PAYMENT_METHODS.CARD}>Card</option>
        <option value={PAYMENT_METHODS.CASH}>Cash</option>
        <option value={PAYMENT_METHODS.EFT}>EFT</option>
      </Select>

      <Input
        label="Note (optional)"
        placeholder="What was this for?"
        error={errors.note?.message}
        {...register('note')}
      />

      <Button type="submit" loading={mutation.isPending}>
        {isEditing ? 'Save changes' : 'Log spend'}
      </Button>
    </form>
  );
}
