import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

// Component to add a note to an exercise in a workout

interface Props {
    open: boolean
    onClose: () => void
    exerciseName: string
    initialNote?: string | null
    onConfirm: (note: string) => void
    isLoading: boolean
}

export default function ExerciseNoteDialog({
    open,
    onClose,
    exerciseName,
    initialNote,
    onConfirm,
    isLoading,
}: Props) {
    const [note, setNote] = useState(initialNote ?? '')

    useEffect(() => {
        setNote(initialNote ?? '')
    }, [initialNote, open])

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{exerciseName}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-1.5 py-2">
                    <Label>Exercise note</Label>
                    <Textarea
                        placeholder="Form cues, feelings, things to remember..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="resize-none"
                        rows={4}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => onConfirm(note)} disabled={isLoading}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}