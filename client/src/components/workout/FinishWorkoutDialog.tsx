import { useState } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface Props {
    open: boolean
    onClose: () => void
    onConfirm: (note: string) => void
    isLoading: boolean
}

// Component that will allow to set a global note for the workout

export default function FinishWorkoutDialog({ open, onClose, onConfirm, isLoading }: Props) {
    const { t } = useTranslation()
    const [note, setNote] = useState('')

    const handleConfirm = () => {
        onConfirm(note)
        setNote('')
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{t.workout.finishDialog.title}</DialogTitle>
                    <DialogDescription />
                </DialogHeader>

                <div className="flex flex-col gap-3 py-2">
                    <div className="flex flex-col gap-1.5">
                        <Label>{t.workout.finishDialog.noteLabel}</Label>
                        <Textarea
                            placeholder={t.workout.finishDialog.notePlaceholder}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="resize-none"
                            rows={4}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>{t.common.cancel}</Button>
                    <Button onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? t.common.processing : t.workout.finishDialog.finishBtn}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}