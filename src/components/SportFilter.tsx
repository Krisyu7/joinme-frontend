const SPORT_ICONS: Record<string, string> = {
    FOOTBALL: '⚽',
    BADMINTON: '🏸',
    BASKETBALL: '🏀',
    TENNIS: '🎾',
    VOLLEYBALL: '🏐',
}

const sports = ['FOOTBALL', 'BADMINTON', 'BASKETBALL', 'TENNIS', 'VOLLEYBALL']

interface SportFilterProps {
    selected: string
    onChange: (sport: string) => void
}

export default function SportFilter({ selected, onChange }: SportFilterProps) {
    return (
        <div className="flex gap-2 flex-wrap">
            <button
                onClick={() => onChange('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selected === '' ? 'bg-green-400 text-gray-950' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
            >
                All
            </button>
            {sports.map(sport => (
                <button
                    key={sport}
                    onClick={() => onChange(sport)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selected === sport ? 'bg-green-400 text-gray-950' : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                >
                    {SPORT_ICONS[sport]} {sport.charAt(0) + sport.slice(1).toLowerCase()}
                </button>
            ))}
        </div>
    )
}