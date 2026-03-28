import { useCallback, useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { Pencil, Plus, RefreshCcw, Trash2, Users2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import ConfirmDialog from '@/components/Common/ConfirmDialog';
import { DataTable, type DataTableColumn } from '@/components/Common/DataTable';
import { PageShell } from '@/components/Layout/PageShell';
import { useI18n } from '@/i18n/LanguageProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import {
  deleteEmployee,
  listEmployees,
  type EmployeeRecord,
  type EmployeeRole,
  type EmployeeStatus,
} from '@/services/employeeService';

interface ApiErrorResponse {
  message?: string;
}

function mapApiError(error: unknown, fallback: string): string {
  if (!isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  return error.response?.data?.message || fallback;
}

function formatCurrency(locale: string, value: number): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(locale: string, value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

const inputClassName =
  'flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

function EmployeePage() {
  const { t, language } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogEmployee, setDeleteDialogEmployee] = useState<EmployeeRecord | null>(null);

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EmployeeStatus>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | EmployeeRole>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState({ all: 0, active: 0, inactive: 0 });

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const locale =
    language === 'nl' ? 'nl-NL' : language === 'ar' ? 'ar' : language === 'ur' ? 'ur-PK' : 'en-US';

  const loadEmployees = useCallback(
    async (isRefresh: boolean) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        }

        setLoading(true);
        setError(null);

        const sharedFilters = {
          ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
          ...(roleFilter !== 'all' ? { role: roleFilter } : {}),
        };

        const [result, activeResult, inactiveResult] = await Promise.all([
          listEmployees({
            sortBy: 'createdAt',
            order: 'desc',
            page,
            limit: pageSize,
            ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
            ...sharedFilters,
          }),
          listEmployees({ page: 1, limit: 1, status: 'active', ...sharedFilters }),
          listEmployees({ page: 1, limit: 1, status: 'inactive', ...sharedFilters }),
        ]);

        setEmployees(result.items);

        const meta = result.meta;
        const currentTotal = meta?.total ?? result.items.length;
        const activeTotal = activeResult.meta?.total ?? 0;
        const inactiveTotal = inactiveResult.meta?.total ?? 0;

        setTotalRecords(currentTotal);
        setTotalPages(Math.max(meta?.totalPages ?? 1, 1));
        setStatusCounts({
          all: activeTotal + inactiveTotal,
          active: activeTotal,
          inactive: inactiveTotal,
        });

        if (meta?.page && meta.page !== page) {
          setPage(meta.page);
        }
      } catch (loadError) {
        setError(mapApiError(loadError, 'Unable to load employees right now. Please try again.'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [debouncedSearch, page, pageSize, roleFilter, statusFilter]
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchText]);

  useEffect(() => {
    void loadEmployees(false);
  }, [loadEmployees]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    const state = location.state as { message?: string } | null;
    if (!state?.message) {
      return;
    }

    setSuccessMessage(state.message);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  const roles = useMemo(
    () => [
      { value: 'employee', label: 'Employee' },
      { value: 'admin', label: 'Admin' },
      { value: 'super_admin', label: 'Super Admin' },
    ],
    []
  );

  const isSuperAdmin = user?.role === 'super_admin';
  const canManage = user?.role === 'super_admin' || user?.role === 'admin';

  const handleDelete = async (employee: EmployeeRecord) => {
    if (!canManage) {
      return;
    }

    setDeletingId(employee._id);
    setError(null);

    try {
      const message = await deleteEmployee(employee._id);
      setSuccessMessage(message);
      setDeleteDialogEmployee(null);
      await loadEmployees(true);
    } catch (deleteError) {
      setError(mapApiError(deleteError, 'Unable to delete employee. Please try again.'));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<DataTableColumn<EmployeeRecord>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        headerClassName: 'w-[27%]',
        cell: (employee) => (
          <div>
            <div
              className="max-w-[150px] truncate font-medium sm:max-w-[190px] lg:max-w-[230px]"
              title={employee.name}
            >
              {employee.name}
            </div>
            <div
              className="max-w-[150px] truncate text-xs text-muted-foreground sm:max-w-[190px] lg:max-w-[230px]"
              title={employee.email}
            >
              {employee.email}
            </div>
          </div>
        ),
      },
      {
        header: 'Role',
        accessorKey: 'role',
        headerClassName: 'w-[12%]',
        cell: (employee) => (employee.role || 'employee').replace('_', ' '),
      },
      {
        header: 'Salary',
        accessorKey: 'salary',
        headerClassName: 'w-[13%]',
        cell: (employee) => formatCurrency(locale, employee.salary),
      },
      {
        header: 'Joining',
        accessorKey: 'joiningDate',
        headerClassName: 'w-[15%]',
        cell: (employee) => formatDate(locale, employee.joiningDate),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        headerClassName: 'w-[11%]',
        cell: (employee) => (
          <Badge variant={employee.status === 'active' ? 'success' : 'warning'}>
            {employee.status}
          </Badge>
        ),
      },
    ],
    [locale]
  );

  const filters = (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={`rounded-md px-3 py-1 text-sm font-medium ${
            statusFilter === 'all' ? 'bg-secondary text-foreground' : 'text-muted-foreground'
          }`}
          onClick={() => {
            setStatusFilter('all');
            setPage(1);
          }}
        >
          All ({statusCounts.all})
        </button>
        <button
          type="button"
          className={`rounded-md px-3 py-1 text-sm font-medium ${
            statusFilter === 'active'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'text-muted-foreground'
          }`}
          onClick={() => {
            setStatusFilter('active');
            setPage(1);
          }}
        >
          Active ({statusCounts.active})
        </button>
        <button
          type="button"
          className={`rounded-md px-3 py-1 text-sm font-medium ${
            statusFilter === 'inactive'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
              : 'text-muted-foreground'
          }`}
          onClick={() => {
            setStatusFilter('inactive');
            setPage(1);
          }}
        >
          Inactive ({statusCounts.inactive})
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <select
          className={inputClassName}
          value={roleFilter}
          onChange={(event) => {
            setRoleFilter(event.target.value as 'all' | EmployeeRole);
            setPage(1);
          }}
        >
          <option value="all">All roles</option>
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>

        <Input
          className="md:col-span-2"
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value);
            setPage(1);
          }}
          placeholder="Search by name, email, role"
        />
      </div>
    </>
  );

  return (
    <PageShell
      title={t('route.employees', 'Employees')}
      description="Manage workforce records and employee status from one place."
    >
      {error ? (
        <Card className="mb-4 border-red-300 bg-red-50/80 dark:border-red-700 dark:bg-red-950/20">
          <CardContent className="py-4 text-sm text-red-700 dark:text-red-300">{error}</CardContent>
        </Card>
      ) : null}

      {successMessage ? (
        <Card className="mb-4 border-emerald-300 bg-emerald-50/80 dark:border-emerald-700 dark:bg-emerald-950/20">
          <CardContent className="py-4 text-sm text-emerald-700 dark:text-emerald-300">
            {successMessage}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-base font-semibold">
              <Users2 className="h-4 w-4" />
              Employee Directory
            </div>
            <p className="text-sm text-muted-foreground">
              Search, filter, and manage employee records.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadEmployees(true)}
              disabled={refreshing}
            >
              <RefreshCcw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
              {refreshing
                ? t('common.refreshing', 'Refreshing...')
                : t('common.refresh', 'Refresh')}
            </Button>
            {isSuperAdmin ? (
              <Button type="button" onClick={() => navigate('/employees/add')}>
                <Plus className="h-4 w-4" />
                Add Employee
              </Button>
            ) : null}
          </div>
        </div>

        <CardContent className="px-0 pt-0">
          <DataTable
            columns={columns}
            data={employees}
            loading={loading}
            loadingRows={pageSize}
            emptyMessage="No employee records found."
            rowKey={(employee) => employee._id}
            filters={filters}
            tableClassName="table-fixed"
            pagination={{
              page,
              limit: pageSize,
              total: totalRecords,
              onPageChange: setPage,
              onLimitChange: (limit) => {
                setPageSize(limit);
                setPage(1);
              },
              limitOptions: [5, 10, 20, 50],
            }}
            rowActions={(employee) => (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canManage}
                  onClick={() => navigate(`/employees/add?edit=${employee._id}`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={!canManage || deletingId === employee._id}
                  title={
                    canManage
                      ? 'Delete employee'
                      : 'Only admin or super admin is allowed to manage employee records'
                  }
                  onClick={() => setDeleteDialogEmployee(employee)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteDialogEmployee)}
        title="Delete Employee"
        description={
          deleteDialogEmployee
            ? `Are you sure you want to delete ${deleteDialogEmployee.name}? This action cannot be undone.`
            : 'This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        loading={Boolean(deleteDialogEmployee && deletingId === deleteDialogEmployee._id)}
        onCancel={() => {
          if (!deletingId) {
            setDeleteDialogEmployee(null);
          }
        }}
        onConfirm={() => {
          if (deleteDialogEmployee) {
            return handleDelete(deleteDialogEmployee);
          }
          return undefined;
        }}
      />
    </PageShell>
  );
}

export { EmployeePage };
export default EmployeePage;
