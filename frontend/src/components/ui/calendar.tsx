import type { ComponentProps } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        root: 'w-full',
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'space-y-4',
        month_caption: 'relative flex items-center justify-center pt-1',
        caption_label: 'text-sm font-medium',
        nav: 'absolute inset-x-0 top-1 flex items-center justify-between px-1',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 rounded-md bg-background p-0 opacity-70 hover:opacity-100'
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 rounded-md bg-background p-0 opacity-70 hover:opacity-100'
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'w-9 text-center text-[0.8rem] font-normal text-muted-foreground rounded-md',
        weeks: 'mt-2',
        week: 'flex w-full',
        day: 'h-9 w-9 p-0 text-center text-sm',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 rounded-md p-0 font-normal aria-selected:opacity-100'
        ),
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        today: 'ring-1 ring-primary/40',
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-50',
        range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...iconProps }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4" {...iconProps} />
          ) : (
            <ChevronRight className="h-4 w-4" {...iconProps} />
          ),
      }}
      {...props}
    />
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
