/**
 * Learning module registry.
 * To add a new module: create its folder, then append one entry here.
 */
const LEARNING_MODULES = [
    {
        id: 'scaling-silicon',
        title: 'Scaling Silicon',
        description: 'From bench characterization to ATE industrialization — synergy, TTM, and program transfer.',
        href: 'scaling-silicon.html',
        tags: ['Bench', 'ATE', 'NPI'],
        status: 'live',
        accent: 'teal'
    },
    {
        id: 'fixture-delay',
        title: 'Fixture Delay Calibration',
        description: 'PPMU reflectometry, TDR, and t_fixture math on the Advantest V93000 SmarTest platform.',
        href: 'fixture-delay/fixture-delay.html',
        tags: ['Calibration', 'PPMU', 'Timing'],
        status: 'live',
        accent: 'blue'
    },
    {
        id: 'multisite',
        title: 'Multisite Testing',
        description: 'Parallel test sites, site-to-site correlation, and throughput optimization on production ATE.',
        tags: ['Production', 'Throughput'],
        status: 'coming-soon',
        accent: 'green'
    },
    {
        id: 'binning',
        title: 'Binning & Yield',
        description: 'Hard/soft bins, yield tracking, and how test results map to production decisions.',
        tags: ['Yield', 'Production'],
        status: 'coming-soon',
        accent: 'orange'
    },
    {
        id: 'dib-design',
        title: 'DUT Interface Design',
        description: 'Loadboard layout, pogo pin mapping, signal integrity, and fixture design best practices.',
        tags: ['Hardware', 'DIB'],
        status: 'coming-soon',
        accent: 'purple'
    },
    {
        id: 'smartest',
        title: 'SmarTest Basics',
        description: 'Test program structure, channel attributes, timing sets, and levels on V93000.',
        tags: ['SmarTest', 'V93000'],
        status: 'coming-soon',
        accent: 'indigo'
    },
    {
        id: 'correlation',
        title: 'Bench-to-ATE Correlation',
        description: 'Correlating bench characterization results with production ATE measurements.',
        tags: ['Validation', 'Correlation'],
        status: 'coming-soon',
        accent: 'teal'
    }
];
