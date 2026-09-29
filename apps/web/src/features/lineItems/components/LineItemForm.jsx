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
    // Interest is optional per fund: only funds that earn interest get a rate.
    earnsInterest:      z.boolean().optional().default(false),
    annualInterestRate: z.number().min(0, 'Cannot be negative').max(100, 'Max 100%').nullable().optional(),
    targetDate:         z.string().nullable().optional(),
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
      if (data.earnsInterest) {
        if (data.annualInterestRate == null) {
          ctx.addIssue({
            code: 'custom',
            path: ['annualInterestRate'],
            message: 'Enter the fixed annual rate',
          });
        }
        if (!data.targetDate) {
          ctx.addIssue({
            code: 'custom',
            path: ['targetDate'],
            message: 'Pick the goal date to project to',
          });
        }
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
          earnsInterest:       lineItem.annualInterestRate != null,
          annualInterestRate:  lineItem.annualInterestRate ?? null,
          targetDate:          lineItem.targetDate ? String(lineItem.targetDate).slice(0, 10) : null,
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
    const { earnsInterest: interestOn, ...payload } = formData;
    if (payload.type === LINE_ITEM_TYPES.INSTANT_SPEND) {
      delete payload.targetAmount;
      delete payload.annualInterestRate;
      delete payload.targetDate;
    } else if (!interestOn) {
      // null clears any previously saved rate when editing a fund.
      // The goal date stays: it also drives the "on track?" check.
      payload.annualInterestRate = null;
    }
    if (payload.type !== LINE_ITEM_TYPES.INSTANT_SPEND) {
      payload.targetDate = payload.targetDate || null;
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
  const earnsInterest = watch('earnsInterest');

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
        label={isSinking ? 'Amount to put in this month' : 'Allocated amount'}
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
          <p className={styles.hint}>
            The amount above goes into this fund straight away and counts as
            used in the pot. It is also added again every month.
          </p>

          <Input
            id="goal-date"
            label={earnsInterest ? 'Goal date (projection runs to here)' : 'Goal date (optional)'}
            type="date"
            error={errors.targetDate?.message}
            {...register('targetDate', { setValueAs: (v) => (v ? v : null) })}
          />
          <p className={styles.hint}>
            With a goal date the app tells you how much you need to put in each
            month to reach the target, and whether you are on track.
          </p>

          <label className={styles.checkRow}>
            <input type="checkbox" {...register('earnsInterest')} />
            <span>This fund earns interest</span>
          </label>

          {earnsInterest && (
            <>
              <Input
                id="annual-interest-rate"
                label="Fixed annual interest rate (%)"
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="e.g. 8.5"
                error={errors.annualInterestRate?.message}
                {...register('annualInterestRate', {
                  setValueAs: (v) => (v === '' || v == null ? null : Number(v)),
                })}
              />
            </>
          )}
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
