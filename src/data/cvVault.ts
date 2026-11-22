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
  | 'cinema'
  | 'contact';

export interface CubePieceNode {
  id: string;
  title: string;
  category: VaultCategory;
  chapterId: ChapterId;
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
  videoUrl: string;
  synopsis: string;
  techNote: string;
}

export const CATEGORY_COLORS: Record<VaultCategory, string> = {
  core: '#5eead4',
  about: '#2dd4bf',
  skills: '#38bdf8',
  experience: '#5eead4',
  credentials: '#a78bfa',
  research: '#f59e0b',
  education: '#34d399',
  projects: '#60a5fa',
  cinema: '#f472b6',
  contact: '#94a3b8',
};

export const EXECUTIVE_METRICS = [
  {
    id: 'experience-metric',
    value: '5+ yrs',
    label: 'Enterprise Consulting',
    detail: 'Sytel Reply Rome · TIM & Poste Italiane',
    accent: '#5eead4',
  },
  {
    id: 'research-metric',
    value: 'IEEE',
    label: 'ICETCI 2021 Paper',
    detail: 'Multi-Agent Anomaly Detection',
    accent: '#f59e0b',
  },
  {
    id: 'certs-metric',
    value: '10 verified certs',
    label: 'Anthropic & Cloud Academy',
    detail: 'AI Systems · Cloud · Cyber',
    accent: '#a78bfa',
  },
] as const;

export const ASSETS = {
  profileImage: '/assets/images/site.png',
  cvPdf: '/assets/aistudio/valerio_serino_cv_resume_f15997cd.pdf',
  filmOutOfOffice: '/assets/aistudio/out-of-office-compressed-2026_8ee259a8.mp4',
  filmGaia: '/assets/aistudio/gaia-compressed-2025_a85460c6.mp4',
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
  { id: 'certifications', index: '04', label: 'Credentials', focusNodeId: 'cert-anthropic' },
  { id: 'publications', index: '05', label: 'Research', focusNodeId: 'pub-icetci' },
  { id: 'education', index: '06', label: 'Education', focusNodeId: 'edu-msc' },
  { id: 'cinema', index: '07', label: 'Cinema', focusNodeId: 'cinema-ooo' },
  { id: 'contact', index: '08', label: 'Contact', focusNodeId: 'contact-node' },
];

export const ABOUT_CONTENT = {
  quote: 'With great prompts comes great responsibility',
  bio: 'Passionate about the full spectrum of computing — from AI and cybersecurity to networks and remote sensing — guided by a green-coding mindset, even when my GPU disagrees, and by a simple principle:',
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
          'Performed production-level system activities, including security remediation, server and middleware configuration updates and integrations with external enterprise systems.',
        skills: [
          'Unix-like OS',
          'PHP/Apache/Docker VM-based stacks',
          'TLS-secured communications',
          'load balancers',
          'reverse proxies',
          'DMZ network segments',
          'Burp Suite',
          'OWASP',
          'SCA & SAST analysis',
        ],
      },
      {
        description: 'Development of a prototype for LLM-agnostic customer-care suite.',
        skills: ['Agno', 'LLM agent orchestration', 'STT/TTS', 'LLM proxy'],
      },
      {
        description:
          'Led requirements analysis, solution design and development of high-volume messaging workflows, focusing on scalability, performance optimization and complex transformations to core business processes.',
        skills: [
          'C90',
          'Cassandra',
          'Redis',
          'MongoDB',
          'Oracle DB',
          'SQLite',
          'Filebeat',
          'RabbitMQ',
          'HTTPS/UCP/SMPP interfaces',
        ],
      },
      {
        description:
          'Development and maintenance of advanced security features, including verification solutions such as CAPTCHA and OTP systems.',
        skills: ['Oracle Apex', 'Oracle DB', 'Java', 'Cybersecurity'],
      },
      {
        description:
          'Researched and engineered offline-capable, queryable knowledge bases to support AI-ready data workflows.',
        skills: ['LLMs', 'LangChain', 'LangGraph', 'RAG pipelines', 'LLM Evaluation'],
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
        description:
          'Analysis, development and vulnerability assessment of business process impacts.',
        skills: ['Java', 'WebLogic', 'Oracle SQL', 'IVR'],
      },
      {
        description:
          'Creation of a GUI to automate development processes, integrating a local LLM as an end-user support tool.',
        skills: ['Python', 'LLM', 'REST'],
      },
      {
        description:
          'Analysis and development of critical remediation actions on production DBs and application servers.',
        skills: ['Oracle SQL', 'HP-UX', 'Apache Reverse Proxy'],
      },
      {
        description: 'Implementation of service migration from JMS queues to Kafka.',
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
        description:
          'Development of SW adapters to old processes with related vulnerability analysis.',
        skills: ['WebLogic', 'EJB', 'MDB'],
      },
      {
        description:
          'Development of a data collection process and creation of related dashboards on Kibana.',
        skills: ['ELK stack', 'Korn shell', 'Solaris'],
      },
      {
        description: 'SW security returns on a client/server system.',
        skills: [
          'From Java 4 to Java 8',
          'Java RMI',
          'Oracle SQL',
          'TLS 1.2',
          'Digital Certificates',
          'Encryption',
        ],
      },
      {
        description: 'Microservices development.',
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
        title:
          'Big Data & Semantic Web: Ontology design with machine learning classification for seismic events',
        summary:
          'Development of a high-level architecture combining machine-learning-based multiclass classification of seismic events with a semantic-web ontology designed to collect, structure and enrich predicted event information using Linked Open Data resources such as DBpedia.',
      },
      {
        id: 'proj-telecom',
        nodeId: 'proj-telecom',
        title: 'Telecommunication Networks: Packet manipulation with error correction',
        summary:
          'The project aims to evaluate the effectiveness of packet manipulation attacks in which an attacker artificially modifies the fields of an IP packet. The retransmission protocol considered is the ARQ stop and wait protocol in full duplex mode and, in particular, in piggyback configuration and three correction mechanisms have been examined: parity bit, parity matrix, standard CRC.',
      },
      {
        id: 'proj-robotics',
        nodeId: 'proj-robotics',
        title: 'Cognitive Robotics: Competition',
        summary:
          'Realization of a software to automatically move a robot inside a simulated football field (ROS, Gazebo). The robot must:',
        bullets: [
          'Move independently.',
          'Identify the presence and position of the soccer ball (MobileNetSSDv2 object detector and detection by tracking).',
          'Identify the presence and position of the football goal.',
          'Identify the presence and position of obstacles (which can obstruct the ball).',
          'Move the ball into the goal while avoiding obstacles.',
        ],
      },
      {
        id: 'proj-vision',
        nodeId: 'proj-vision',
        title: 'Artificial Vision: License Plate Detection and Recognition',
        summary:
          'The aim of the project is to create an automatic system capable in the first instance of detecting the presence of license plates (buses, cars, mopeds, etc.) in different scenarios (in the wild, for example rain, snow, different angles and rotations, etc.), and subsequently recognize the characters that constitute them. System design:',
        bullets: [
          'A subsystem responsible for detection (YOLOv3).',
          'A subsystem that deals with image rectification (Xception).',
          'A subsystem, Optical Character Recognition, which deals with the recognition of the characters present in the plate (pre-processing and CRNN).',
        ],
      },
      {
        id: 'proj-dp3t',
        nodeId: 'proj-dp3t',
        title:
          'Cybersecurity: Fake Contact Avoidance on a Decentralized Privacy-Preserving Contact Tracing System (DP3T) (COVID-19)',
        summary:
          'Realization of a security scheme for the DP3T tracking system capable of avoiding the possibility of an adversary reporting false contacts between the users of the application (replay attack). The objectives of the project is to prevent the malicious user from communicating false contacts between citizens: to prevent the opponent from disclosing one or more ephemeral codes of others, saved on their device, to the citizen with whom they will come into contact.',
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
    videoUrl: ASSETS.filmOutOfOffice,
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
    videoUrl: ASSETS.filmGaia,
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
    summary:
      'Sensing multi-agent system for anomaly detection on crop fields exploiting the phenological and historical context.',
    gridPos: [0, 1, 1],
    explodedDistance: 2.5,
    meta: 'Chapter 05 · IEEE Research',
  },
  {
    id: 'edu-msc',
    title: "M.Sc. Computer Engineering · Salerno",
    category: 'education',
    chapterId: 'education',
    summary:
      '2018 - 2021 (in English): Intelligent vegetation monitoring thesis with Earth Observation, Kafka, ML, Semantic Web & Ontologies.',
    gridPos: [0, 1, -1],
    explodedDistance: 2.75,
    meta: 'Chapter 06 · 2018 – 2021',
  },
  {
    id: 'edu-bsc',
    title: "B.Sc. Computer Engineering · Salerno",
    category: 'education',
    chapterId: 'education',
    summary: '2014 - 2018: Responsive Web App for real-time feedback collection.',
    gridPos: [1, 1, -1],
    explodedDistance: 3.85,
    meta: 'Subsection · 2014 – 2018',
  },
  {
    id: 'proj-semantic',
    title: 'Big Data & Semantic Web: Seismic Ontology',
    category: 'projects',
    chapterId: 'education',
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
    chapterId: 'education',
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
    chapterId: 'education',
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
    chapterId: 'education',
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
    chapterId: 'education',
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
    summary: 'Docker, OpenShift, Jenkins, Apache Reverse Proxy, Unix/Solaris.',
    gridPos: [1, -1, -1],
    explodedDistance: 4.45,
    meta: 'Core Module · Cloud',
  },
  {
    id: 'pillar-cinema',
    title: 'Core · Generative Cinema Pipeline',
    category: 'core',
    chapterId: 'cinema',
    summary: 'ComfyUI, Hugging Face video models, Google Veo 2, audio synthesis.',
    gridPos: [-1, -1, 0],
    explodedDistance: 4.1,
    meta: 'Core Module · Cinema',
  },
];
