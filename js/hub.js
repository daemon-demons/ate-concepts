/**
 * Hub page rendering: learning modules, providers, and shared image fallback.
 */

const PROVIDERS = [
    {
        name: 'Advantest',
        specialty: 'SoC, memory, and SLT testers — V93000, T2000. ~50% global ATE share.',
        href: 'https://www.advantest.com/',
        logo: 'https://static.cdnlogo.com/logos/a/91/advantest.svg',
        initials: 'ADV',
        color: '#1e40af'
    },
    {
        name: 'Teradyne',
        specialty: 'UltraFLEX, J750 SoC testers. Acquired Eagle Test Systems & LitePoint.',
        href: 'https://www.teradyne.com/',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Teradyne_logo_2014.svg/512px-Teradyne_logo_2014.svg.png',
        initials: 'TER',
        color: '#0f766e'
    },
    {
        name: 'Eagle Test Systems',
        specialty: 'Analog & mixed-signal ETS platforms — now a Teradyne company.',
        href: 'https://www.teradyne.com/',
        logo: null,
        initials: 'ETS',
        color: '#b45309'
    },
    {
        name: 'Cohu',
        specialty: 'Test handlers, contactors, thermal management, and Diamondx testers.',
        href: 'https://www.cohu.com/',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Cohu_logo.svg/320px-Cohu_logo.svg.png',
        initials: 'COH',
        color: '#7c3aed'
    },
    {
        name: 'Chroma ATE',
        specialty: 'Power semiconductor, EV, and SiC/GaN device test systems.',
        href: 'https://www.chromaate.com/',
        logo: null,
        initials: 'CHR',
        color: '#dc2626'
    },
    {
        name: 'NI (Emerson)',
        specialty: 'PXI modular instrumentation — bench to production, Austin TX.',
        href: 'https://www.ni.com/',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/National_Instruments_logo_2020.svg/512px-National_Instruments_logo_2020.svg.png',
        initials: 'NI',
        color: '#059669'
    },
    {
        name: 'Keysight',
        specialty: 'Parametric wafer test, high-frequency, and semiconductor characterization.',
        href: 'https://www.keysight.com/',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Keysight_Technologies_logo.svg/320px-Keysight_Technologies_logo.svg.png',
        initials: 'KEY',
        color: '#e11d48'
    },
    {
        name: 'SPEA',
        specialty: 'MEMS, sensor, and mixed-signal ATE for specialized applications.',
        href: 'https://www.spea.com/',
        logo: null,
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
        `<span class="tag-pill bg-slate-100 text-slate-600 px-2 py-0.5 rounded">${t}</span>`
    ).join(' ');

    if (mod.status === 'live') {
        return `
            <a href="${mod.href}" class="module-card module-card--live block bg-white rounded-xl border border-slate-200 shadow-sm p-6 ${accent}">
                <div class="flex items-start justify-between gap-3 mb-3">
                    <h3 class="font-bold text-slate-900 text-lg leading-snug">${mod.title}</h3>
                    <svg class="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </div>
                <p class="text-sm text-slate-600 mb-4">${mod.description}</p>
                <div class="flex flex-wrap gap-2">${tags}</div>
            </a>`;
    }

    return `
        <div class="module-card module-card--soon bg-white rounded-xl border border-dashed border-slate-300 p-6 ${accent}">
            <div class="flex items-start justify-between gap-3 mb-3">
                <h3 class="font-bold text-slate-700 text-lg leading-snug">${mod.title}</h3>
                <span class="tag-pill bg-slate-200 text-slate-500 px-2 py-0.5 rounded flex-shrink-0">Coming soon</span>
            </div>
            <p class="text-sm text-slate-500 mb-4">${mod.description}</p>
            <div class="flex flex-wrap gap-2">${tags}</div>
        </div>`;
}

function renderProviderCard(p) {
    const wrapClass = p.logo ? 'provider-logo-wrap mb-4' : 'provider-logo-wrap fallback mb-4';
    const logoHtml = p.logo
        ? `<img src="${p.logo}" alt="${p.name} logo" class="provider-logo" loading="lazy" referrerpolicy="no-referrer" onerror="handleLogoError(this)">`
        : '';
    return `
        <a href="${p.href}" target="_blank" rel="noopener noreferrer"
           class="block bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div class="${wrapClass}">
                ${logoHtml}
                <div class="provider-initials" style="background-color:${p.color}">${p.initials}</div>
            </div>
            <h3 class="font-bold text-slate-900 mb-1">${p.name}</h3>
            <p class="text-xs text-slate-600 leading-relaxed">${p.specialty}</p>
        </a>`;
}

function renderConceptCard(c) {
    const explore = c.moduleHref
        ? `<a href="${c.moduleHref}" class="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 mt-3">Explore &rarr;</a>`
        : '';
    return `
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 class="font-bold text-slate-900 mb-2">${c.term}</h3>
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

    // Mobile nav toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            const expanded = mobileMenu.classList.contains('open');
            menuBtn.setAttribute('aria-expanded', expanded);
        });
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => mobileMenu.classList.remove('open'));
        });
    }
}

document.addEventListener('DOMContentLoaded', initHub);
