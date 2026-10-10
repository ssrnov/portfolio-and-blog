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
      fullName: 'Sophia Lin',
      handle: '@sophialin',
      headline: 'Staff Systems Architect & Distributed Infrastructure Lead',
      status: 'Available for advisory & principal roles',
      bio: 'Designing resilient cloud runtimes, zero-trust infrastructure, and high-throughput low-latency event systems with clean, minimalist aesthetics.',
      location: 'San Francisco, CA',
      githubUrl: 'https://github.com/sophialin-demo',
      email: 'sophia.lin@example.com',
      archetypeNote: 'Minimal Professional Archetype'
    },
    projects: [
      {
        title: 'Chronos Distributed Event Stream',
        description: 'Fault-tolerant distributed log storage processing 1.4M events/sec with sub-millisecond p99 replication latency across three cloud regions.',
        tags: ['Rust', 'Raft Consensus', 'Zero-Copy I/O'],
        repo_url: 'https://github.com/sophialin-demo/chronos-stream',
        live_url: 'https://chronos-demo.folioryn.dev',
        featured: true
      },
      {
        title: 'Aegis Zero-Trust Service Mesh',
        description: 'Lightweight sidecar proxy enforcing mTLS cryptographic identity and policy governance with less than 0.8ms added network overhead.',
        tags: ['Go', 'eBPF', 'mTLS', 'Envoy API'],
        repo_url: 'https://github.com/sophialin-demo/aegis-mesh',
        live_url: 'https://aegis-demo.folioryn.dev',
        featured: true
      },
      {
        title: 'Hydra Real-Time Telemetry Platform',
        description: 'Time-series metrics engine with adaptive sampling, column-oriented compression, and ANSI SQL query planning.',
        tags: ['TypeScript', 'ClickHouse', 'Vector Engine'],
        repo_url: 'https://github.com/sophialin-demo/hydra-telemetry',
        live_url: '',
        featured: false
      }
    ],
    skills: [
      { category: 'Architecture', items: ['Distributed Systems', 'Event-Driven Architectures', 'High-Availability Design', 'Disaster Recovery'] },
      { category: 'Languages', items: ['Rust', 'Go', 'TypeScript', 'C++', 'SQL'] },
      { category: 'Cloud & Infrastructure', items: ['Kubernetes', 'Terraform', 'AWS (EKS, DynamoDB)', 'eBPF', 'Prometheus'] },
      { category: 'Leadership', items: ['Technical Strategy', 'Architecture Reviews', 'Mentorship & Hiring', 'RFC Authoring'] }
    ],
    experience: [
      {
        role: 'Staff Systems Architect',
        organization: 'Helios Distributed Systems',
        period: '2022 — Present',
        description: 'Lead platform architecture for core ingest infrastructure serving 650M daily API requests. Reduced infrastructure spend by 38% through custom zero-copy memory pipelines.'
      },
      {
        role: 'Principal Software Engineer',
        organization: 'Strata Cloud Solutions',
        period: '2019 — 2022',
        description: 'Designed multi-region failover automation and container execution runtimes. Spearheaded microservice migration across 18 distributed teams.'
      }
    ],
    education: [
      {
        institution: 'University of California, Berkeley',
        degree: 'M.S. in Computer Science',
        period: '2017 — 2019',
        score: 'GPA 3.96 / 4.0',
        honors: 'Distributed Computing Fellowship'
      }
    ]
  },

  'developer-portfolio': {
    id: 'developer-portfolio',
    name: 'Developer Portfolio',
    badge: 'Terminal & Hacker Archetype',
    person: {
      fullName: 'Marcus Kane',
      handle: '@mkane_dev',
      headline: 'Full-Stack Systems Engineer & OSS Contributor',
      status: 'Open to high-impact engineering roles',
      bio: 'Command-line enthusiast, kernel hobbyist, and full-stack engineer building fast developer tooling and high-concurrency Node.js services.',
      location: 'Berlin, Germany',
      githubUrl: 'https://github.com/mkane-demo',
      email: 'marcus.kane@example.com',
      archetypeNote: 'Developer Terminal Archetype'
    },
    projects: [
      {
        title: 'kane-cli: Modern Dotfiles & Devbox',
        description: 'Cross-platform CLI tool orchestrating reproducible local developer containers with zero configuration.',
        tags: ['Rust', 'CLI', 'Docker', 'Async Tokio'],
        repo_url: 'https://github.com/mkane-demo/kane-cli',
        live_url: 'https://crates.io/crates/kane-cli',
        featured: true
      },
      {
        title: 'FastSocket WebAssembly Gateway',
        description: 'High-throughput binary WebSocket multiplexer written in C and compiled to Wasm for low-memory microVMs.',
        tags: ['WebAssembly', 'C', 'WebSockets', 'Node.js'],
        repo_url: 'https://github.com/mkane-demo/fastsocket-wasm',
        live_url: 'https://fastsocket.folioryn.dev',
        featured: true
      },
      {
        title: 'GitPulse Commit Analytics Engine',
        description: 'Automated GitHub contribution analyzer with interactive terminal UI and SQLite caching.',
        tags: ['Go', 'Bubbletea TUI', 'GitHub GraphQL'],
        repo_url: 'https://github.com/mkane-demo/gitpulse',
        live_url: '',
        featured: false
      }
    ],
    skills: [
      { category: 'Core Stack', items: ['Go', 'Rust', 'TypeScript', 'Node.js', 'Python', 'C'] },
      { category: 'Tooling', items: ['Neovim', 'Docker', 'Linux Kernel Basics', 'Git Internals', 'Zsh'] },
      { category: 'Data & Storage', items: ['PostgreSQL', 'Redis', 'SQLite', 'Kafka'] },
      { category: 'Testing & CI', items: ['GitHub Actions', 'Benchmarking', 'Unit Testing', 'Fuzzing'] }
    ],
    experience: [
      {
        role: 'Senior Systems Engineer',
        organization: 'ByteStream Networks',
        period: '2023 — Present',
        description: 'Building ultra-low-latency real-time video streaming edge nodes. Authored core packet processing pipeline handling 20Gbps sustained bandwidth.'
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
        institution: 'Technical University of Munich',
        degree: 'B.Sc. in Computer Science',
        period: '2017 — 2021',
        score: '1.2 (Top 5% with Honors)',
        honors: 'Best Systems Capstone Thesis'
      }
    ]
  },

  'student-portfolio': {
    id: 'student-portfolio',
    name: 'Student Portfolio',
    badge: 'Academics & Placements Archetype',
    person: {
      fullName: 'Aarav Patel',
      handle: '@aarav_codes',
      headline: 'Computer Science Undergraduate & Hackathon Winner',
      status: 'Actively seeking 2026 SWE Graduate Roles & Internships',
      bio: 'Final-year CS student with strong foundations in Data Structures, Algorithms, Distributed Databases, and Modern Web Development. 3x Hackathon winner.',
      location: 'Bangalore, India',
      githubUrl: 'https://github.com/aaravpatel-demo',
      email: 'aarav.patel@student.example.edu',
      archetypeNote: 'Student & Early-Career Archetype'
    },
    projects: [
      {
        title: 'CampusRide — Peer Carpooling Platform',
        description: 'Campus-wide ride-matching system with real-time route optimization, student ID verification, and peer ratings.',
        tags: ['JavaScript', 'Express', 'PostgreSQL', 'Leaflet.js'],
        repo_url: 'https://github.com/aaravpatel-demo/campus-ride',
        live_url: 'https://campusride-demo.folioryn.dev',
        featured: true
      },
      {
        title: 'MediChain — Patient Health Records',
        description: 'Decentralized medical records locker with encrypted audit logs and doctor access delegacy. 1st Place at National Smart India Hackathon.',
        tags: ['Solidity', 'Web3.js', 'React', 'IPFS'],
        repo_url: 'https://github.com/aaravpatel-demo/medichain-app',
        live_url: 'https://medichain-hackathon.folioryn.dev',
        featured: true
      },
      {
        title: 'AlgoVisualizer — Graph & Tree Visualizer',
        description: 'Interactive educational web tool demonstrating Dijkstra, A*, and Tree traversals with step-by-step playback.',
        tags: ['Vanilla JS', 'HTML5 Canvas', 'CSS Animations'],
        repo_url: 'https://github.com/aaravpatel-demo/algo-visualizer',
        live_url: 'https://algoviz-demo.folioryn.dev',
        featured: false
      }
    ],
    skills: [
      { category: 'Programming Languages', items: ['C++', 'Java', 'JavaScript (ES6+)', 'Python', 'SQL'] },
      { category: 'Computer Science Core', items: ['Data Structures & Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks'] },
      { category: 'Web Development', items: ['HTML5/CSS3', 'Node.js', 'REST APIs', 'Supabase', 'PostgreSQL'] },
      { category: 'Developer Tools', items: ['Git/GitHub', 'VS Code', 'Postman', 'Linux Bash'] }
    ],
    experience: [
      {
        role: 'Software Engineering Intern',
        organization: 'Zeta Innovations',
        period: 'May 2025 — July 2025',
        description: 'Built internal telemetry endpoints for microservices. Optimized query execution times on PostgreSQL tables containing 4M+ rows by 65%.'
      },
      {
        role: 'Lead Student Coordinator',
        organization: 'ACM Student Chapter',
        period: '2024 — Present',
        description: 'Organized 8 competitive coding bootcamps for 500+ attendees. Mentored junior students in algorithmic problem-solving.'
      }
    ],
    education: [
      {
        institution: 'SRM Institute of Science and Technology',
        degree: 'B.Tech in Computer Science and Engineering',
        period: '2022 — 2026 (Currently in 7th Semester)',
        score: 'CGPA 9.42 / 10.0',
        honors: 'Dean’s Academic Merit Scholarship (All Semesters)'
      },
      {
        institution: 'National Public School',
        degree: 'Senior Secondary (Class XII CBSE)',
        period: '2020 — 2022',
        score: '97.2% Aggregate',
        honors: 'School Topper in Mathematics & Physics'
      }
    ]
  },

  'creative-portfolio': {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    badge: 'Design & Interaction Archetype',
    person: {
      fullName: 'Elena Rostova',
      handle: '@elena_designs',
      headline: 'Interaction Designer & Creative Technologist',
      status: 'Open for select design systems & product contracts',
      bio: 'Crafting expressive digital interfaces at the intersection of design engineering, WebGL shaders, fluid micro-interactions, and accessible typography.',
      location: 'Stockholm, Sweden',
      githubUrl: 'https://github.com/elenarostova-demo',
      email: 'elena@rostova-design.example',
      archetypeNote: 'Creative Technologist Archetype'
    },
    projects: [
      {
        title: 'Luminary — Kinetic Typography Studio',
        description: 'Interactive browser playground generating generative vector glyphs influenced by audio frequency analysis and mouse physics.',
        tags: ['Three.js', 'GLSL Shaders', 'Web Audio API', 'Canvas'],
        repo_url: 'https://github.com/elenarostova-demo/luminary-studio',
        live_url: 'https://luminary-demo.folioryn.dev',
        featured: true
      },
      {
        title: 'Prism Accessible Design System',
        description: 'Enterprise Figma component library and token compiler with automated WCAG AAA contrast verifications.',
        tags: ['Design Tokens', 'Vanilla CSS', 'Figma API', 'Accessibility'],
        repo_url: 'https://github.com/elenarostova-demo/prism-tokens',
        live_url: 'https://prism-tokens.folioryn.dev',
        featured: true
      },
      {
        title: 'Aurora Ambient Sound Synthesizer',
        description: 'Minimalist browser synth generating calming generative soundscapes for deep focus sessions.',
        tags: ['Web Audio API', 'SVG Animation', 'CSS Grid'],
        repo_url: 'https://github.com/elenarostova-demo/aurora-synth',
        live_url: '',
        featured: false
      }
    ],
    skills: [
      { category: 'Design Disciplines', items: ['UI/UX Systems', 'Interaction Design', 'Design Engineering', 'Motion Graphics'] },
      { category: 'Frontend Craft', items: ['Vanilla CSS', 'WebGL / Three.js', 'SVG Vector Animation', 'HTML5 Semantic Web'] },
      { category: 'Design Software', items: ['Figma Master', 'After Effects', 'Spline 3D', 'Blender Basics'] },
      { category: 'Standards', items: ['WCAG 2.2 AAA Accessibility', 'Fluid Typography', 'Design Token Pipelines'] }
    ],
    experience: [
      {
        role: 'Lead Interaction Designer',
        organization: 'Nordic Digital Agency',
        period: '2023 — Present',
        description: 'Led UI design and design systems for global consumer brands. Won 2024 Awwwards Site of the Month for spatial interface design.'
      },
      {
        role: 'Design Engineer',
        organization: 'Vanguard Studios',
        period: '2021 — 2023',
        description: 'Bridged design and engineering teams by building production React and Vanilla web components with sub-60fps animations.'
      }
    ],
    education: [
      {
        institution: 'Umeå Institute of Design',
        degree: 'M.F.A. in Interaction Design',
        period: '2019 — 2021',
        score: 'With Distinction',
        honors: 'Nordic Design Excellence Award'
      }
    ]
  },

  'editorial-portfolio': {
    id: 'editorial-portfolio',
    name: 'Editorial Portfolio',
    badge: 'Writing & Architecture Archetype',
    person: {
      fullName: 'Julian Rivera',
      handle: '@jrivera_writes',
      headline: 'Systems Architect, Technical Author & Columnist',
      status: 'Writing on software resilience and systems philosophy',
      bio: 'Author of "Reliable Runtimes at Scale". Explores the philosophy of computing, long-term software durability, and clean architectural prose.',
      location: 'London, United Kingdom',
      githubUrl: 'https://github.com/julianrivera-demo',
      email: 'julian@rivera-systems.example',
      archetypeNote: 'Editorial Narrative Archetype'
    },
    projects: [
      {
        title: 'The Resilience Manifesto (Long-Form Book)',
        description: 'A 12-chapter comprehensive treatise on engineering systems that gracefully degrade during catastrophic network partitions.',
        tags: ['Technical Writing', 'Distributed Systems', 'Case Studies'],
        repo_url: 'https://github.com/julianrivera-demo/resilience-manifesto',
        live_url: 'https://resilience-manifesto.folioryn.dev',
        featured: true
      },
      {
        title: 'Loom: Declarative State Machine Engine',
        description: 'Formal verification state engine with pure deterministic transitions and verifiable audit trails.',
        tags: ['TypeScript', 'TLA+ Specifications', 'Deterministic State'],
        repo_url: 'https://github.com/julianrivera-demo/loom-engine',
        live_url: 'https://loom-engine.folioryn.dev',
        featured: true
      },
      {
        title: 'Systems Commentary: The 2026 Monolith Revival',
        description: 'In-depth analysis examining why modular monoliths with strict package boundary contracts dominate microservices for 90% of teams.',
        tags: ['Essay', 'Software Architecture', 'Engineering Strategy'],
        repo_url: '',
        live_url: 'https://rivera-systems.example/essays/monolith-revival',
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
        organization: 'Rivera Systems Advisory',
        period: '2022 — Present',
        description: 'Consulted for Fortune 500 engineering directors on core architecture migration, RFC formatting, and technical documentation.'
      },
      {
        role: 'Principal Systems Architect',
        organization: 'Apex FinTech Infrastructure',
        period: '2017 — 2022',
        description: 'Directed architectural blueprints for high-frequency trading ledger settlement systems handling £12B in monthly volume.'
      }
    ],
    education: [
      {
        institution: 'Imperial College London',
        degree: 'B.Eng. in Computing & Software Engineering',
        period: '2013 — 2017',
        score: 'First Class Honours',
        honors: 'Distinguished Dissertation in Distributed Algorithms'
      }
    ]
  },

  'experience-focused': {
    id: 'experience-focused',
    name: 'Experience-Focused',
    badge: 'Career & Leadership Archetype',
    person: {
      fullName: 'Sarah Jenkins',
      handle: '@sjenkins_vp',
      headline: 'VP of Engineering & Distributed Infrastructure Lead',
      status: 'Building high-velocity, empathetic engineering organizations',
      bio: 'Engineering leader with 12+ years scaling teams from 15 to 220 engineers. Proven track record leading infrastructure, platform engineering, and developer experience.',
      location: 'New York, NY',
      githubUrl: 'https://github.com/sarahjenkins-demo',
      email: 'sarah.jenkins@example.com',
      archetypeNote: 'Experience Timeline Archetype'
    },
    projects: [
      {
        title: 'Global Engineering Velocity Scorecard',
        description: 'Open-source DORA metrics framework measuring lead time, deployment frequency, MTTR, and change failure rates.',
        tags: ['DORA Metrics', 'Engineering Leadership', 'Python', 'Grafana'],
        repo_url: 'https://github.com/sarahjenkins-demo/velocity-scorecard',
        live_url: 'https://velocity-scorecard.folioryn.dev',
        featured: true
      },
      {
        title: 'Platform Engineering Onboarding Playbook',
        description: 'Comprehensive operational guide reducing new engineer onboarding ramp-up from 6 weeks to 8 business days.',
        tags: ['Developer Experience', 'Internal Developer Platform', 'Docs'],
        repo_url: 'https://github.com/sarahjenkins-demo/dev-playbook',
        live_url: 'https://devplaybook.folioryn.dev',
        featured: true
      },
      {
        title: 'Cloud Cost Governance Automation',
        description: 'Automated Kubernetes pod auto-stopping and rightsizing saving $1.2M annually across AWS and GCP fleets.',
        tags: ['FinOps', 'Kubernetes', 'Go', 'AWS Cost Explorer'],
        repo_url: 'https://github.com/sarahjenkins-demo/finops-autostop',
        live_url: '',
        featured: false
      }
    ],
    skills: [
      { category: 'Executive Leadership', items: ['Scaling Engineering Orgs (15 -> 200+)', 'Budget & FinOps Governance', 'Hiring & Retention', 'Culture & DEI'] },
      { category: 'Operational Rigor', items: ['DORA Metrics Implementation', 'Incident Post-Mortems', 'SOC2 / ISO 27001 Compliance', 'On-Call Operations'] },
      { category: 'Platform Domains', items: ['Cloud Infrastructure (AWS/GCP)', 'Kubernetes & Service Meshes', 'CI/CD Pipelines', 'Distributed Ledgers'] },
      { category: 'Engineering Strategy', items: ['Build vs. Buy Frameworks', 'Vendor Negotiations', 'Tech Debt Prioritization'] }
    ],
    experience: [
      {
        role: 'VP of Engineering',
        organization: 'Nexus Financial Cloud',
        period: '2022 — Present',
        description: 'Lead an engineering organization of 140+ engineers across 12 distributed squads. Drove SOC2 Type II compliance and 99.995% service availability SLA.'
      },
      {
        role: 'Director of Platform Engineering',
        organization: 'CloudScale Technologies',
        period: '2018 — 2022',
        description: 'Scaled internal developer platform used by 500+ developers. Reduced deployment cycles from bi-weekly releases to 45 deployments per day.'
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
        institution: 'Columbia University',
        degree: 'B.S. in Computer Engineering',
        period: '2010 — 2014',
        score: 'Magna Cum Laude',
        honors: 'Tau Beta Pi Engineering Honor Society'
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
            <div class="timeline-node" style="position: absolute; left: -6px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: #F5F5F5;"></div>
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
