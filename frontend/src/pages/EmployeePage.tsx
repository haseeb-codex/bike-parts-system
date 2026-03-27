import { useCallback, useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { Pencil, Plus, RefreshCcw, Trash2, Users2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

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

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EmployeeStatus>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | EmployeeRole>('all');

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const locale =
    language === 'nl' ? 'nl-NL' : language === 'ar' ? 'ar' : language === 'ur' ? 'ur-PK' : 'en-US';

  const loadEmployees = useCallback(async (isRefresh: boolean) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const result = await listEmployees({
        sortBy: 'createdAt',
        order: 'desc',
        limit: 200,
      });

      setEmployees(result.items);
    } catch (loadError) {
      setError(mapApiError(loadError, 'Unable to load employees right now. Please try again.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadEmployees(false);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [loadEmployees]);

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

  const roles = useMemo(() => {
    return Array.from(new Set(employees.map((employee) => employee.role || 'employee'))).sort(
      (a, b) => a.localeCompare(b)
    );
  }, [employees]);

  const isSuperAdmin = user?.role === 'super_admin';
  const canManage = user?.role === 'super_admin' || user?.role === 'admin';

  const statusCounts = useMemo(() => {
    const active = employees.filter((employee) => employee.status === 'active').length;
    const inactive = employees.filter((employee) => employee.status === 'inactive').length;
    return {
      all: employees.length,
      active,
      inactive,
    };
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return employees.filter((employee) => {
      const normalizedRole = employee.role || 'employee';
      const matchesStatus = statusFilter === 'all' ? true : employee.status === statusFilter;
      const matchesRole = roleFilter === 'all' ? true : normalizedRole === roleFilter;
      const matchesSearch =
        !normalizedSearch ||
        employee.name.toLowerCase().includes(normalizedSearch) ||
        employee.email.toLowerCase().includes(normalizedSearch) ||
        normalizedRole.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesRole && matchesSearch;
    });
  }, [employees, roleFilter, searchText, statusFilter]);

  const handleDelete = async (employee: EmployeeRecord) => {
    if (!canManage) {
      return;
    }

    const confirmed = window.confirm(`Delete ${employee.name}?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(employee._id);
    setError(null);

    try {
      const message = await deleteEmployee(employee._id);
      setSuccessMessage(message);
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
              onClick={() => setStatusFilter('all')}
            >
              All{' '}
              <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs">
                {statusCounts.all}
              </span>
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                statusFilter === 'active'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setStatusFilter('active')}
            >
              Active{' '}
              <span className="ml-1 rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                {statusCounts.active}
              </span>
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                statusFilter === 'inactive'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setStatusFilter('inactive')}
            >
              Inactive{' '}
              <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                {statusCounts.inactive}
              </span>
            </button>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <select
              className={inputClassName}
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="all">All roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.replace('_', ' ')}
                </option>
              ))}
            </select>

            <Input
              className="md:col-span-2"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search by name, email, role"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] border-collapse">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Role</th>
                  <th className="px-3 py-2 font-medium">Contact</th>
                  <th className="px-3 py-2 font-medium">Salary</th>
                  <th className="px-3 py-2 font-medium">Joining</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-sm text-muted-foreground">
                      Loading employees...
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No employee records found.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee._id} className="border-b align-top text-sm last:border-b-0">
                      <td className="px-3 py-3 font-medium">{employee.name}</td>
                      <td className="px-3 py-3">
                        {(employee.role || 'employee').replace('_', ' ')}
                      </td>
                      <td className="px-3 py-3">
                        <div>{employee.phone}</div>
                        <div className="text-xs text-muted-foreground">{employee.email}</div>
                      </td>
                      <td className="px-3 py-3">{formatCurrency(locale, employee.salary)}</td>
                      <td className="px-3 py-3">{formatDate(locale, employee.joiningDate)}</td>
                      <td className="px-3 py-3">
                        <Badge variant={employee.status === 'active' ? 'success' : 'warning'}>
                          {employee.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!canManage}
                            onClick={() => navigate(`/employees/add?edit=${employee._id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
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
                            onClick={() => void handleDelete(employee)}
                          >
                            <Trash2 className="h-4 w-4" />
                            {deletingId === employee._id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
