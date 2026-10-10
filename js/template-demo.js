/**
 * Folioryn — Interactive 6-Template Showroom Demo Engine
 * Renders realistic, authentic sample profiles for each of the 6 design archetypes.
 * Completely isolated from private user data: never leaks logged-in profiles.
 */

import { getActiveUser, savePublishSettings, getPublishSettings } from './profile-data.js';

// ==============================================================================
// 1. 6 Fictional Datasets for the 6 Archetypes
// ==============================================================================
export const DEMO_DATASETS = {
  'minimal-professional': {
    id: 'minimal-professional',
    name: 'Minimal Professional',
    badge: 'Senior & Executive Archetype',
    person: {
      fullName: 'Sunny Singh',
      handle: '@sunnysingh',
      headline: 'Principal Systems Architect & Distributed Infrastructure Lead',
      status: 'Architecting hyperscale distributed systems & developer platforms',
      bio: 'Principal engineer with deep expertise in distributed consensus, low-latency microsecond runtimes, zero-trust cloud infrastructure, and modern developer platforms. Passionate about minimalism, sub-millisecond execution, and high-throughput systems serving hundreds of millions of users.',
      location: 'Bangalore, India',
      githubUrl: 'https://github.com/sunnysingh-dev',
      email: 'sunny.singh@folioryn.dev',
      archetypeNote: 'Flagship Minimal Professional Archetype'
    },
    projects: [
      {
        title: 'Titan Core: Distributed Consensus Log Engine',
        description: 'Fault-tolerant Raft-based distributed commit log engine processing 2.8M write operations/sec with zero disk stalls and sub-0.5ms p99 write latency across multi-cloud clusters.',
        tags: ['Rust', 'Raft Consensus', 'Zero-Copy I/O', 'eBPF', 'Distributed Storage'],
        repo_url: 'https://github.com/sunnysingh-dev/titan-core',
        live_url: 'https://titan-demo.folioryn.dev',
        featured: true
      },
      {
        title: 'Hyperion Zero-Trust Service Mesh',
        description: 'Microsecond-latency edge service proxy enforcing mutual TLS, cryptographically signed JWTs, and dynamic rate limiting across 1,800+ microservices with less than 0.6ms overhead.',
        tags: ['Go', 'eBPF Kernel Probes', 'mTLS', 'Envoy API', 'gRPC'],
        repo_url: 'https://github.com/sunnysingh-dev/hyperion-mesh',
        live_url: 'https://hyperion-demo.folioryn.dev',
        featured: true
      },
      {
        title: 'Nexus Real-Time Telemetry & Observability Pipeline',
        description: 'Column-oriented metrics and distributed tracing platform with automated anomaly detection, vectorized query processing, and full ANSI SQL compatibility.',
        tags: ['C++20', 'ClickHouse', 'Vector AST', 'OpenTelemetry'],
        repo_url: 'https://github.com/sunnysingh-dev/nexus-telemetry',
        live_url: 'https://nexus-demo.folioryn.dev',
        featured: true
      },
      {
        title: 'Aura Live State Synchronizer',
        description: 'CRDT-driven collaborative workspace sync engine delivering zero-conflict state reconciliation with sub-10ms peer synchronization over secure WebSockets.',
        tags: ['TypeScript', 'WebSockets', 'CRDTs', 'IndexedDB'],
        repo_url: 'https://github.com/sunnysingh-dev/aura-sync',
        live_url: '',
        featured: false
      }
    ],
    skills: [
      { category: 'Distributed Systems', items: ['Raft Consensus', 'Event Sourcing', 'High-Availability Multi-Region', 'Fault Tolerance', 'Disaster Recovery Automation'] },
      { category: 'Languages', items: ['Rust', 'Go', 'TypeScript', 'C++20', 'SQL', 'Python'] },
      { category: 'Cloud & Infrastructure', items: ['Kubernetes (K8s)', 'Terraform', 'AWS & GCP Cloud', 'eBPF', 'Prometheus & Grafana', 'ClickHouse'] },
      { category: 'Leadership & Strategy', items: ['System Architecture Reviews', 'RFC Governance', 'High-Velocity Team Scaling', 'Executive Briefings'] }
    ],
    experience: [
      {
        role: 'Principal Systems Architect',
        organization: 'Aether Cloud Systems',
        period: '2022 — Present',
        description: 'Direct technical roadmap for core data plane pipelines processing 1.2B daily API requests. Engineered custom memory-mapped zero-copy queue reducing p99 latency by 54% and annual cloud infrastructure costs by $1.8M.'
      },
      {
        role: 'Staff Software Engineer',
        organization: 'Vortex Distributed Labs',
        period: '2019 — 2022',
        description: 'Designed multi-region automated failover orchestrator and internal developer runtime. Mentored 35+ senior engineers across 8 cross-functional distributed infrastructure teams.'
      },
      {
        role: 'Senior Backend Engineer',
        organization: 'HyperScale Technologies',
        period: '2017 — 2019',
        description: 'Architected low-latency caching tiers and distributed database sharding layers supporting rapid user growth from 2M to 40M active users.'
      }
    ],
    education: [
      {
        institution: 'Indian Institute of Technology (IIT) Delhi',
        degree: 'B.Tech in Computer Science and Engineering',
        period: '2013 — 2017',
        score: 'CGPA 9.85 / 10.0',
        honors: 'President’s Gold Medal for Outstanding Academic & Research Excellence'
      }
    ]
  },

  'developer-portfolio': {
    id: 'developer-portfolio',
    name: 'Developer Portfolio',
    badge: 'Terminal & Hacker Archetype',
    person: {
      fullName: 'Aditya Sharma',
      handle: '@adityasharma_dev',
      headline: 'Full-Stack Systems Engineer & Open-Source Contributor',
      status: 'Building high-performance CLI utilities & real-time WebAssembly runtimes',
      bio: 'Command-line purist, kernel enthusiast, and full-stack software engineer. Obsessed with zero-dependency binaries, Neovim workflows, and building ultra-fast developer tooling with Go, Rust, and TypeScript.',
      location: 'Pune, India',
      githubUrl: 'https://github.com/adityasharma-dev',
      email: 'aditya.sharma@folioryn.dev',
      archetypeNote: 'Developer Terminal Archetype'
    },
    projects: [
      {
        title: 'vortex-cli: Universal Developer Container Orchestrator',
        description: 'Blazing fast single-binary CLI tool creating reproducible local container environments in under 200ms with native Docker and Podman hooks.',
        tags: ['Rust', 'CLI', 'Docker Engine API', 'Async Tokio'],
        repo_url: 'https://github.com/adityasharma-dev/vortex-cli',
        live_url: 'https://crates.io/crates/vortex-cli',
        featured: true
      },
      {
        title: 'PulseWasm: Edge Binary Streamer',
        description: 'WebAssembly-compiled WebSocket multiplexer delivering bidirectional real-time event broadcasting with sub-2MB memory footprint per microVM.',
        tags: ['WebAssembly', 'C', 'WebSockets', 'Node.js'],
        repo_url: 'https://github.com/adityasharma-dev/pulsewasm',
        live_url: 'https://pulsewasm-demo.folioryn.dev',
        featured: true
      },
      {
        title: 'DevLens: Terminal Git Commit Telemetry',
        description: 'Beautiful terminal UI (TUI) analyzing git history, branch velocity, and code hotspots with embedded SQLite indexing and zero lag.',
        tags: ['Go', 'Bubbletea TUI', 'SQLite', 'Git Plumbing'],
        repo_url: 'https://github.com/adityasharma-dev/devlens',
        live_url: '',
        featured: false
      }
    ],
    skills: [
      { category: 'Core Stack', items: ['Go', 'Rust', 'TypeScript', 'Node.js', 'Python', 'C'] },
      { category: 'Tooling & Shell', items: ['Neovim', 'Docker', 'Linux Kernel Basics', 'Git Internals', 'Zsh / Bash Scripting'] },
      { category: 'Data & Storage', items: ['PostgreSQL', 'Redis', 'SQLite', 'Apache Kafka'] },
      { category: 'Testing & CI', items: ['GitHub Actions', 'Benchmarking', 'Unit Testing', 'Fuzzing'] }
    ],
    experience: [
      {
        role: 'Senior Systems Engineer',
        organization: 'ByteStream Networks',
        period: '2023 — Present',
        description: 'Building ultra-low-latency real-time video streaming edge nodes. Authored core packet processing pipeline handling 40Gbps sustained bandwidth without packet drops.'
      },
      {
        role: 'Software Engineer',
        organization: 'KernelCraft Labs',
        period: '2021 — 2023',
        description: 'Maintained Linux daemon utilities and automated testing infrastructure. Built automated CI regression suites running 4,000+ unit tests.'
      }
    ],
    education: [
      {
        institution: 'Birla Institute of Technology and Science (BITS), Pilani',
        degree: 'B.E. in Computer Science',
        period: '2017 — 2021',
        score: 'CGPA 9.20 / 10.0',
        honors: 'Winner of Inter-College National Open-Source Hackathon'
      }
    ]
  },

  'student-portfolio': {
    id: 'student-portfolio',
    name: 'Student Portfolio',
    badge: 'Academics & Placements Archetype',
    person: {
      fullName: 'Vineet Verma',
      handle: '@vineetverma_cs',
      headline: 'Computer Science Undergraduate, Competitive Coder & 3x Hackathon Winner',
      status: 'Actively seeking 2026 SWE Graduate Roles & Software Engineering Internships',
      bio: 'Final-year CS student with a strong command of Data Structures, Algorithms, Distributed Databases, and full-stack web engineering. Knight on LeetCode (Rating 2140+) and winner of Smart India Hackathon.',
      location: 'Delhi NCR, India',
      githubUrl: 'https://github.com/vineetverma-dev',
      email: 'vineet.verma@student.folioryn.dev',
      archetypeNote: 'Student & Early-Career Archetype'
    },
    projects: [
      {
        title: 'CampusSync — Collaborative College Portal & Ride-Share',
        description: 'Campus-wide peer carpooling and resource sharing portal with real-time route optimization, student ID verification, and timetable sync for 3,200+ students.',
        tags: ['JavaScript', 'Node.js', 'Express', 'PostgreSQL', 'Leaflet.js'],
        repo_url: 'https://github.com/vineetverma-dev/campussync',
        live_url: 'https://campussync-demo.folioryn.dev',
        featured: true
      },
      {
        title: 'MediVault — Tamper-Proof Health Records',
        description: 'Decentralized patient medical record storage with encrypted audit logs and fine-grained doctor access delegation. Won 1st Prize at National Smart India Hackathon.',
        tags: ['React', 'Solidity', 'IPFS', 'Web3.js', 'TailwindCSS'],
        repo_url: 'https://github.com/vineetverma-dev/medivault',
        live_url: 'https://medivault-demo.folioryn.dev',
        featured: true
      },
      {
        title: 'AlgoLens — Interactive Algorithm Visualizer',
        description: 'Interactive educational web tool demonstrating Dijkstra, Bellman-Ford, A*, and Tree traversals with step-by-step playback and speed control.',
        tags: ['Vanilla JS', 'HTML5 Canvas', 'CSS Animations', 'Data Structures'],
        repo_url: 'https://github.com/vineetverma-dev/algolens',
        live_url: 'https://algolens-demo.folioryn.dev',
        featured: false
      }
    ],
    skills: [
      { category: 'Programming Languages', items: ['C++ (STL)', 'Java', 'JavaScript (ES6+)', 'Python', 'SQL'] },
      { category: 'Computer Science Core', items: ['Data Structures & Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks', 'OOP'] },
      { category: 'Web Development', items: ['HTML5/CSS3', 'Node.js', 'REST APIs', 'Supabase', 'PostgreSQL'] },
      { category: 'Developer Tools', items: ['Git/GitHub', 'VS Code', 'Postman', 'Linux Bash', 'Docker Basics'] }
    ],
    experience: [
      {
        role: 'Software Engineering Intern',
        organization: 'Zeta Cloud Innovations',
        period: 'May 2025 — July 2025',
        description: 'Built internal telemetry endpoints for microservices. Optimized query execution times on PostgreSQL tables containing 8M+ rows by 72%.'
      },
      {
        role: 'Lead Student Coordinator',
        organization: 'ACM Student Chapter',
        period: '2024 — Present',
        description: 'Organized 12 competitive coding bootcamps for 600+ attendees. Mentored junior students in algorithmic problem-solving and ICPC contest preparation.'
      }
    ],
    education: [
      {
        institution: 'SRM Institute of Science and Technology',
        degree: 'B.Tech in Computer Science and Engineering',
        period: '2022 — 2026 (Currently in 7th Semester)',
        score: 'CGPA 9.48 / 10.0',
        honors: 'Dean’s Academic Merit Scholarship (All Semesters)'
      },
      {
        institution: 'Delhi Public School, R.K. Puram',
        degree: 'Senior Secondary (Class XII CBSE)',
        period: '2020 — 2022',
        score: '97.4% Aggregate',
        honors: 'School Topper in Computer Science & Mathematics'
      }
    ]
  },

  'creative-portfolio': {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    badge: 'Design & Interaction Archetype',
    person: {
      fullName: 'Aayush Kashyap',
      handle: '@aayushkashyap_design',
      headline: 'Creative Technologist, Interaction Designer & WebGL Engineer',
      status: 'Open for select design systems & product engineering contracts',
      bio: 'Crafting expressive digital interfaces at the intersection of design engineering, WebGL shaders, kinetic typography, fluid micro-interactions, and accessible typography. Winner of Awwwards Site of the Day.',
      location: 'Bengaluru, India',
      githubUrl: 'https://github.com/aayushkashyap-design',
      email: 'aayush.kashyap@folioryn.dev',
      archetypeNote: 'Creative Technologist Archetype'
    },
    projects: [
      {
        title: 'Chronicle — Kinetic Audio-Reactive Typography Playground',
        description: 'Interactive browser playground generating generative vector glyphs influenced by Web Audio FFT frequency analysis and mouse physics with custom GLSL shaders.',
        tags: ['Three.js', 'GLSL Shaders', 'Web Audio API', 'Canvas', 'GSAP'],
        repo_url: 'https://github.com/aayushkashyap-design/chronicle-studio',
        live_url: 'https://chronicle-demo.folioryn.dev',
        featured: true
      },
      {
        title: 'Spectra Accessible Design Token System',
        description: 'Enterprise Figma component library and token compiler with automated WCAG AAA contrast verifications and fluid typography math.',
        tags: ['Design Tokens', 'Vanilla CSS', 'Figma API', 'Accessibility', 'TypeScript'],
        repo_url: 'https://github.com/aayushkashyap-design/spectra-tokens',
        live_url: 'https://spectra-tokens.folioryn.dev',
        featured: true
      },
      {
        title: 'Atmosphere Generative Ambient Soundscape',
        description: 'Minimalist browser synth generating calming generative soundscapes and procedural waves for deep focus and flow sessions.',
        tags: ['Web Audio API', 'SVG Animation', 'CSS Grid', 'Generative Art'],
        repo_url: 'https://github.com/aayushkashyap-design/atmosphere-synth',
        live_url: '',
        featured: false
      }
    ],
    skills: [
      { category: 'Design Disciplines', items: ['UI/UX Systems', 'Interaction Design', 'Design Engineering', 'Motion Graphics', 'Design Systems'] },
      { category: 'Frontend Craft', items: ['Vanilla CSS', 'WebGL / Three.js', 'GLSL Shaders', 'SVG Vector Animation', 'HTML5 Semantic Web'] },
      { category: 'Design Software', items: ['Figma Master', 'After Effects', 'Spline 3D', 'Blender', 'Procreate'] },
      { category: 'Standards', items: ['WCAG 2.2 AAA Accessibility', 'Fluid Typography', 'Design Token Pipelines', '60fps Performance'] }
    ],
    experience: [
      {
        role: 'Lead Interaction Designer',
        organization: 'Studio Kinetic Labs',
        period: '2023 — Present',
        description: 'Led UI design and design systems for global consumer brands. Won Awwwards Site of the Day for spatial web interface design and creative interaction craft.'
      },
      {
        role: 'Design Engineer',
        organization: 'Vanguard Design Studio',
        period: '2021 — 2023',
        description: 'Bridged design and engineering teams by building production React and Vanilla web components with zero-jank 60fps micro-animations.'
      }
    ],
    education: [
      {
        institution: 'National Institute of Design (NID), Ahmedabad',
        degree: 'M.Des in Interaction Design',
        period: '2019 — 2021',
        score: 'With Distinction',
        honors: 'National Design Excellence Gold Trophy'
      }
    ]
  },

  'editorial-portfolio': {
    id: 'editorial-portfolio',
    name: 'Editorial Portfolio',
    badge: 'Writing & Architecture Archetype',
    person: {
      fullName: 'Kabir Mehra',
      handle: '@kabirmehra_writes',
      headline: 'Systems Architect, Technical Author & Software Essayist',
      status: 'Writing on software resilience, systems philosophy, and software durability',
      bio: 'Author of "The Durability Manifesto". Explores the philosophy of computing, long-term software durability, modular software architecture, and clean architectural prose.',
      location: 'Mumbai, India',
      githubUrl: 'https://github.com/kabirmehra-writes',
      email: 'kabir.mehra@folioryn.dev',
      archetypeNote: 'Editorial Narrative Archetype'
    },
    projects: [
      {
        title: 'The Durability Manifesto (Open-Access Architectural Book)',
        description: 'A 14-chapter comprehensive treatise on engineering systems that gracefully degrade during catastrophic network partitions and outlive technology hype cycles.',
        tags: ['Technical Writing', 'Distributed Systems', 'Case Studies', 'Software Architecture'],
        repo_url: 'https://github.com/kabirmehra-writes/durability-manifesto',
        live_url: 'https://durability-manifesto.folioryn.dev',
        featured: true
      },
      {
        title: 'Synapse: Deterministic Finite State Machine Engine',
        description: 'Formal verification state engine with pure deterministic transitions, immutable event logs, and verifiable audit trails.',
        tags: ['TypeScript', 'TLA+ Specifications', 'Deterministic State', 'State Machines'],
        repo_url: 'https://github.com/kabirmehra-writes/synapse-engine',
        live_url: 'https://synapse-engine.folioryn.dev',
        featured: true
      },
      {
        title: 'Systems Commentary: The Death of Microservice Complexity',
        description: 'Read by over 240,000 engineers—an in-depth analysis examining why modular monoliths with strict package boundary contracts dominate microservices for 95% of engineering organizations.',
        tags: ['Essay', 'Software Architecture', 'Engineering Strategy', 'Domain-Driven Design'],
        repo_url: '',
        live_url: 'https://kabirmehra.folioryn.dev/essays/monolith-revival',
        featured: false
      }
    ],
    skills: [
      { category: 'Architectural Prose', items: ['System Design RFCs', 'Long-Form Technical Writing', 'API Specifications', 'Executive Briefings'] },
      { category: 'Core Disciplines', items: ['Formal Verification', 'Database Internals', 'Domain-Driven Design (DDD)', 'Fault Tolerance'] },
      { category: 'Technologies', items: ['TypeScript', 'PostgreSQL', 'Go', 'Linux Runtimes', 'Markdown AST'] },
      { category: 'Speaking & Mentorship', items: ['Keynote Speaker', 'Architecture Workshops', 'Peer Code Reviews'] }
    ],
    experience: [
      {
        role: 'Chief Technical Author & Advisor',
        organization: 'Mehra Systems Advisory',
        period: '2022 — Present',
        description: 'Consulted for Fortune 500 engineering directors on core architecture migration, RFC formatting, and technical documentation quality.'
      },
      {
        role: 'Principal Systems Architect',
        organization: 'Apex FinTech Infrastructure',
        period: '2017 — 2022',
        description: 'Directed architectural blueprints for high-frequency trading ledger settlement systems handling ₹8,500 Crore in monthly volume with zero downtime.'
      }
    ],
    education: [
      {
        institution: 'Indian Institute of Technology (IIT) Bombay',
        degree: 'B.Tech in Computer Science & Engineering',
        period: '2013 — 2017',
        score: 'First Class with Distinction',
        honors: 'Distinguished Undergraduate Thesis in Distributed Computing'
      }
    ]
  },

  'experience-focused': {
    id: 'experience-focused',
    name: 'Experience-Focused',
    badge: 'Career & Leadership Archetype',
    person: {
      fullName: 'Ritu Sen',
      handle: '@ritusencore_vp',
      headline: 'VP of Engineering & Distributed Infrastructure Leader',
      status: 'Leading high-velocity, empathetic engineering organizations at scale',
      bio: 'Engineering executive with 13+ years scaling teams from 20 to 250+ engineers. Proven track record leading infrastructure, platform engineering, and developer experience across hyperscale distributed systems.',
      location: 'Hyderabad, India',
      githubUrl: 'https://github.com/ritusencore-dev',
      email: 'ritu.sen@folioryn.dev',
      archetypeNote: 'Experience Timeline Archetype'
    },
    projects: [
      {
        title: 'Enterprise DORA Engineering Velocity Scorecard',
        description: 'Production-grade operational telemetry platform measuring deployment frequency, lead time for changes, MTTR, and change failure rates across 80+ engineering teams.',
        tags: ['DORA Metrics', 'Engineering Leadership', 'Python', 'Grafana', 'Kafka'],
        repo_url: 'https://github.com/ritusencore-dev/velocity-scorecard',
        live_url: 'https://velocity-scorecard.folioryn.dev',
        featured: true
      },
      {
        title: 'Platform Engineering Onboarding Playbook & IDP',
        description: 'Internal developer platform blueprint reducing new engineer onboarding ramp-up from 6 weeks to 6 business days across 600+ developers.',
        tags: ['Developer Experience', 'Internal Developer Platform', 'Docs', 'Kubernetes'],
        repo_url: 'https://github.com/ritusencore-dev/dev-playbook',
        live_url: 'https://devplaybook.folioryn.dev',
        featured: true
      },
      {
        title: 'Cloud Cost Governance & FinOps Automation',
        description: 'Automated Kubernetes pod auto-stopping and rightsizing saving $2.4M annually across AWS and GCP multi-tenant clusters.',
        tags: ['FinOps', 'Kubernetes', 'Go', 'AWS Cost Explorer'],
        repo_url: 'https://github.com/ritusencore-dev/finops-autostop',
        live_url: '',
        featured: false
      }
    ],
    skills: [
      { category: 'Executive Leadership', items: ['Scaling Engineering Orgs (20 -> 250+)', 'Budget & FinOps Governance', 'Hiring & Retention', 'Culture & DEI'] },
      { category: 'Operational Rigor', items: ['DORA Metrics Implementation', 'Incident Post-Mortems', 'SOC2 / ISO 27001 Compliance', 'On-Call Operations'] },
      { category: 'Platform Domains', items: ['Cloud Infrastructure (AWS/GCP)', 'Kubernetes & Service Meshes', 'CI/CD Pipelines', 'Distributed Ledgers'] },
      { category: 'Engineering Strategy', items: ['Build vs. Buy Frameworks', 'Vendor Negotiations', 'Tech Debt Prioritization'] }
    ],
    experience: [
      {
        role: 'VP of Engineering',
        organization: 'Nexus Financial Cloud',
        period: '2022 — Present',
        description: 'Lead an engineering organization of 180+ engineers across 15 distributed squads. Drove SOC2 Type II compliance and 99.995% service availability SLA.'
      },
      {
        role: 'Director of Platform Engineering',
        organization: 'CloudScale Technologies',
        period: '2018 — 2022',
        description: 'Scaled internal developer platform used daily by 700+ developers. Reduced deployment cycles from bi-weekly releases to 50+ production deployments per day.'
      },
      {
        role: 'Senior Staff Infrastructure Engineer',
        organization: 'Global Data Systems',
        period: '2014 — 2018',
        description: 'Architected petabyte-scale distributed database clusters and disaster recovery workflows with zero data loss.'
      }
    ],
    education: [
      {
        institution: 'Indian Institute of Science (IISc), Bangalore',
        degree: 'M.Tech in Computer Science & Systems Engineering',
        period: '2012 — 2014',
        score: 'Gold Medalist &bull; CGPA 9.90 / 10.0',
        honors: 'Highest Academic Standing across Systems Specialization'
      },
      {
        institution: 'Jadavpur University',
        degree: 'B.E. in Computer Science and Engineering',
        period: '2008 — 2012',
        score: 'First Class with Honors (Top 1%)',
        honors: 'University Academic Excellence Award'
      }
    ]
  }
};

// ==============================================================================
// 2. Controller & Hydration Logic
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initDemoController();
});

export function initDemoController() {
  const urlParams = new URLSearchParams(window.location.search);
  let requestedTemplate = urlParams.get('template') || 'minimal-professional';

  // Normalize aliases if necessary
  if (requestedTemplate === 'minimal') requestedTemplate = 'minimal-professional';
  if (requestedTemplate === 'terminal') requestedTemplate = 'developer-portfolio';
  if (requestedTemplate === 'editorial') requestedTemplate = 'editorial-portfolio';

  if (!DEMO_DATASETS[requestedTemplate]) {
    requestedTemplate = 'minimal-professional';
  }

  // Initial render
  applyTemplateDemo(requestedTemplate);

  // Bind Switcher Buttons
  const switchBtns = document.querySelectorAll('.demo-switch-btn');
  switchBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTemplate = btn.getAttribute('data-template');
      if (targetTemplate && DEMO_DATASETS[targetTemplate]) {
        // Update URL cleanly without reloading page
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('template', targetTemplate);
        window.history.pushState({ template: targetTemplate }, '', newUrl.toString());

        applyTemplateDemo(targetTemplate);
      }
    });
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (e) => {
    const currentParams = new URLSearchParams(window.location.search);
    const tmpl = currentParams.get('template') || 'minimal-professional';
    if (DEMO_DATASETS[tmpl]) {
      applyTemplateDemo(tmpl);
    }
  });

  // Bind "Use This Template" Action Button
  const useTemplateBtn = document.getElementById('use-template-action-btn');
  if (useTemplateBtn) {
    useTemplateBtn.addEventListener('click', () => {
      handleUseTemplate();
    });
  }

  // Bind Contact Form Submission simulation
  const contactForm = document.getElementById('demo-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const statusEl = document.getElementById('demo-contact-status');
      if (statusEl) {
        statusEl.style.display = 'block';
        setTimeout(() => {
          contactForm.reset();
        }, 1200);
      }
    });
  }
}

/**
 * Applies the selected template dataset to the demo canvas
 */
export function applyTemplateDemo(templateId) {
  const data = DEMO_DATASETS[templateId] || DEMO_DATASETS['minimal-professional'];

  // 1. Update Document & Body classes
  document.documentElement.setAttribute('data-template', templateId);
  document.body.className = `template-${templateId}`;

  // 2. Update Active Tab Buttons
  document.querySelectorAll('.demo-switch-btn').forEach(btn => {
    if (btn.getAttribute('data-template') === templateId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 3. Update Banner Badges
  const badgeEl = document.getElementById('demo-template-badge');
  if (badgeEl) {
    badgeEl.textContent = `${data.name} (${data.badge})`;
  }

  // 4. Update Hero & Identity
  const logoName = document.getElementById('demo-logo-name');
  const headline = document.getElementById('demo-headline');
  const statusText = document.getElementById('demo-status-text');
  const bio = document.getElementById('demo-bio');
  const loc = document.getElementById('demo-location');
  const gh = document.getElementById('demo-github');
  const note = document.getElementById('demo-archetype-note');

  if (logoName) logoName.textContent = data.person.fullName;
  if (headline) headline.textContent = data.person.headline;
  if (statusText) statusText.textContent = data.person.status;
  if (bio) bio.textContent = data.person.bio;
  if (loc) loc.textContent = `📍 ${data.person.location}`;
  if (gh) gh.textContent = `💻 ${data.person.githubUrl.replace('https://', '')}`;
  if (note) note.textContent = `🎨 ${data.person.archetypeNote}`;

  // 5. Render Projects
  const projectsGrid = document.getElementById('demo-projects-grid');
  if (projectsGrid) {
    projectsGrid.innerHTML = data.projects.map(p => `
      <article class="project-card" style="padding: var(--space-6); display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <span class="badge" style="font-size: 10px;">${p.featured ? 'Featured System' : 'Selected Project'}</span>
            <div style="display: flex; gap: 8px; font-size: 11px;">
              ${p.repo_url ? `<a href="${p.repo_url}" target="_blank" rel="noopener noreferrer" style="color: var(--text-primary); text-decoration: underline;">GitHub</a>` : ''}
              ${p.live_url ? `<a href="${p.live_url}" target="_blank" rel="noopener noreferrer" style="color: var(--text-primary); text-decoration: underline;">Live Demo</a>` : ''}
            </div>
          </div>
          <h3 style="font-size: var(--text-lg); font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
            ${escapeHtml(p.title)}
          </h3>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: var(--leading-relaxed); margin-bottom: var(--space-4);">
            ${escapeHtml(p.description)}
          </p>
        </div>
        <div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: auto;">
            ${p.tags.map(t => `<span class="badge" style="font-size: 10px;">${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>
      </article>
    `).join('');
  }

  // 6. Render Skills
  const skillsContainer = document.getElementById('demo-skills-container');
  if (skillsContainer) {
    skillsContainer.innerHTML = data.skills.map(group => `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--space-5);">
        <h4 style="font-size: var(--text-xs); font-family: var(--font-mono); text-transform: uppercase; color: var(--text-muted); margin-bottom: var(--space-3);">
          ${escapeHtml(group.category)}
        </h4>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${group.items.map(item => `
            <span class="badge" style="background: var(--bg-secondary);">${escapeHtml(item)}</span>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // 7. Render Experience
  const expContainer = document.getElementById('demo-experience-container');
  if (expContainer) {
    expContainer.innerHTML = `
      <div class="experience-timeline" style="display: flex; flex-direction: column; gap: var(--space-6);">
        ${data.experience.map(exp => `
          <div style="position: relative; padding-left: 20px; border-left: 2px solid var(--border-color);">
            <div class="timeline-node" style="position: absolute; left: -6px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: var(--accent-primary);"></div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; margin-bottom: 4px;">
              <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 0;">
                ${escapeHtml(exp.role)} &bull; <span style="color: var(--text-secondary);">${escapeHtml(exp.organization)}</span>
              </h3>
              <span class="role-duration" style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted);">
                ${escapeHtml(exp.period)}
              </span>
            </div>
            <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: var(--leading-relaxed); margin: 0;">
              ${escapeHtml(exp.description)}
            </p>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 8. Render Education
  const eduContainer = document.getElementById('demo-education-container');
  if (eduContainer) {
    eduContainer.innerHTML = data.education.map(edu => `
      <div class="education-card" style="border: 1px solid var(--border-color); background: var(--bg-surface); padding: var(--space-5); border-radius: var(--radius-md); margin-bottom: var(--space-4);">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; margin-bottom: 4px;">
          <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 0;">
            ${escapeHtml(edu.institution)}
          </h3>
          <span style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted);">${escapeHtml(edu.period)}</span>
        </div>
        <p style="font-size: var(--text-xs); color: var(--text-secondary); margin: 0 0 6px 0;">
          ${escapeHtml(edu.degree)}
        </p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
          <span class="cgpa-pill">${escapeHtml(edu.score)}</span>
          ${edu.honors ? `<span class="coursework-tag">${escapeHtml(edu.honors)}</span>` : ''}
        </div>
      </div>
    `).join('');
  }
}

/**
 * Handles "Use This Template" flow:
 * Sets the selected template in publish settings without touching other profile data,
 * then directs user to builder or signup.
 */
function handleUseTemplate() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentTemplate = urlParams.get('template') || 'minimal-professional';

  try {
    const activeUser = getActiveUser();

    if (activeUser?.username) {
      // User is signed in: preserve existing data, update templateId only!
      const existingSettings = getPublishSettings();
      savePublishSettings({
        ...existingSettings,
        templateId: currentTemplate
      });

      // Redirect to builder
      window.location.href = `/dashboard/builder/?template=${encodeURIComponent(currentTemplate)}`;
    } else {
      // User not signed in: store pre-selection in localStorage and redirect to signup
      localStorage.setItem('folioryn_preselected_template', currentTemplate);
      window.location.href = `/signup/?template=${encodeURIComponent(currentTemplate)}`;
    }
  } catch (e) {
    console.error('Use template transition error:', e);
    window.location.href = `/signup/?template=${encodeURIComponent(currentTemplate)}`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
