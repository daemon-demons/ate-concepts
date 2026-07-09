/**
 * Hub page rendering: learning modules, providers, and shared image fallback.
 */

const PROVIDERS = [
    {
        name: 'Advantest',
        specialty: 'SoC, memory, and SLT testers — V93000, T2000. ~50% global ATE share.',
        href: 'https://www.advantest.com/',
        logo: 'https://www.advantest.com/img/common/logo-advantest.svg',
        logoScale: 0.7,
        initials: 'ADV',
        color: '#1e40af'
    },
    {
        name: 'Teradyne',
        specialty: 'UltraFLEX, J750 SoC testers. Acquired Eagle Test Systems & LitePoint.',
        href: 'https://www.teradyne.com/',
        logo: 'https://cdn-ilehcci.nitrocdn.com/eoGmUZCMaguCqwHURWCEmTNzNhuuAlBj/assets/images/optimized/rev-3fc846c/www.teradyne.com/wp-content/uploads/2025/07/t-logo-color-for-display.png',
        logoScale: 0.75,
        initials: 'TER',
        color: '#0f766e'
    },
    {
        name: 'Eagle Test Systems',
        specialty: 'Analog & mixed-signal ETS platforms — now a Teradyne company.',
        href: 'https://www.teradyne.com/',
        logo: 'https://www.sec.gov/Archives/edgar/data/1290096/000095013406000873/c00595a1c0059500.gif',
        logoScale: 1.2,
        initials: 'ETS',
        color: '#b45309'
    },
    {
        name: 'Cohu',
        specialty: 'Test handlers, contactors, thermal management, and Diamondx testers.',
        href: 'https://www.cohu.com/',
        logo: 'https://www.cohu.com/wp-content/uploads/2024/01/Cohu-Standard-logo-registered-trademark-300x70px-300x70.png',
        logoScale: 0.8,
        initials: 'COH',
        color: '#7c3aed'
    },
    {
        name: 'Chroma ATE',
        specialty: 'Power semiconductor, EV, and SiC/GaN device test systems.',
        href: 'https://www.chromaate.com/',
        logo: 'https://www.chromaate.com/images/all/logo.svg',
        logoScale: 0.8,
        initials: 'CHR',
        color: '#dc2626'
    },
    {
        name: 'NI (Emerson)',
        specialty: 'PXI modular instrumentation — bench to production, Austin TX.',
        href: 'https://www.ni.com/',
        logo: 'https://www.emerson.com/is/image/emerson/logo?fmt=webp-alpha&qlt=95',
        initials: 'NI',
        color: '#059669'
    },
    {
        name: 'Keysight',
        specialty: 'Parametric wafer test, high-frequency, and semiconductor characterization.',
        href: 'https://www.keysight.com/',
        logo: 'https://www.keysight.com/content/dam/keysight/en/img/gnav/keysight-logo.svg',
        logoScale: 1.4,
        initials: 'KEY',
        color: '#e11d48'
    },
    {
        name: 'SPEA',
        specialty: 'MEMS, sensor, and mixed-signal ATE for specialized applications.',
        href: 'https://www.spea.com/',
        logo: 'https://www.spea.com/wp-content/themes/spea/images/logo.png',
        logoScale: 0.8,
        initials: 'SPE',
        color: '#2563eb'
    }
];

const KEY_CONCEPTS = [
    {
        term: 'DUT',
        definition: 'Device Under Test — the chip or module being verified by the tester.',
        moduleHref: null
    },
    {
        term: 'DIB / Loadboard',
        definition: 'Device Interface Board — the custom PCB that routes tester channels to the DUT socket.',
        moduleHref: null
    },
    {
        term: 'Pin Electronics (PE)',
        definition: 'Per-pin driver/receiver circuitry in the test head that applies levels and measures responses.',
        moduleHref: null
    },
    {
        term: 'PPMU',
        definition: 'Per-Pin Measurement Unit — precision force/measure on each channel for parametric and TDR tests.',
        moduleHref: 'fixture-delay/fixture-delay.html'
    },
    {
        term: 'Test Vector / Pattern',
        definition: 'A sequence of digital stimulus and expected responses applied to the DUT over many cycles.',
        moduleHref: null
    },
    {
        term: 'Multisite Testing',
        definition: 'Running identical tests on multiple DUTs in parallel to maximize tester throughput.',
        moduleHref: null
    },
    {
        term: 'Correlation',
        definition: 'Comparing bench and ATE results to ensure production tests match design characterization.',
        moduleHref: null
    },
    {
        term: 'Yield & Binning',
        definition: 'Sorting tested parts into pass/fail categories (bins) to track production yield.',
        moduleHref: null
    },
    {
        term: 'Calibration',
        definition: 'Compensating for fixture delay, level offsets, and timing skew so measurements are accurate at the DUT pin.',
        moduleHref: 'fixture-delay/fixture-delay.html'
    },
    {
        term: 'Cost of Test',
        definition: 'The economic trade-off between test coverage, test time per part, and tester capital cost.',
        moduleHref: null
    }
];

const ACCENT_CLASSES = {
    blue: 'accent-blue',
    green: 'accent-green',
    purple: 'accent-purple',
    orange: 'accent-orange',
    indigo: 'accent-indigo',
    teal: 'accent-teal'
};

function handleLogoError(img) {
    const wrap = img.closest('.provider-logo-wrap');
    if (wrap) wrap.classList.add('fallback');
}

function renderModuleCard(mod) {
    const accent = ACCENT_CLASSES[mod.accent] || 'accent-blue';
    const tags = mod.tags.map(t =>
        `<span class="tag-pill">${t}</span>`
    ).join(' ');

    if (mod.status === 'live') {
        return `
            <a href="${mod.href}" class="module-card module-card--live panel block p-6 ${accent}">
                <div class="flex items-start justify-between gap-3 mb-3">
                    <h3 class="font-semibold text-slate-900 text-lg leading-snug">${mod.title}</h3>
                    <svg class="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </div>
                <p class="text-sm text-slate-600 mb-4">${mod.description}</p>
                <div class="flex flex-wrap gap-2">${tags}</div>
            </a>`;
    }

    return `
        <div class="module-card module-card--soon panel border-dashed p-6 ${accent}">
            <div class="flex items-start justify-between gap-3 mb-3">
                <h3 class="font-semibold text-slate-700 text-lg leading-snug">${mod.title}</h3>
                <span class="tag-pill tag-pill--soon flex-shrink-0">Coming soon</span>
            </div>
            <p class="text-sm text-slate-500 mb-4">${mod.description}</p>
            <div class="flex flex-wrap gap-2">${tags}</div>
        </div>`;
}

function renderProviderCard(p) {
    const wrapClass = p.logo ? 'provider-logo-wrap mb-4' : 'provider-logo-wrap fallback mb-4';
    const scale = typeof p.logoScale === 'number' ? p.logoScale : 1;
    const scaleStyle = scale !== 1 ? ` style="transform:scale(${scale})"` : '';
    const logoHtml = p.logo
        ? `<img src="${p.logo}" alt="${p.name} logo" class="provider-logo"${scaleStyle} loading="lazy" referrerpolicy="no-referrer" onerror="handleLogoError(this)">`
        : '';
    return `
        <a href="${p.href}" target="_blank" rel="noopener noreferrer"
           class="panel block p-5 hover:border-cyan-600/40 transition-colors">
            <div class="${wrapClass}">
                ${logoHtml}
                <div class="provider-initials" style="background-color:${p.color}">${p.initials}</div>
            </div>
            <h3 class="font-semibold text-slate-900 mb-1">${p.name}</h3>
            <p class="text-xs text-slate-600 leading-relaxed">${p.specialty}</p>
        </a>`;
}

function renderConceptCard(c) {
    const explore = c.moduleHref
        ? `<a href="${c.moduleHref}" class="inline-flex items-center gap-1 text-sm font-semibold text-cyan-700 hover:text-cyan-900 mt-3 font-mono">Explore →</a>`
        : '';
    return `
        <div class="panel p-5">
            <h3 class="font-semibold text-slate-900 mb-2 font-mono text-sm tracking-wide">${c.term}</h3>
            <p class="text-sm text-slate-600 leading-relaxed">${c.definition}</p>
            ${explore}
        </div>`;
}

function initHub() {
    const modulesGrid = document.getElementById('modules-grid');
    const providersGrid = document.getElementById('providers-grid');
    const conceptsGrid = document.getElementById('concepts-grid');

    if (modulesGrid && typeof LEARNING_MODULES !== 'undefined') {
        modulesGrid.innerHTML = LEARNING_MODULES.map(renderModuleCard).join('');
    }
    if (providersGrid) {
        providersGrid.innerHTML = PROVIDERS.map(renderProviderCard).join('');
    }
    if (conceptsGrid) {
        conceptsGrid.innerHTML = KEY_CONCEPTS.map(renderConceptCard).join('');
    }

    initMobileNav();
}

document.addEventListener('DOMContentLoaded', initHub);
