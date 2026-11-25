export type VaultCategory =
  | 'about'
  | 'skills'
  | 'experience'
  | 'credentials'
  | 'research'
  | 'education'
  | 'projects'
  | 'cinema'
  | 'contact'
  | 'core';

export type ChapterId =
  | 'home'
  | 'about'
  | 'skills'
  | 'experience'
  | 'certifications'
  | 'publications'
  | 'education'
  | 'projects'
  | 'cinema'
  | 'contact';

export interface CubePieceNode {
  id: string;
  title: string;
  category: VaultCategory;
  chapterId: ChapterId;
  tonalColor: string;
  summary: string;
  gridPos: [number, number, number]; // {-1, 0, 1}^3 \ {(0,0,0)}
  explodedDistance: number; // distinct radial distance from center pulsing sphere
  meta?: string;
}

export interface ExperienceActivity {
  description: string;
  skills: string[];
}

export interface ExperiencePhase {
  id: string;
  nodeId: string;
  role: string;
  period: string;
  shortLabel: string;
  activities: ExperienceActivity[];
}

export interface EducationProject {
  id: string;
  nodeId: string;
  title: string;
  summary: string;
  bullets?: string[];
}

export interface CinemaFilm {
  id: string;
  nodeId: string;
  title: string;
  contest: string;
  year: string;
  posterUrl: string;
  videoUrl: string;
  fallbackVideoUrl?: string;
  synopsis: string;
  techNote: string;
}

export interface ChapterPalette {
  obsidian: string;
  lightInk: string;
  label: string;
}

export const CHAPTER_PALETTES: Record<ChapterId, ChapterPalette> = {
  home: { obsidian: '#5eead4', lightInk: '#09090b', label: 'Core Teal' },
  about: { obsidian: '#22d3ee', lightInk: '#0e7490', label: 'Cyan' },
  skills: { obsidian: '#3b82f6', lightInk: '#1d4ed8', label: 'Cobalt Blue' },
  experience: { obsidian: '#14b8a6', lightInk: '#0f766e', label: 'Deep Teal' },
  certifications: { obsidian: '#a78bfa', lightInk: '#6d28d9', label: 'Amethyst Violet' },
  publications: { obsidian: '#f59e0b', lightInk: '#b45309', label: 'Solar Amber' },
  education: { obsidian: '#10b981', lightInk: '#047857', label: 'Emerald' },
  projects: { obsidian: '#84cc16', lightInk: '#3f6212', label: 'Lime' },
  cinema: { obsidian: '#f472b6', lightInk: '#be185d', label: 'Cinema Rose' },
  contact: { obsidian: '#cbd5e1', lightInk: '#18181b', label: 'Titanium Slate' },
};

export const CATEGORY_COLORS: Record<VaultCategory, string> = {
  core: CHAPTER_PALETTES.home.obsidian,
  about: CHAPTER_PALETTES.about.obsidian,
  skills: CHAPTER_PALETTES.skills.obsidian,
  experience: CHAPTER_PALETTES.experience.obsidian,
  credentials: CHAPTER_PALETTES.certifications.obsidian,
  research: CHAPTER_PALETTES.publications.obsidian,
  education: CHAPTER_PALETTES.education.obsidian,
  projects: CHAPTER_PALETTES.projects.obsidian,
  cinema: CHAPTER_PALETTES.cinema.obsidian,
  contact: CHAPTER_PALETTES.contact.obsidian,
};

export const EXECUTIVE_METRICS = [
  {
    id: 'experience-metric',
    value: '5+ yrs',
    label: 'Enterprise Consulting',
    detail: 'Sytel Reply Rome · TIM & Poste Italiane',
    accent: CHAPTER_PALETTES.experience.obsidian,
    lightAccent: CHAPTER_PALETTES.experience.lightInk,
  },
  {
    id: 'research-metric',
    value: 'IEEE',
    label: 'ICETCI 2021 Paper',
    detail: 'Multi-Agent Anomaly Detection',
    accent: CHAPTER_PALETTES.publications.obsidian,
    lightAccent: CHAPTER_PALETTES.publications.lightInk,
  },
  {
    id: 'certs-metric',
    value: '10 verified certs',
    label: 'Anthropic & Cloud Academy',
    detail: 'AI Systems · Cloud · Cyber',
    accent: CHAPTER_PALETTES.certifications.obsidian,
    lightAccent: CHAPTER_PALETTES.certifications.lightInk,
  },
] as const;

const BASE = import.meta.env.BASE_URL;

export const ASSETS = {
  profileImage: `${BASE}assets/images/site.png`,
  cvPdf: `${BASE}assets/aistudio/valerio_serino_cv_resume_f15997cd.pdf`,
  filmOutOfOffice: `${BASE}assets/aistudio/out-of-office-compressed-2026_8ee259a8.mp4`,
  filmOutOfOfficePoster: `${BASE}assets/images/poster-out-of-office.jpg`,
  filmGaia: `${BASE}assets/aistudio/gaia-compressed-2025_a85460c6.mp4`,
  filmGaiaPoster: `${BASE}assets/images/poster-gaia.jpg`,
} as const;

export const CHAPTERS: {
  id: ChapterId;
  index: string;
  label: string;
  focusNodeId: string;
}[] = [
  { id: 'home', index: '00', label: 'Home', focusNodeId: 'about-mindset' },
  { id: 'about', index: '01', label: 'About', focusNodeId: 'about-mindset' },
  { id: 'skills', index: '02', label: 'Skills', focusNodeId: 'skills-tech' },
  { id: 'experience', index: '03', label: 'Experience', focusNodeId: 'exp-senior' },
  { id: 'certifications', index: '04', label: 'Certifications', focusNodeId: 'cert-anthropic' },
  { id: 'publications', index: '05', label: 'Research', focusNodeId: 'pub-icetci' },
  { id: 'education', index: '06', label: 'Education', focusNodeId: 'edu-msc' },
  { id: 'projects', index: '07', label: 'Projects', focusNodeId: 'proj-semantic' },
  { id: 'cinema', index: '08', label: 'AI Film', focusNodeId: 'cinema-ooo' },
  { id: 'contact', index: '09', label: 'Contact', focusNodeId: 'contact-node' },
];

export const ABOUT_CONTENT = {
  quote: 'With great prompts comes great responsibility',
  bio: 'Passionate about computing — from AI and cybersecurity to networks and remote sensing — guided by a green-coding mindset (even when my GPU disagrees) and one principle:',
  promptGreeting: 'Hey! Scroll down to learn more about me …',
};

export const SKILLS_GROUPS = [
  {
    id: 'skills-lang',
    title: 'Programming Languages',
    items: ['C', 'Java', 'Python', 'Shell Scripting', 'Web Languages', 'Matlab'],
  },
  {
    id: 'skills-tech',
    title: 'Technologies',
    items: [
      'Docker',
      'OpenShift',
      'Oracle SQL',
      'Operating Systems',
      'Artificial Vision',
      'LLM & RAG',
      'Git',
      'Jenkins',
      'Earth Observation',
      'Reverse Engineering',
      'WebLogic',
    ],
  },
  {
    id: 'skills-soft',
    title: 'Soft Skills',
    items: ['Teamwork', 'Empathy', 'Problem Solving', 'Deadline Compliance'],
  },
] as const;

export const WORK_EXPERIENCE_COMPANY =
  'Sytel Reply Rome (mission-critical enterprise systems for TIM & Poste Italiane)';

export const EXPERIENCE_PHASES: ExperiencePhase[] = [
  {
    id: 'senior',
    nodeId: 'exp-senior',
    role: 'Senior IT Consultant',
    shortLabel: 'Senior IT Consultant',
    period: 'Mar 2025 - Current',
    activities: [
      {
        description:
          'Production security remediation, server/middleware hardening, and enterprise integrations.',
        skills: [
          'Unix-like OS',
          'PHP/Apache/Docker',
          'TLS',
          'Load Balancers',
          'Reverse Proxy',
          'DMZ',
          'Burp Suite',
          'OWASP',
          'SCA & SAST',
        ],
      },
      {
        description: 'Prototype for an LLM-agnostic customer-care AI suite.',
        skills: ['Agno', 'LLM Agent Orchestration', 'STT/TTS', 'LLM Proxy'],
      },
      {
        description:
          'Architecture & optimization of high-volume messaging workflows and core data pipelines.',
        skills: [
          'C90',
          'Cassandra',
          'Redis',
          'MongoDB',
          'Oracle DB',
          'SQLite',
          'Filebeat',
          'RabbitMQ',
          'HTTPS/UCP/SMPP',
        ],
      },
      {
        description: 'Design & maintenance of user-verification modules (CAPTCHA, OTP).',
        skills: ['Oracle Apex', 'Oracle DB', 'Java', 'Cybersecurity'],
      },
      {
        description:
          'Offline-capable, queryable knowledge bases powering AI-ready RAG workflows.',
        skills: ['LLMs', 'LangChain', 'LangGraph', 'RAG Pipelines', 'LLM Evaluation'],
      },
    ],
  },
  {
    id: 'consultant',
    nodeId: 'exp-consultant',
    role: 'IT Consultant',
    shortLabel: 'IT Consultant',
    period: 'May 2023 - Mar 2025',
    activities: [
      {
        description: 'Business process impact analysis, development, and vulnerability assessment.',
        skills: ['Java', 'WebLogic', 'Oracle SQL', 'IVR'],
      },
      {
        description: 'Dev-automation GUI integrating a local LLM for team & end-user support.',
        skills: ['Python', 'LLM', 'REST'],
      },
      {
        description: 'Critical security & performance remediations on production DBs and app servers.',
        skills: ['Oracle SQL', 'HP-UX', 'Apache Reverse Proxy'],
      },
      {
        description: 'Service migration from legacy JMS queues to event-driven Apache Kafka.',
        skills: ['JMS', 'Docker', 'Apache Kafka'],
      },
    ],
  },
  {
    id: 'junior',
    nodeId: 'exp-junior',
    role: 'Junior IT Consultant',
    shortLabel: 'Junior IT Consultant',
    period: 'May 2021 - May 2023',
    activities: [
      {
        description: 'Legacy software adapters paired with targeted vulnerability analysis.',
        skills: ['WebLogic', 'EJB', 'MDB'],
      },
      {
        description: 'Data collection pipeline and real-time operational dashboards on Kibana.',
        skills: ['ELK Stack', 'Korn Shell', 'Solaris'],
      },
      {
        description: 'Client/server security modernization and TLS transport hardening.',
        skills: [
          'Java 4 → 8',
          'Java RMI',
          'Oracle SQL',
          'TLS 1.2',
          'Digital Certificates',
          'Encryption',
        ],
      },
      {
        description: 'Containerized microservices design and CI/CD delivery.',
        skills: ['Jenkins', 'Docker', 'OpenShift'],
      },
    ],
  },
];

export const CERTIFICATIONS = [
  {
    provider: 'Anthropic',
    nodeId: 'cert-anthropic',
    items: [
      'Claude 101',
      'Introduction to Claude Cowork',
      'Claude Code in Action',
      'AI Fluency: Framework & Foundations',
      'Building with the Claude API',
    ],
  },
  {
    provider: 'Cloud Academy, Inc.',
    nodeId: 'cert-cloudacademy',
    items: [
      'Typescript: Zero to Hero',
      'Docker Certified Associate (DCA) Exam Preparation',
      'Becoming a Cloud Architect - Learn the Fundamentals',
      'Cyber Primer',
      'Machine Learning on Google Cloud Platform',
    ],
  },
] as const;

export const PUBLICATION = {
  title:
    'Sensing multi-agent system for anomaly detection on crop fields exploiting the phenological and historical context.',
  venue:
    '2021 International Conference on Emerging Techniques in Computational Intelligence (ICETCI), IEEE · 27 ott 2021',
  url: 'https://ieeexplore.ieee.org/document/9574046',
};

export const EDUCATION_DEGREES = {
  msc: {
    degree: "Master's degree in Computer Engineering, System and Applications (in English)",
    institution: 'The University of Salerno',
    period: '2018 - 2021',
    thesis:
      'Intelligent system for monitoring and detecting critical situations on the state of vegetation in forest/agricultural contexts',
    skills: [
      'Python',
      'Earth Observation',
      'Apache Kafka',
      'Machine Learning',
      'Semantic Web',
      'Ontologies',
    ],
    projects: [
      {
        id: 'proj-semantic',
        nodeId: 'proj-semantic',
        title: 'Big Data & Semantic Web: Seismic Classification Ontology',
        summary:
          'Multiclass ML seismic event classification enriched with a Semantic Web ontology and Linked Open Data (DBpedia).',
      },
      {
        id: 'proj-telecom',
        nodeId: 'proj-telecom',
        title: 'Telecom Networks: Packet Manipulation & Error Correction',
        summary:
          'Evaluated IP packet manipulation over full-duplex ARQ Stop-and-Wait (piggyback), comparing parity bit, parity matrix, and CRC defenses.',
      },
      {
        id: 'proj-robotics',
        nodeId: 'proj-robotics',
        title: 'Cognitive Robotics: Autonomous Football Simulation',
        summary: 'Autonomous ROS/Gazebo soccer robot pipeline:',
        bullets: [
          'Independent navigation and obstacle avoidance.',
          'Real-time ball detection & tracking via MobileNetSSDv2.',
          'Goal localization and controlled ball-to-goal scoring.',
        ],
      },
      {
        id: 'proj-vision',
        nodeId: 'proj-vision',
        title: 'Artificial Vision: License Plate Detection & Recognition',
        summary:
          'End-to-end ALPR pipeline resilient to weather, angles, and motion:',
        bullets: [
          'In-the-wild plate detection (YOLOv3).',
          'Perspective image rectification (Xception).',
          'Pre-processing and OCR character recognition (CRNN).',
        ],
      },
      {
        id: 'proj-dp3t',
        nodeId: 'proj-dp3t',
        title: 'Cybersecurity: DP3T Replay Attack Defense',
        summary:
          'Security extension for decentralized privacy-preserving contact tracing (DP3T) blocking replay attacks and forged ephemeral contact reports.',
      },
    ] as EducationProject[],
  },
  bsc: {
    degree: "Bachelor's degree in Computer Engineering",
    institution: 'The University of Salerno',
    period: '2014 - 2018',
    thesis:
      'Design and implementation of a responsive Web App for real-time feedback collection',
    skills: ['Web Languages'],
  },
};

export const CINEMA_FILMS: CinemaFilm[] = [
  {
    id: 'out-of-office',
    nodeId: 'cinema-ooo',
    title: 'OUT-OF-OFFICE',
    contest: 'Reply AI Film Contest 2026',
    year: '2026',
    posterUrl: ASSETS.filmOutOfOfficePoster,
    videoUrl: ASSETS.filmOutOfOffice,
    fallbackVideoUrl:
      'https://root-vs.github.io/cv-ai-assistant/videos/out-of-office-compressed-2026.mp4',
    synopsis:
      'A man returns to a sterile office after an impossible digital detour, where the rhythm of work dissolves into a luminous, machine-made dream.',
    techNote:
      'Created locally with a ComfyUI pipeline and multiple Hugging Face video models.',
  },
  {
    id: 'gaia',
    nodeId: 'cinema-gaia',
    title: 'GAIA',
    contest: 'Reply AI Film Contest 2025',
    year: '2025',
    posterUrl: ASSETS.filmGaiaPoster,
    videoUrl: ASSETS.filmGaia,
    fallbackVideoUrl:
      'https://root-vs.github.io/cv-ai-assistant/videos/gaia-compressed-2025.mp4',
    synopsis:
      'A lone traveler drifts through a living planet, where memory, weather, and ancient silence collapse into a fragile future.',
    techNote:
      'Generated with Google Veo 2, paired with a custom pipeline for music, voice, and sound design.',
  },
];

export const CONTACT_INFO = {
  location: 'Avellino, IT',
  phoneDisplay: '(+39) 3469554008',
  phoneHref: 'tel:+393469554008',
  email: 'valerioserino.info@gmail.com',
  emailHref: 'mailto:valerioserino.info@gmail.com',
  linkedinLabel: 'Valerio Serino',
  linkedinUrl: 'https://www.linkedin.com/in/valerioserino/',
};

// All 26 cubetti forming a seamless 3x3x3 outer cube around the central pulsing sphere (0,0,0).
// Every section & subsection occupies its own cubetto connected at a distinct radial distance.
export const CUBE_PIECES: CubePieceNode[] = [
  {
    id: 'about-mindset',
    title: 'About · Green-Coding Mindset',
    category: 'about',
    chapterId: 'about',
    tonalColor: '#22d3ee',
    summary:
      'Full spectrum of computing from AI and cybersecurity to networks and remote sensing, guided by prompt responsibility.',
    gridPos: [0, 0, 1],
    explodedDistance: 2.3,
    meta: 'Chapter 01 · About',
  },
  {
    id: 'skills-lang',
    title: 'Skills · Programming Languages',
    category: 'skills',
    chapterId: 'skills',
    tonalColor: '#60a5fa',
    summary: 'C, Java, Python, Shell Scripting, Web Languages, Matlab.',
    gridPos: [1, 0, 1],
    explodedDistance: 2.85,
    meta: 'Subsection · 6 Languages',
  },
  {
    id: 'skills-tech',
    title: 'Skills · Technologies & AI Stack',
    category: 'skills',
    chapterId: 'skills',
    tonalColor: '#3b82f6',
    summary:
      'Docker, OpenShift, Oracle SQL, OS, Artificial Vision, LLM & RAG, Git, Jenkins, Earth Observation, Reverse Engineering, WebLogic.',
    gridPos: [1, 1, 0],
    explodedDistance: 2.55,
    meta: 'Chapter 02 · Technologies',
  },
  {
    id: 'skills-soft',
    title: 'Skills · Soft Skills',
    category: 'skills',
    chapterId: 'skills',
    tonalColor: '#93c5fd',
    summary: 'Teamwork, Empathy, Problem Solving, Deadline Compliance.',
    gridPos: [1, -1, 1],
    explodedDistance: 3.45,
    meta: 'Subsection · Soft Skills',
  },
  {
    id: 'exp-senior',
    title: 'Senior IT Consultant · Sytel Reply',
    category: 'experience',
    chapterId: 'experience',
    tonalColor: '#2dd4bf',
    summary:
      'Mar 2025 - Current: Security remediation, LLM-agnostic customer-care suite, high-volume messaging, CAPTCHA/OTP, offline RAG.',
    gridPos: [-1, 0, 1],
    explodedDistance: 2.25,
    meta: 'Phase 01 · Mar 2025 – Current',
  },
  {
    id: 'exp-consultant',
    title: 'IT Consultant · Sytel Reply',
    category: 'experience',
    chapterId: 'experience',
    tonalColor: '#14b8a6',
    summary:
      'May 2023 - Mar 2025: Vulnerability assessment, local LLM automation GUI, critical DB/server remediations, JMS to Kafka migration.',
    gridPos: [-1, 1, 0],
    explodedDistance: 2.95,
    meta: 'Phase 02 · May 2023 – Mar 2025',
  },
  {
    id: 'exp-junior',
    title: 'Junior IT Consultant · Sytel Reply',
    category: 'experience',
    chapterId: 'experience',
    tonalColor: '#0d9488',
    summary:
      'May 2021 - May 2023: WebLogic EJB/MDB adapters, ELK/Kibana dashboards on Solaris, Java 4-to-8 RMI TLS 1.2, OpenShift microservices.',
    gridPos: [-1, -1, 1],
    explodedDistance: 3.65,
    meta: 'Phase 03 · May 2021 – May 2023',
  },
  {
    id: 'cert-anthropic',
    title: 'Anthropic Certifications (5)',
    category: 'credentials',
    chapterId: 'certifications',
    tonalColor: '#a78bfa',
    summary:
      'Claude 101, Introduction to Claude Cowork, Claude Code in Action, AI Fluency: Framework & Foundations, Building with the Claude API.',
    gridPos: [0, -1, 1],
    explodedDistance: 2.7,
    meta: 'Chapter 04 · Anthropic',
  },
  {
    id: 'cert-cloudacademy',
    title: 'Cloud Academy Certifications (5)',
    category: 'credentials',
    chapterId: 'certifications',
    tonalColor: '#c4b5fd',
    summary:
      'TypeScript Zero to Hero, Docker Certified Associate (DCA), Cloud Architect Fundamentals, Cyber Primer, ML on GCP.',
    gridPos: [1, -1, 0],
    explodedDistance: 3.35,
    meta: 'Subsection · Cloud Academy',
  },
  {
    id: 'pub-icetci',
    title: 'IEEE ICETCI 2021 Publication',
    category: 'research',
    chapterId: 'publications',
    tonalColor: '#f59e0b',
    summary:
      'Sensing multi-agent system for anomaly detection on crop fields exploiting the phenological and historical context.',
    gridPos: [0, 1, 1],
    explodedDistance: 2.5,
    meta: 'Chapter 05 · IEEE Research',
  },
  {
    id: 'edu-msc',
    title: 'M.Sc. Computer Engineering · Salerno',
    category: 'education',
    chapterId: 'education',
    tonalColor: '#10b981',
    summary:
      '2018 - 2021 (in English): Intelligent vegetation monitoring thesis with Earth Observation, Kafka, ML, Semantic Web & Ontologies.',
    gridPos: [0, 1, -1],
    explodedDistance: 2.75,
    meta: 'Chapter 06 · 2018 – 2021',
  },
  {
    id: 'edu-bsc',
    title: 'B.Sc. Computer Engineering · Salerno',
    category: 'education',
    chapterId: 'education',
    tonalColor: '#34d399',
    summary: '2014 - 2018: Responsive Web App for real-time feedback collection.',
    gridPos: [1, 1, -1],
    explodedDistance: 3.85,
    meta: 'Subsection · 2014 – 2018',
  },
  {
    id: 'proj-semantic',
    title: 'Big Data & Semantic Web: Seismic Ontology',
    category: 'projects',
    chapterId: 'projects',
    tonalColor: '#84cc16',
    summary:
      'ML multiclass seismic classification enriched via Semantic Web ontologies and Linked Open Data (DBpedia).',
    gridPos: [-1, 1, -1],
    explodedDistance: 4.25,
    meta: 'M.Sc. Project 01',
  },
  {
    id: 'proj-telecom',
    title: 'Telecom Networks: ARQ & CRC Security',
    category: 'projects',
    chapterId: 'projects',
    tonalColor: '#a3e635',
    summary:
      'Packet manipulation evaluation on full-duplex ARQ Stop-and-Wait piggyback with parity bit, parity matrix & CRC.',
    gridPos: [1, 0, -1],
    explodedDistance: 4.05,
    meta: 'M.Sc. Project 02',
  },
  {
    id: 'proj-robotics',
    title: 'Cognitive Robotics: ROS & Gazebo',
    category: 'projects',
    chapterId: 'projects',
    tonalColor: '#bef264',
    summary:
      'Autonomous robot navigation in simulated football field with MobileNetSSDv2 tracking and obstacle avoidance.',
    gridPos: [-1, 0, -1],
    explodedDistance: 4.35,
    meta: 'M.Sc. Project 03',
  },
  {
    id: 'proj-vision',
    title: 'Artificial Vision: ALPR (YOLOv3 + CRNN)',
    category: 'projects',
    chapterId: 'projects',
    tonalColor: '#65a30d',
    summary:
      'License plate detection (YOLOv3), image rectification (Xception), and OCR character recognition (CRNN).',
    gridPos: [0, 1, 0],
    explodedDistance: 3.2,
    meta: 'M.Sc. Project 04',
  },
  {
    id: 'proj-dp3t',
    title: 'Cybersecurity: DP3T Replay Defense',
    category: 'projects',
    chapterId: 'projects',
    tonalColor: '#4d7c0f',
    summary:
      'Decentralized privacy-preserving contact tracing security scheme preventing fake contact replay attacks.',
    gridPos: [-1, 1, 1],
    explodedDistance: 3.95,
    meta: 'M.Sc. Project 05',
  },
  {
    id: 'cinema-ooo',
    title: 'OUT-OF-OFFICE · Reply Film Contest 2026',
    category: 'cinema',
    chapterId: 'cinema',
    tonalColor: '#f472b6',
    summary:
      'Local ComfyUI pipeline and multiple Hugging Face video models exploring machine-made surrealism.',
    gridPos: [0, -1, -1],
    explodedDistance: 2.65,
    meta: 'Chapter 07 · Film 2026',
  },
  {
    id: 'cinema-gaia',
    title: 'GAIA · Reply Film Contest 2025',
    category: 'cinema',
    chapterId: 'cinema',
    tonalColor: '#f9a8d4',
    summary:
      'Generated with Google Veo 2, paired with a custom pipeline for music, voice, and sound design.',
    gridPos: [-1, -1, -1],
    explodedDistance: 3.55,
    meta: 'Subsection · Film 2025',
  },
  {
    id: 'contact-node',
    title: 'Contact · Avellino, IT',
    category: 'contact',
    chapterId: 'contact',
    tonalColor: '#cbd5e1',
    summary: 'valerioserino.info@gmail.com · (+39) 3469554008 · LinkedIn & PDF Resume.',
    gridPos: [0, 0, -1],
    explodedDistance: 2.45,
    meta: 'Chapter 08 · Contact',
  },
  {
    id: 'pillar-ai',
    title: 'Core · LLM & Agent Orchestration',
    category: 'core',
    chapterId: 'skills',
    tonalColor: '#2563eb',
    summary: 'Agno, LangChain, LangGraph, RAG pipelines, LLM proxy & evaluation.',
    gridPos: [1, 0, 0],
    explodedDistance: 3.15,
    meta: 'Core Module · AI',
  },
  {
    id: 'pillar-sec',
    title: 'Core · Enterprise Security & TLS',
    category: 'core',
    chapterId: 'experience',
    tonalColor: '#5eead4',
    summary: 'OWASP, Burp Suite, SCA & SAST, DMZ, TLS 1.2, CAPTCHA & OTP.',
    gridPos: [-1, 0, 0],
    explodedDistance: 3.3,
    meta: 'Core Module · Security',
  },
  {
    id: 'pillar-cloud',
    title: 'Core · Distributed Messaging & DBs',
    category: 'core',
    chapterId: 'experience',
    tonalColor: '#0f766e',
    summary: 'Apache Kafka, RabbitMQ, Cassandra, Redis, MongoDB, Oracle DB.',
    gridPos: [0, -1, 0],
    explodedDistance: 3.75,
    meta: 'Core Module · Systems',
  },
  {
    id: 'pillar-vision',
    title: 'Core · Remote Sensing & Vision',
    category: 'core',
    chapterId: 'publications',
    tonalColor: '#fcd34d',
    summary: 'Earth Observation phenological anomaly detection & YOLOv3/CRNN.',
    gridPos: [1, 1, 1],
    explodedDistance: 4.15,
    meta: 'Core Module · Sensing',
  },
  {
    id: 'pillar-devops',
    title: 'Core · Containers & Cloud Delivery',
    category: 'core',
    chapterId: 'certifications',
    tonalColor: '#8b5cf6',
    summary: 'Docker, OpenShift, Jenkins, Apache Reverse Proxy, Unix/Solaris.',
    gridPos: [1, -1, -1],
    explodedDistance: 4.45,
    meta: 'Core Module · Cloud',
  },
  {
    id: 'pillar-cinema',
    title: 'Core · Generative AI Film Pipeline',
    category: 'core',
    chapterId: 'cinema',
    tonalColor: '#ec4899',
    summary: 'ComfyUI, Hugging Face video models, Google Veo 2, audio synthesis.',
    gridPos: [-1, -1, 0],
    explodedDistance: 4.1,
    meta: 'Core Module · AI Film',
  },
];
