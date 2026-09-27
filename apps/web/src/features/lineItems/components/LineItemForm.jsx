import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LINE_ITEM_TYPES } from '@budget-app/shared';
import { useCreateLineItem, useUpdateLineItem } from '../hooks/useLineItems';
import Input from '../../../components/ui/Input/Input';
import Select from '../../../components/ui/Select/Select';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';
import styles from './LineItemForm.module.css';

// Base schema — sinking fund fields are validated conditionally via superRefine.
const schema = z
  .object({
    name:               z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    type:               z.enum(Object.values(LINE_ITEM_TYPES)),
    allocatedAmount:    z
      .number({ invalid_type_error: 'Enter a number' })
      .positive('Must be greater than 0'),
    isRecurring:        z.boolean().optional().default(false),
    targetAmount:       z
      .number({ invalid_type_error: 'Enter a number' })
      .positive()
      .optional(),
    monthlyContribution: z
      .number({ invalid_type_error: 'Enter a number' })
      .positive()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === LINE_ITEM_TYPES.SINKING_FUND) {
      if (!data.targetAmount) {
        ctx.addIssue({
          code: 'custom',
          path: ['targetAmount'],
          message: 'Target amount is required for a sinking fund',
        });
      }
      if (!data.monthlyContribution) {
        ctx.addIssue({
          code: 'custom',
          path: ['monthlyContribution'],
          message: 'Monthly contribution is required for a sinking fund',
        });
      }
    }
  });

export default function LineItemForm({ monthId, potId, lineItem, onSuccess }) {
  const isEditing = !!lineItem;

  // Track type separately so we can show/hide sinking fund fields reactively
  // without waiting for RHF to re-validate.
  const [itemType, setItemType] = useState(
    lineItem?.type ?? LINE_ITEM_TYPES.INSTANT_SPEND
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: lineItem
      ? {
          name:                lineItem.name,
          type:                lineItem.type,
          allocatedAmount:     lineItem.allocatedAmount,
          isRecurring:         lineItem.isRecurring,
          targetAmount:        lineItem.targetAmount ?? undefined,
          monthlyContribution: lineItem.monthlyContribution ?? undefined,
        }
      : {
          type:        LINE_ITEM_TYPES.INSTANT_SPEND,
          isRecurring: false,
        },
  });

  // Keep local type state in sync with the form field so the conditional
  // fields show/hide immediately as the user changes the select.
  const watchedType = watch('type');
  useEffect(() => { setItemType(watchedType); }, [watchedType]);

  const createMutation = useCreateLineItem(monthId, potId);
  const updateMutation = useUpdateLineItem(monthId, potId);
  const mutation = isEditing ? updateMutation : createMutation;

  useEffect(() => {
    if (!mutation.error) return;
    const code = mutation.error.response?.data?.error?.code;
    if (code === 'ALLOCATION_EXCEEDED') {
      setError('allocatedAmount', {
        message: "This would exceed the pot's budget limit.",
      });
    } else if (code === 'MONTH_LOCKED') {
      setError('root', { message: 'This month is locked.' });
    } else {
      setError('root', { message: 'Something went wrong. Please try again.' });
    }
  }, [mutation.error, setError]);

  const onSubmit = (formData) => {
    // Strip sinking-fund-only fields when submitting an INSTANT_SPEND item.
    const payload = { ...formData };
    if (payload.type === LINE_ITEM_TYPES.INSTANT_SPEND) {
      delete payload.targetAmount;
      delete payload.monthlyContribution;
    }

    if (isEditing) {
      mutation.mutate(
        { id: lineItem._id, ...payload },
        { onSuccess: () => { reset(); onSuccess?.(); } }
      );
    } else {
      mutation.mutate(payload, {
        onSuccess: () => { reset(); onSuccess?.(); },
      });
    }
  };

  const isSinking = itemType === LINE_ITEM_TYPES.SINKING_FUND;

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 12 }}>
      {errors.root && <Alert variant="warn">{errors.root.message}</Alert>}

      <Input
        label="Name"
        placeholder="e.g. Electricity"
        autoFocus
        error={errors.name?.message}
        {...register('name')}
      />

      {/* Type select is read-only when editing — changing type post-creation
          would require the API to strip/add type-specific fields. */}
      <Select
        label="Type"
        disabled={isEditing}
        error={errors.type?.message}
        {...register('type')}
      >
        <option value={LINE_ITEM_TYPES.INSTANT_SPEND}>Instant Spend</option>
        <option value={LINE_ITEM_TYPES.SINKING_FUND}>Sinking Fund</option>
      </Select>

      <Input
        label="Allocated amount"
        type="number"
        inputMode="numeric"
        placeholder="0"
        error={errors.allocatedAmount?.message}
        {...register('allocatedAmount', { valueAsNumber: true })}
      />

      {/* Sinking-fund-only fields — toggled by type selection */}
      {isSinking && (
        <div className={styles.sfFields}>
          <Input
            label="Target amount"
            type="number"
            inputMode="numeric"
            placeholder="0"
            error={errors.targetAmount?.message}
            {...register('targetAmount', { valueAsNumber: true })}
          />
          <Input
            label="Monthly contribution"
            type="number"
            inputMode="numeric"
            placeholder="0"
            error={errors.monthlyContribution?.message}
            {...register('monthlyContribution', { valueAsNumber: true })}
          />
        </div>
      )}

      <label className={styles.checkRow}>
        <input type="checkbox" {...register('isRecurring')} />
        <span>Recurring each month</span>
      </label>

      <Button type="submit" loading={mutation.isPending}>
        {isEditing ? 'Save changes' : 'Add line item'}
      </Button>
    </form>
  );
}
