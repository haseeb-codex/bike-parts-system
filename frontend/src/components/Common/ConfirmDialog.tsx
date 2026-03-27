import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmDialogProps {
	open: boolean;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	loading?: boolean;
	onConfirm: () => void | Promise<void>;
	onCancel: () => void;
}

export default function ConfirmDialog({
	open,
	title,
	description,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	loading = false,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen && !loading) {
					onCancel();
				}
			}}
		>
			<DialogContent
				className="sm:max-w-md"
				onEscapeKeyDown={(event) => {
					if (loading) {
						event.preventDefault();
					}
				}}
				onPointerDownOutside={(event) => {
					if (loading) {
						event.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
						{cancelText}
					</Button>
					<Button type="button" variant="destructive" onClick={() => void onConfirm()} disabled={loading}>
						{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
						{confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export type { ConfirmDialogProps };
