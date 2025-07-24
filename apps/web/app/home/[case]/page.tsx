import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Container, Typography, Box } from '@mui/material';
import Image from 'next/image';
import StreakCard from '@/components/StreakCard';

export const dynamic = 'force-dynamic';

export default async function CasePage({ params }: { params: Promise<{ case: string }> }) {
    const caseId = (await params).case;
    if (!['1', '2', '3'].includes(caseId)) redirect('/home');

    const headersList = await headers();
    const timezone = headersList.get('x-user-timezone') ?? 'UTC';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/streaks/${caseId}`, {
        cache: 'no-store',
        headers: {
            'x-user-timezone': timezone,
        },
    });

    if (!res.ok) {
        console.error(`Failed to fetch data for case ${caseId}`);
        redirect('/home');
    }

    const data: StreakResponse = await res.json();

    return (
        <Background>
            <Container maxWidth="sm" sx={{ textAlign: 'center', pt: { xs: 10, md: 14 } }}>
                <Box sx={{ width: 200, height: 40, mx: 'auto', mb: 4, position: 'relative', overflow: 'hidden' }}>
                    <Image
                        src="/ahead.svg"
                        alt="Ahead"
                        fill
                        style={{ objectFit: 'contain', objectPosition: 'center' }}
                    />
                </Box>
                <Typography variant="h4" fontWeight={700}>
                    Case {caseId}: {data.total}-day streak Mocked for demo date - {data.days[0].date}
                </Typography>
                <br />
                <StreakCard data={data} />
                <NavLinks />
            </Container>
        </Background>
    );
}

// ------------------ Types ------------------
type State = 'COMPLETED' | 'AT_RISK' | 'SAVED' | 'INCOMPLETE';

interface Day {
    date: string;
    activities: number;
    state: State;
}
interface StreakResponse {
    activitiesToday: number;
    total: number;
    days: Day[];
}

// ------------------ UI Components ------------------

function NavLinks() {
    return (
        <Box mt={6} display="flex" justifyContent="center" gap={3}>
            {['1', '2', '3'].map((c) => (
                <Typography
                    key={c}
                    component="a"
                    href={`/home/${c}`}
                    sx={{ textDecoration: 'underline', color: 'text.secondary', fontSize: 14 }}
                >
                    case {c}
                </Typography>
            ))}
            <Typography
                component="a"
                href="/home"
                sx={{ textDecoration: 'underline', color: 'text.secondary', fontSize: 14 }}
            >
                live-streak
            </Typography>
        </Box>
    );
}

function Background({ children }: { children: React.ReactNode }) {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `linear-gradient(180deg, #FFF6E9 0%, #FFF4DD 100%)`,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* left wave */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '-10%',
                    left: '-20%',
                    width: '60%',
                    height: '50%',
                    bgcolor: '#FFE18D',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    opacity: 0.6,
                }}
            />
            {/* right wave */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '-15%',
                    right: '-15%',
                    width: '55%',
                    height: '45%',
                    bgcolor: '#FFE18D',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    opacity: 0.5,
                }}
            />
            {children}
        </Box>
    );
}
