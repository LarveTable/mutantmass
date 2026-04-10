import React from 'react'
import { useTranslation } from '@/context/LanguageContext'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: React.ReactNode
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    loading?: boolean
}

export default function ConfirmationDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmText,
    cancelText,
    variant = 'default',
    loading = false,
}: Props) {
    const { t } = useTranslation()
    const finalConfirmText = confirmText || t.common.confirm
    const finalCancelText = cancelText || t.common.cancel
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-row gap-2 mt-2">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        {finalCancelText}
                    </Button>
                    <Button 
                        variant={variant} 
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }} 
                        className="flex-1"
                        disabled={loading}
                    >
                        {loading ? t.common.processing : finalConfirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
