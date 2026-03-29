import { useState } from 'react'
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
    const [note, setNote] = useState('')

    const handleConfirm = () => {
        onConfirm(note)
        setNote('')
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Finish Workout</DialogTitle>
                    <DialogDescription />
                </DialogHeader>

                <div className="flex flex-col gap-3 py-2">
                    <div className="flex flex-col gap-1.5">
                        <Label>Session note (optional)</Label>
                        <Textarea
                            placeholder="How did it feel? Any PRs? Notes for next time..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="resize-none"
                            rows={4}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Finish 🎉'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}