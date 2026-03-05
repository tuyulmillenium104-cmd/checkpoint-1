// GenLayer Event Data Types and Constants

export interface XPReward {
  position: string;
  xp: number;
}

export interface Event {
  id: string;
  name: string;
  icon?: string;
  day: string;
  time: string;
  timeUTC: string;
  description?: string;
  xpRewards: XPReward[];
  rewards?: string[];
  roleReq: string;
  roleColor: string;
  isSpecial?: boolean;
  hasPOAP?: boolean;
  hasInsight?: boolean;
  link?: string;
  duration?: number; // Duration in minutes
}

export interface Role {
  name: string;
  emoji: string;
  requirements: string;
  perks: string;
  color: string;
}

export interface FunctionalRole {
  name: string;
  requirements: string;
  perks: string;
}

export const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
export const DAYS_ID: Record<string, string> = {
  'SUNDAY': 'Minggu',
  'MONDAY': 'Senin',
  'TUESDAY': 'Selasa',
  'WEDNESDAY': 'Rabu',
  'THURSDAY': 'Kamis',
  'FRIDAY': 'Jumat',
  'SATURDAY': 'Sabtu'
};

// Discord Channel Links
const DISCORD_LINKS = {
  rumbleGartic: 'https://discord.com/channels/1237055789441487021/1348760456310820884',
  aiBlockchain: 'https://discord.com/channels/1237055789441487021/1247792755044782090',
  genfrenQuiz: 'https://discord.com/channels/1237055789441487021/1366010056906379385',
  pokerChess: 'https://discord.com/channels/1237055789441487021/1370344728733814854',
  regionalQuiz: 'https://discord.com/channels/1237055789441487021/1237114587124600933',
  quizIndonesia: 'https://discord.com/channels/1237055789441487021/1358856200187285625',
  quizNigeria: 'https://discord.com/channels/1237055789441487021/1355488122485346315',
  memeNeurocreative: 'https://discord.com/channels/1237055789441487021/1348736285132587100',
  xSpace: 'https://x.com/GenLayer',
  karaoke: 'https://discord.com/channels/1237055789441487021/1340340818367479861',
  others: 'https://discord.com/channels/1237055789441487021/1348760689879154699',
};

// Helper to generate quiz XP rewards
const generateQuizRewards = (): XPReward[] => [
  { position: 'Top 1', xp: 1500 },
  { position: 'Top 2', xp: 1400 },
  { position: 'Top 3', xp: 1300 },
  { position: 'Top 4', xp: 1200 },
  { position: 'Top 5', xp: 1100 },
  { position: 'Top 6-10', xp: 1000 },
  { position: 'Top 11-20', xp: 900 },
  { position: 'Top 21-30', xp: 800 },
];

const generateGarticRewards = (): XPReward[] => [
  { position: 'Top 1', xp: 1500 },
  { position: 'Top 2', xp: 1400 },
  { position: 'Top 3', xp: 1300 },
  { position: 'Top 4', xp: 1200 },
  { position: 'Top 5', xp: 1100 },
  { position: 'Top 6-10', xp: 1000 },
];

const generateSmashKartsRewards = (): XPReward[] => [
  { position: 'Top 1', xp: 1500 },
  { position: 'Top 2', xp: 1400 },
  { position: 'Top 3', xp: 1300 },
  { position: 'Top 4', xp: 1200 },
  { position: 'Top 5', xp: 1000 },
  { position: 'Top 6-8', xp: 750 },
];

export const events: Event[] = [
  // MONDAY
  {
    id: 'mon-ama',
    name: 'GenLayer Community AMA',
    icon: '/icons/ama.png',
    day: 'MONDAY',
    time: '2:00 PM',
    timeUTC: '14:00',
    description: 'Weekly Ask Me Anything session with the GenLayer team. Get updates, ask questions, and earn POAP for attending. Held on X (Twitter) Spaces.',
    xpRewards: [],
    rewards: ['Insight', 'POAP'],
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    hasPOAP: true,
    hasInsight: true,
    link: DISCORD_LINKS.xSpace,
    duration: 90, // X Space - 1 hour 30 minutes
  },
  {
    id: 'mon-quiz-korean',
    name: 'Quiz Korean',
    icon: '/icons/quiz-korea.png',
    day: 'MONDAY',
    time: '2:45 PM',
    timeUTC: '14:45',
    description: 'Korean language quiz event for the Korean community. Test your knowledge about GenLayer and compete for XP rewards.',
    xpRewards: generateQuizRewards(),
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.regionalQuiz,
    duration: 10, // Quiz - 10 minutes
  },
  {
    id: 'mon-quiz-ukrainian',
    name: 'Quiz Ukrainian',
    icon: '/icons/quiz-ukraine.png',
    day: 'MONDAY',
    time: '6:00 PM',
    timeUTC: '18:00',
    description: 'Ukrainian language quiz event for the Ukrainian community. Test your knowledge about GenLayer and compete for XP rewards.',
    xpRewards: generateQuizRewards(),
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.regionalQuiz,
    duration: 10, // Quiz - 10 minutes
  },
  {
    id: 'mon-smashkarts',
    name: 'SmashKarts (Community/Late Night)',
    icon: '/icons/smashkarts.png',
    day: 'MONDAY',
    time: '7:00 PM',
    timeUTC: '19:00',
    description: 'Community Smash Karts racing game session. Race against other community members and earn XP based on your ranking.',
    xpRewards: generateSmashKartsRewards(),
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.others,
    duration: 10, // Game - 10 minutes
  },

  // TUESDAY
  {
    id: 'tue-quiz-nigerian',
    name: 'Quiz Nigerian',
    icon: '/icons/quiz-nigeria.png',
    day: 'TUESDAY',
    time: '12:30 PM',
    timeUTC: '12:30',
    description: 'Nigerian community quiz event. Test your knowledge about GenLayer in this regional quiz and compete for XP rewards.',
    xpRewards: generateQuizRewards(),
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.quizNigeria,
    duration: 10, // Quiz - 10 minutes
  },
  {
    id: 'tue-rumble-gartic',
    name: 'Rumble & Gartic',
    icon: '/icons/gartic-rumble.png',
    day: 'TUESDAY',
    time: '1:00 PM',
    timeUTC: '13:00',
    description: 'Double event! Rumble games followed by Gartic Phone drawing game. Draw, guess, and compete for XP rewards in both games.',
    xpRewards: [
      ...generateGarticRewards(),
      { position: 'Rumble Top 1', xp: 750 },
      { position: 'Rumble Top 2-5', xp: 500 },
    ],
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.rumbleGartic,
    duration: 10, // Game - 10 minutes
  },
  {
    id: 'tue-vibecoding',
    name: 'GenLayer Vibecoding Series',
    icon: '/icons/vibecoding.png',
    day: 'TUESDAY',
    time: '2:00 PM',
    timeUTC: '14:00',
    description: 'Weekly coding session with the GenLayer team. Learn about GenLayer development, build together, and share your projects.',
    xpRewards: [],
    rewards: ['Insight'],
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    hasInsight: true,
    link: DISCORD_LINKS.others,
    duration: 90, // Livestream - 1 hour 30 minutes
  },
  {
    id: 'tue-neurocreative',
    name: 'Neurocreative Challenge',
    icon: '/icons/meme-contest.png',
    day: 'TUESDAY',
    time: 'Pengumuman',
    timeUTC: '00:00',
    description: 'Weekly content creation contest. Submit your GenLayer content as X posts in #neurocreatives channel. Winners announced every Tuesday.',
    xpRewards: [
      { position: '🥇', xp: 5000 },
      { position: '🥈', xp: 4500 },
      { position: '🥉', xp: 4000 },
      { position: '🏅 4th', xp: 3500 },
      { position: '🏅 5th', xp: 3000 },
      { position: '✨ Honorary', xp: 2000 },
    ],
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.memeNeurocreative,
  },
  {
    id: 'tue-trivia-quiz',
    name: 'Trivia Quiz',
    icon: '/icons/trivia.png',
    day: 'TUESDAY',
    time: '4:00 PM',
    timeUTC: '16:00',
    description: 'General knowledge trivia quiz about GenLayer, blockchain, and more. Compete with the community and climb the leaderboard for XP.',
    xpRewards: [
      { position: 'Top 1', xp: 1500 },
      { position: 'Top 2', xp: 1400 },
      { position: 'Top 3', xp: 1300 },
      { position: 'Top 4', xp: 1200 },
      { position: 'Top 5', xp: 1100 },
      { position: 'Top 6-10', xp: 1000 },
      { position: 'Top 11-20', xp: 900 },
      { position: 'Top 21-30', xp: 800 },
      { position: 'Top 31-40', xp: 700 },
      { position: 'Top 41-50', xp: 600 },
      { position: 'Top 51-60', xp: 500 },
    ],
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.others,
    duration: 10, // Quiz - 10 minutes
  },

  // WEDNESDAY
  {
    id: 'wed-ai-blockchain',
    name: 'AI & Blockchain Quiz',
    icon: '/icons/trivia.png',
    day: 'WEDNESDAY',
    time: '1:00 PM',
    timeUTC: '13:00',
    description: 'Put your GenLayer knowledge to the test! This special quiz covers AI, blockchain, and GenLayer-specific topics. One of the biggest XP events of the week.',
    xpRewards: [
      { position: 'Top 1-3', xp: 3500 },
      { position: 'Top 4-15', xp: 3000 },
      { position: 'Top 16-30', xp: 2500 },
      { position: 'Top 31-45', xp: 2000 },
      { position: 'Top 46-60', xp: 1750 },
      { position: 'Top 61-75', xp: 1500 },
      { position: 'Top 76-100', xp: 1250 },
    ],
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    isSpecial: true,
    link: DISCORD_LINKS.aiBlockchain,
    duration: 10, // Quiz - 10 minutes
  },
  {
    id: 'wed-gentalks',
    name: 'GenTalks',
    icon: '/icons/gentalks.png',
    day: 'WEDNESDAY',
    time: '1:30 PM',
    timeUTC: '13:30',
    description: 'Weekly community talks featuring GenLayer updates, guest speakers, and discussions. Join to learn and share insights about the ecosystem.',
    xpRewards: [],
    rewards: ['Insight'],
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    hasInsight: true,
    link: DISCORD_LINKS.xSpace,
    duration: 90, // X Space - 1 hour 30 minutes
  },
  {
    id: 'wed-meme-contest',
    name: 'Meme Contest',
    icon: '/icons/meme-contest.png',
    day: 'WEDNESDAY',
    time: 'Pengumuman',
    timeUTC: '00:00',
    description: 'Weekly meme contest! Create and submit your best GenLayer memes. Winners announced every Wednesday. Top memes earn XP rewards.',
    xpRewards: [
      { position: '🥇', xp: 2500 },
      { position: '🥈', xp: 2000 },
      { position: '🥉', xp: 1750 },
      { position: '🏅 4th', xp: 1500 },
      { position: '🏅 5th', xp: 1250 },
      { position: 'Honorable', xp: 1000 },
    ],
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.memeNeurocreative,
  },
  {
    id: 'wed-geoguessr',
    name: 'GeoGuessr',
    icon: '/icons/geoguessr.png',
    day: 'WEDNESDAY',
    time: '4:00 PM',
    timeUTC: '16:00',
    description: 'Explore the world virtually! Guess locations based on Street View imagery. Test your geography skills and compete for XP.',
    xpRewards: [
      { position: 'Top 1', xp: 1500 },
      { position: 'Top 2', xp: 1400 },
      { position: 'Top 3', xp: 1300 },
      { position: 'Top 4', xp: 1200 },
      { position: 'Top 5', xp: 1100 },
      { position: 'Top 6-10', xp: 1000 },
      { position: 'Top 11-20', xp: 750 },
      { position: 'Top 21-30', xp: 500 },
    ],
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.others,
    duration: 10, // Game - 10 minutes
  },

  // THURSDAY
  {
    id: 'thu-smashkarts',
    name: 'Smash Karts (Official)',
    icon: '/icons/smashkarts.png',
    day: 'THURSDAY',
    time: '3:00 PM',
    timeUTC: '15:00',
    description: 'Official weekly Smash Karts tournament! Race against other community members in this fun multiplayer kart racing game.',
    xpRewards: generateSmashKartsRewards(),
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.others,
    duration: 10, // Game - 10 minutes
  },
  {
    id: 'thu-quiz-russian',
    name: 'Quiz Russian',
    icon: '/icons/quiz-russia.png',
    day: 'THURSDAY',
    time: '7:00 PM',
    timeUTC: '19:00',
    description: 'Russian language quiz event for the Russian community. Test your knowledge about GenLayer and compete for XP rewards.',
    xpRewards: generateQuizRewards(),
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.regionalQuiz,
    duration: 10, // Quiz - 10 minutes
  },

  // FRIDAY
  {
    id: 'fri-genfren-quiz',
    name: 'GenFren Quiz',
    icon: '/icons/genfrenquiz.png',
    day: 'FRIDAY',
    time: '3:00 PM',
    timeUTC: '15:00',
    description: 'A special quiz for our community! Stay updated with GenLayer news, follow Twitter, and test your knowledge. Perfect scores earn the Certified GenFren role!',
    xpRewards: [
      { position: '10/10', xp: 2500 },
      { position: '9/10', xp: 2250 },
      { position: '8/10', xp: 2000 },
      { position: '7/10', xp: 1750 },
    ],
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.genfrenQuiz,
    duration: 10, // Quiz - 10 minutes
  },
  {
    id: 'fri-quiz-turkish',
    name: 'Quiz Turkish',
    icon: '/icons/quiz-turkey.png',
    day: 'FRIDAY',
    time: '7:00 PM',
    timeUTC: '19:00',
    description: 'Turkish language quiz event for the Turkish community. Test your knowledge about GenLayer and compete for XP rewards.',
    xpRewards: generateQuizRewards(),
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.regionalQuiz,
    duration: 10, // Quiz - 10 minutes
  },

  // SATURDAY
  {
    id: 'sat-x-space',
    name: 'Community X Space',
    icon: '/icons/gentalks.png',
    day: 'SATURDAY',
    time: '1:00 PM',
    timeUTC: '13:00',
    description: 'Community-led X Space discussion about GenLayer. Join the conversation, share ideas, and connect with other community members.',
    xpRewards: [],
    rewards: ['GenLayer conversations & updates'],
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.xSpace,
    duration: 90, // X Space - 1 hour 30 minutes
  },
  {
    id: 'sat-gartic',
    name: 'Gartic',
    icon: '/icons/gartic.png',
    day: 'SATURDAY',
    time: '2:00 PM',
    timeUTC: '14:00',
    description: 'Gartic Phone drawing game session! Draw, guess, and laugh with the community. The artist with the most points wins XP.',
    xpRewards: generateGarticRewards(),
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.rumbleGartic,
    duration: 10, // Game - 10 minutes
  },
  {
    id: 'sat-quiz-chinese',
    name: 'Quiz Chinese',
    icon: '/icons/quiz-china.png',
    day: 'SATURDAY',
    time: '1:00 PM',
    timeUTC: '13:00',
    description: 'Chinese language quiz event for the Chinese community. Test your knowledge about GenLayer and compete for XP rewards.',
    xpRewards: generateQuizRewards(),
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.regionalQuiz,
    duration: 10, // Quiz - 10 minutes
  },
  {
    id: 'sat-quiz-indonesian',
    name: 'Quiz Indonesian',
    icon: '/icons/quiz-indonesia.png',
    day: 'SATURDAY',
    time: '2:00 PM',
    timeUTC: '14:00',
    description: 'Indonesian language quiz event for the Indonesian community. Test your knowledge about GenLayer and compete for XP rewards.',
    xpRewards: generateQuizRewards(),
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.quizIndonesia,
    duration: 10, // Quiz - 10 minutes
  },
  {
    id: 'sat-quiz-vietnamese',
    name: 'Quiz Vietnamese',
    icon: '/icons/quiz-vietnam.png',
    day: 'SATURDAY',
    time: '2:00 PM',
    timeUTC: '14:00',
    description: 'Vietnamese language quiz event for the Vietnamese community. Test your knowledge about GenLayer and compete for XP rewards.',
    xpRewards: generateQuizRewards(),
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.regionalQuiz,
    duration: 10, // Quiz - 10 minutes
  },
  {
    id: 'sat-karaoke',
    name: 'Community Karaoke & Open Mic Night',
    icon: '/icons/gentalks.png',
    day: 'SATURDAY',
    time: '4:00 PM',
    timeUTC: '16:00',
    description: 'Fun community karaoke and open mic night! Sing, share stories, and enjoy time with the community. 3 random members get XP rewards.',
    xpRewards: [{ position: 'Q&A XP Rewards', xp: 0 }],
    rewards: ['3 random members dapat XP'],
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.karaoke,
    duration: 60, // Karaoke - 60 minutes
  },
  {
    id: 'sat-quiz-indian',
    name: 'Quiz Indian',
    icon: '/icons/quiz-india.png',
    day: 'SATURDAY',
    time: '4:00 PM',
    timeUTC: '16:00',
    description: 'Indian language quiz event for the Indian community. Test your knowledge about GenLayer and compete for XP rewards.',
    xpRewards: generateQuizRewards(),
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.regionalQuiz,
    duration: 10, // Quiz - 10 minutes
  },

  // SUNDAY
  {
    id: 'sun-chesslayer',
    name: 'ChessLayer',
    icon: '/icons/chess.png',
    day: 'SUNDAY',
    time: '1:00 PM',
    timeUTC: '13:00',
    description: 'Weekly chess tournament for Brain role members! Compete in strategic matches and climb the leaderboard for XP rewards.',
    xpRewards: [
      { position: 'Top 1', xp: 2000 },
      { position: 'Top 2', xp: 1750 },
      { position: 'Top 3', xp: 1500 },
      { position: 'Top 4', xp: 1250 },
      { position: 'Top 5', xp: 1000 },
      { position: 'Top 6-10', xp: 750 },
    ],
    roleReq: 'Brain+',
    roleColor: '#a855f7',
    link: DISCORD_LINKS.pokerChess,
    duration: 10, // Game - 10 minutes
  },
  {
    id: 'sun-pokerhands',
    name: 'AllBrains PokerHands',
    icon: '/icons/poker.png',
    day: 'SUNDAY',
    time: '2:00 PM',
    timeUTC: '14:00',
    description: 'Weekly poker tournament for Neuron role members! Test your poker skills and compete for XP in this community favorite event.',
    xpRewards: [
      { position: 'Top 1', xp: 1500 },
      { position: 'Top 2', xp: 1400 },
      { position: 'Top 3', xp: 1300 },
      { position: 'Top 4', xp: 1200 },
      { position: 'Top 5', xp: 1100 },
      { position: 'Top 6-10', xp: 1000 },
      { position: 'Top 11-20', xp: 750 },
      { position: 'Top 21-30', xp: 500 },
    ],
    roleReq: 'Neuron+',
    roleColor: '#f97316',
    link: DISCORD_LINKS.pokerChess,
    duration: 10, // Game - 10 minutes
  },
  {
    id: 'sun-kirka',
    name: 'Kirka',
    icon: '/icons/kirka.png',
    day: 'SUNDAY',
    time: '3:00 PM',
    timeUTC: '15:00',
    description: 'Kirka FPS game session! Join the community for some first-person shooter action. Compete and earn XP based on your performance.',
    xpRewards: [
      { position: 'Top 1', xp: 1500 },
      { position: 'Top 2', xp: 1400 },
      { position: 'Top 3', xp: 1300 },
      { position: 'Top 4', xp: 1200 },
      { position: 'Top 5', xp: 1100 },
      { position: 'Top 6-10', xp: 1000 },
      { position: 'Top 11-20', xp: 750 },
    ],
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    link: DISCORD_LINKS.others,
    duration: 10, // Game - 10 minutes
  },
];

export const roles: Role[] = [
  {
    name: 'Molecule',
    emoji: '🟡',
    requirements: 'Level 1 (say "genm" in #neural-activity)',
    perks: 'Akses semua entry channels',
    color: '#eab308',
  },
  {
    name: 'Neuron',
    emoji: '🟠',
    requirements: 'Level 6',
    perks: 'Kirim links/images, Poker tournaments',
    color: '#f97316',
  },
  {
    name: 'Synapse',
    emoji: '🔵',
    requirements: 'Level 16 + 8 POAPs + Certified GenFren',
    perks: '#synapse-beats, Birthday channel',
    color: '#6366f1',
  },
  {
    name: 'Brain',
    emoji: '🟣',
    requirements: 'Level 32 + 16 POAPs + Certified GenFren + Neurocreative',
    perks: '#brain-chat, #genviews, Chess tournaments',
    color: '#a855f7',
  },
  {
    name: 'Singularity',
    emoji: '⭐',
    requirements: 'Level 46 + 28 POAPs + Application + Neurocreative + Certified GenFren',
    perks: '#singularity-chat, Vote contests, Followed by GenLayer X, Special Badge',
    color: '#39ff14',
  },
];

export const functionalRoles: FunctionalRole[] = [
  {
    name: 'Neurocreative',
    requirements: '8+ quality X posts OR Top 5 Contest OR 3+ Honorary (via ticket)',
    perks: '#neurocreatives channel, 1 bulan inactive = purge',
  },
  {
    name: 'Neurohost',
    requirements: 'Application based',
    perks: 'Event hosts coordination',
  },
  {
    name: 'Builder Working Group',
    requirements: 'Selected by GenLayer Team',
    perks: 'Selective role untuk developer contributions',
  },
  {
    name: 'Certified GenFren',
    requirements: '10/10 GenFren Quiz',
    perks: 'Special Badge',
  },
];

export const xpPoapSources = [
  { source: 'GenLayer Community AMA', xp: false, poap: true },
  { source: 'Quizzes (Regional, AI, GenFren, Trivia)', xp: true, poap: false },
  { source: 'Games (Gartic, Smash Karts, Kirka, GeoGuessr)', xp: true, poap: false },
  { source: 'PokerHands & ChessLayer', xp: true, poap: false },
  { source: 'Contests (Meme/Content)', xp: true, poap: false },
  { source: 'Monthly Contributor Highlights', xp: true, poap: false },
];

export const monthlyContributorHighlights = [
  { category: 'Onboarding & Community', rewards: [5000, 4500, 4000, 3000, 2000] },
  { category: 'Events', rewards: [5000, 4500, 4000, 3000, 2000] },
  { category: 'Builders', rewards: [5000, 4500, 4000, 3000, 2000] },
  { category: 'Content', rewards: [5000, 4500, 4000, 3000, 2000] },
];

export const importantNotes = [
  'Cek #today-at-genlayer setiap hari untuk jadwal update',
  'Cek #announcements untuk pembatalan event (AMA bisa dibatalkan)',
  'POAP hanya dari GenLayer Community AMA (Monday 14:00 UTC)',
  'POAP minimal: Synapse (8), Brain (16), Singularity (28)',
  'Certified GenFren diperlukan untuk role Synapse, Brain, dan Singularity',
  'Neurocreative role diperlukan untuk Brain dan Singularity',
  'Neurocreative: 1 bulan inactive = role purge',
  'Singularity applications dibuka minggu terakhir setiap bulan via tickets (max 2 member/bulan)',
  'Nickname harus sama dengan Discord untuk event game (SmashKarts, Kirka, GeoGuessr, dll)',
  'Screenshot leaderboard diperlukan jika nickname tidak match',
  'Monthly Contributor Highlights - 4 kategori - Max 5000 XP',
];

// Get current day events
export function getTodayEvents(): Event[] {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const today = days[new Date().getUTCDay()];
  return events.filter(e => e.day === today);
}

// Get events by day
export function getEventsByDay(day: string): Event[] {
  return events.filter(e => e.day === day);
}

// Calculate next event
export function getNextEvent(): Event | null {
  const now = new Date();
  const currentDay = now.getUTCDay();
  const currentHour = now.getUTCHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  // Check today's events first
  const todayEvents = getEventsByDay(days[currentDay]);
  for (const event of todayEvents) {
    const [hours, minutes] = event.timeUTC.split(':').map(Number);
    const eventTimeInMinutes = hours * 60 + minutes;
    if (eventTimeInMinutes > currentTimeInMinutes) {
      return event;
    }
  }

  // Check next days
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDay + i) % 7;
    const nextDayEvents = getEventsByDay(days[nextDayIndex]);
    if (nextDayEvents.length > 0) {
      // Return earliest event of that day
      return nextDayEvents.sort((a, b) => {
        const [hA, mA] = a.timeUTC.split(':').map(Number);
        const [hB, mB] = b.timeUTC.split(':').map(Number);
        return (hA * 60 + mA) - (hB * 60 + mB);
      })[0];
    }
  }

  return null;
}
