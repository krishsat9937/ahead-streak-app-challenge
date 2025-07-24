import { Card, CardContent, Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BoltIcon from '@mui/icons-material/Bolt';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import type { Day, StreakResponse, State } from '@/app/home/page';

export default function StreakCard({ data }: { data: StreakResponse }) {
    console.table(data.days.map(d => ({
        date: d.date,
        weekday: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }),
        state: d.state,
        activities: d.activities
    })));

    // Normalize to [Sun ... Sat]
    const visualDays: (Day | null)[] = Array(7).fill(null);
    data.days.forEach((day) => {
        const weekday = new Date(day.date).getDay(); // 0 = Sun
        visualDays[weekday] = day;
    });

    return (
        <Card elevation={3} sx={{ borderRadius: 4, px: 3, py: 2, display: 'inline-block' }}>
            <CardContent sx={{ p: 0 }}>
                <Box display="flex" gap={2} justifyContent="center" alignItems="center">
                    {visualDays.map((day, i) => (
                        <DayDot key={i} day={day!} />
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
}


function DayDot({ day }: { day: Day | null }) {
    if (!day) {
        return (
            <Box textAlign="center">
                <RadioButtonUncheckedIcon sx={{ color: '#EEE', fontSize: 22 }} />
                <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
                    {/* Leave blank or fallback */}
                </Typography>
            </Box>
        );
    }

    const { icon: Icon, color, borderBottom } = iconForState(day.state);
    return (
        <Box textAlign="center">
            <Icon sx={{ color, fontSize: 22 }} titleAccess={`${day.state} • ${day.activities}`} />
            <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
                {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()}
            </Typography>
            {borderBottom && (
                <Box sx={{ height: 2, bgcolor: color, mt: 0.5, borderRadius: 1 }} />
            )}
        </Box>
    );
}


function iconForState(state: State) {
    switch (state) {
        case 'COMPLETED':
            return { icon: CheckCircleIcon, color: '#C6B2FF', borderBottom: false };
        case 'AT_RISK':
            return { icon: ErrorOutlineIcon, color: '#FFB020', borderBottom: true };
        case 'SAVED':
            return { icon: BoltIcon, color: '#6C5CE7', borderBottom: true };
        case 'INCOMPLETE':
        default:
            return { icon: RadioButtonUncheckedIcon, color: '#D3D3D3', borderBottom: false };
    }
}
