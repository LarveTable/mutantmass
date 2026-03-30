import { Dumbbell } from 'lucide-react'

interface Props {
    imageUrl?: string | null
    name: string
    size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
    sm: { container: 'h-8 w-8', icon: 14 },
    md: { container: 'h-10 w-10', icon: 18 },
    lg: { container: 'h-12 w-12', icon: 22 },
}

const BASE_URL = 'http://localhost:3000'

export default function ExerciseImage({ imageUrl, name, size = 'md' }: Props) {
    const { container, icon } = SIZES[size]

    if (imageUrl) {
        return (
            <img
                src={`${BASE_URL}${imageUrl}`}
                alt={name}
                className={`${container} rounded-lg object-cover shrink-0`}
            />
        )
    }

    return (
        <div className={`${container} flex items-center justify-center rounded-lg bg-primary/10 shrink-0`}>
            <Dumbbell size={icon} className="text-primary" />
        </div>
    )
}