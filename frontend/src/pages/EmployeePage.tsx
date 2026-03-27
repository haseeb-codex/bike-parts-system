import { useCallback, useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { Pencil, Plus, RefreshCcw, Trash2, Users2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import ConfirmDialog from '@/components/Common/ConfirmDialog';
import { PageShell } from '@/components/Layout/PageShell';
import { useI18n } from '@/i18n/LanguageProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function EmployeePage() {
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

        const result = await listEmployees({
          sortBy: 'createdAt',
          order: 'desc',
          page,
          limit: pageSize,
          ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
          ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
          ...(roleFilter !== 'all' ? { role: roleFilter } : {}),
        });

        setEmployees(result.items);

        const meta = result.meta;
        setTotalRecords(meta?.total ?? result.items.length);
        setTotalPages(Math.max(meta?.totalPages ?? 1, 1));

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

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) {
      return [1];
    }

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages: Array<number | 'ellipsis-left' | 'ellipsis-right'> = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    if (start > 2) {
      pages.push('ellipsis-left');
    }

    for (let value = start; value <= end; value += 1) {
      pages.push(value);
    }

    if (end < totalPages - 1) {
      pages.push('ellipsis-right');
    }

    pages.push(totalPages);
    return pages;
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

  const tableSkeletonRows = useMemo(() => Array.from({ length: pageSize }), [pageSize]);

  const rangeStart = totalRecords === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalRecords);

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
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users2 className="h-4 w-4" />
                Employee Directory
              </CardTitle>
              <CardDescription>Search, filter, and manage employee records.</CardDescription>
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
        </CardHeader>

        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-2 border-b pb-3">
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
              All
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
              Active
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
              Inactive
            </button>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-3">
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

          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] table-fixed border-collapse">
              <colgroup>
                <col className="w-[27%]" />
                <col className="w-[12%]" />
                <col className="w-[13%]" />
                <col className="w-[15%]" />
                <col className="w-[11%]" />
                <col className="w-[22%]" />
              </colgroup>
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="w-[27%] px-3 py-2 font-medium">Name</th>
                  <th className="w-[12%] px-3 py-2 font-medium">Role</th>
                  <th className="w-[13%] px-3 py-2 font-medium">Salary</th>
                  <th className="w-[15%] px-3 py-2 font-medium">Joining</th>
                  <th className="w-[11%] px-3 py-2 font-medium">Status</th>
                  <th className="w-[22%] px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  tableSkeletonRows.map((_, index) => (
                    <tr key={`skeleton-${index}`} className="border-b text-sm last:border-b-0">
                      <td className="align-middle px-3 py-3">
                        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                        <div className="mt-2 h-3 w-52 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="align-middle px-3 py-3">
                        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="align-middle px-3 py-3">
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="align-middle px-3 py-3">
                        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="align-middle px-3 py-3">
                        <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="align-middle px-3 py-3">
                        <div className="flex gap-2">
                          <div className="h-8 w-16 animate-pulse rounded bg-muted" />
                          <div className="h-8 w-16 animate-pulse rounded bg-muted" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No employee records found.
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee._id} className="border-b text-sm last:border-b-0">
                      <td className="align-middle px-3 py-3">
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
                      </td>
                      <td className="align-middle px-3 py-3">
                        {(employee.role || 'employee').replace('_', ' ')}
                      </td>
                      <td className="align-middle px-3 py-3">
                        {formatCurrency(locale, employee.salary)}
                      </td>
                      <td className="align-middle px-3 py-3">
                        {formatDate(locale, employee.joiningDate)}
                      </td>
                      <td className="align-middle px-3 py-3">
                        <Badge variant={employee.status === 'active' ? 'success' : 'warning'}>
                          {employee.status}
                        </Badge>
                      </td>
                      <td className="align-middle px-3 py-3">
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {rangeStart}-{rangeEnd} of {totalRecords}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm text-muted-foreground" htmlFor="employee-page-size">
                Rows per page
              </label>
              <select
                id="employee-page-size"
                className="h-9 rounded-md border border-input bg-card px-2 text-sm"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || page <= 1}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {pageNumbers.map((item, index) => {
                  if (typeof item !== 'number') {
                    return (
                      <span key={`${item}-${index}`} className="px-2 text-sm text-muted-foreground">
                        ...
                      </span>
                    );
                  }

                  return (
                    <Button
                      key={item}
                      type="button"
                      size="sm"
                      variant={item === page ? 'default' : 'outline'}
                      className="h-8 min-w-8 px-2"
                      disabled={loading}
                      onClick={() => setPage(item)}
                    >
                      {item}
                    </Button>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || page >= totalPages}
                onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          </div>
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
