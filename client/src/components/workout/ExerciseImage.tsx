import { useState } from 'react'
import { Dumbbell } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from '@/components/ui/dialog'

interface Props {
    imageUrl?: string | null
    name: string
    size?: 'sm' | 'md' | 'lg'
    zoomable?: boolean
}

const SIZES = {
    sm: { container: 'h-8 w-8', icon: 14 },
    md: { container: 'h-10 w-10', icon: 18 },
    lg: { container: 'h-12 w-12', icon: 22 },
}

const BASE_URL = import.meta.env.VITE_API_URL || ''

export default function ExerciseImage({ imageUrl, name, size = 'md', zoomable = false }: Props) {
    const { container, icon } = SIZES[size]
    const [isOpen, setIsOpen] = useState(false)

    if (imageUrl) {
        const fullUrl = `${BASE_URL}${imageUrl}`
        
        const imgElement = (
            <img
                src={fullUrl}
                alt={name}
                className={`${container} rounded-lg object-cover shrink-0 ${zoomable ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
            />
        )

        if (!zoomable) return imgElement

        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    {imgElement}
                </DialogTrigger>
                <DialogContent className="max-w-md border-none bg-transparent p-0 shadow-none ring-0">
                    <div className="relative flex items-center justify-center">
                        <img
                            src={fullUrl}
                            alt={name}
                            className="h-auto w-full rounded-2xl object-contain shadow-2xl"
                        />
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap">
                            {name}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <div className={`${container} flex items-center justify-center rounded-lg bg-primary/10 shrink-0`}>
            <Dumbbell size={icon} className="text-primary" />
        </div>
    )
}