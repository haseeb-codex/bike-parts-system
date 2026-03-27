import { useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { DatePicker } from '@/components/ui/date-picker';
import { PageShell } from '@/components/Layout/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  createEmployee,
  getEmployeeById,
  updateEmployee,
  type EmployeeRole,
  type EmployeeStatus,
} from '@/services/employeeService';

interface ApiErrorResponse {
  message?: string;
}

const employeeSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters.'),
  email: z.string().trim().email('Please enter a valid email address.'),
  phone: z
    .string()
    .trim()
    .regex(/^\d{7,20}$/, 'Please enter a valid phone number.'),
  role: z.enum(['employee', 'admin', 'super_admin']),
  salary: z.preprocess((value) => {
    if (value === '' || value === undefined || value === null) {
      return undefined;
    }

    if (typeof value === 'number' && Number.isNaN(value)) {
      return undefined;
    }

    return value;
  }, z.number().gt(0, 'Salary must be greater than 0.').optional()),
  joiningDate: z.date({ required_error: 'Joining date is required.' }),
  status: z.enum(['active', 'inactive']),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

function mapApiError(error: unknown, fallback: string): string {
  if (!isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  return error.response?.data?.message || fallback;
}

const inputClassName =
  'flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

function blockNonDigitKeys(event: KeyboardEvent<HTMLInputElement>) {
  const allowedControlKeys = new Set([
    'Backspace',
    'Delete',
    'Tab',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End',
    'Enter',
  ]);

  if (
    allowedControlKeys.has(event.key) ||
    ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase()))
  ) {
    return;
  }

  if (!/^\d$/.test(event.key)) {
    event.preventDefault();
  }
}

function keepOnlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export default function AddEmployeePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editId = searchParams.get('edit');
  const isEditMode = Boolean(editId);

  const [loadingRecord, setLoadingRecord] = useState(isEditMode);
  const [apiError, setApiError] = useState<string | null>(null);

  const defaultValues = useMemo<EmployeeFormValues>(
    () => ({
      name: '',
      email: '',
      phone: '',
      role: 'employee',
      salary: undefined,
      joiningDate: new Date(),
      status: 'active',
    }),
    []
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues,
  });

  const phoneField = register('phone', {
    setValueAs: (value) => keepOnlyDigits(String(value ?? '')),
  });

  const salaryField = register('salary', {
    setValueAs: (value) => {
      const digits = keepOnlyDigits(String(value ?? ''));
      return digits ? Number(digits) : undefined;
    },
  });

  useEffect(() => {
    if (!editId) {
      return;
    }

    const run = async () => {
      setLoadingRecord(true);
      setApiError(null);

      try {
        const employee = await getEmployeeById(editId);
        reset({
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          role: employee.role || 'employee',
          salary: employee.salary,
          joiningDate: new Date(employee.joiningDate),
          status: employee.status,
        });
      } catch (error) {
        setApiError(mapApiError(error, 'Unable to load employee details.'));
      } finally {
        setLoadingRecord(false);
      }
    };

    void run();
  }, [editId, reset]);

  const onSubmit = async (values: EmployeeFormValues) => {
    setApiError(null);

    const payload = {
      ...values,
      email: values.email.toLowerCase().trim(),
      role: values.role as EmployeeRole,
      joiningDate: values.joiningDate.toISOString(),
      status: values.status as EmployeeStatus,
    };

    try {
      if (editId) {
        await updateEmployee(editId, payload);
      } else {
        await createEmployee(payload);
      }

      navigate('/employees', {
        replace: true,
        state: {
          message: editId ? 'Employee updated successfully.' : 'Employee added successfully.',
        },
      });
    } catch (error) {
      setApiError(
        mapApiError(
          error,
          editId
            ? 'Unable to update employee. Please try again.'
            : 'Unable to add employee. Please try again.'
        )
      );
    }
  };

  return (
    <PageShell
      title={isEditMode ? 'Edit Employee' : 'Add Employee'}
      description="Employee code is auto-generated and role is picked from the matching user account email."
    >
      {apiError ? (
        <Card className="mb-4 border-red-300 bg-red-50/80 dark:border-red-700 dark:bg-red-950/20">
          <CardContent className="py-4 text-sm text-red-700 dark:text-red-300">
            {apiError}
          </CardContent>
        </Card>
      ) : null}

      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle>
            {isEditMode ? 'Update Employee Information' : 'Employee Information'}
          </CardTitle>
          <CardDescription>Fill required fields to create a user/employee profile.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingRecord ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading employee details...
            </div>
          ) : (
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <Input placeholder="Full Name" {...register('name')} />
                {errors.name ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                ) : null}
              </div>

              <div>
                <Input type="email" placeholder="Email" {...register('email')} />
                {errors.email ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Phone"
                  {...phoneField}
                  onKeyDown={blockNonDigitKeys}
                  onChange={(event) => {
                    event.target.value = keepOnlyDigits(event.target.value);
                    phoneField.onChange(event);
                  }}
                />
                {errors.phone ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.phone.message}
                  </p>
                ) : null}
              </div>

              <div>
                <select className={inputClassName} {...register('role')}>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                {errors.role ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.role.message}
                  </p>
                ) : null}
              </div>

              <div>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Salary"
                  {...salaryField}
                  onKeyDown={blockNonDigitKeys}
                  onChange={(event) => {
                    event.target.value = keepOnlyDigits(event.target.value);
                    salaryField.onChange(event);
                  }}
                />
                {errors.salary ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.salary.message}
                  </p>
                ) : null}
              </div>

              <div>
                <DatePicker
                  value={watch('joiningDate')}
                  onChange={(date) => setValue('joiningDate', date, { shouldValidate: true })}
                  placeholder="Select joining date"
                />
                {errors.joiningDate ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.joiningDate.message}
                  </p>
                ) : null}
              </div>

              <div>
                <select className={inputClassName} {...register('status')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {errors.status ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.status.message}
                  </p>
                ) : null}
              </div>

              <div className="flex gap-2 md:col-span-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {isEditMode ? 'Update Employee' : 'Create Employee'}
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/employees')}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
