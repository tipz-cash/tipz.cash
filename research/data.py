"""
TIPZ Research PDF - Data and Content
All statistics, market data, and text content for the research document.
"""

# =============================================================================
# DOCUMENT METADATA
# =============================================================================
DOCUMENT = {
    'title': 'TIPZ',
    'subtitle': 'Market Opportunity & Investment Thesis',
    'tagline': 'Private tips. Any asset. Zero trace.',
    'version': '1.0',
    'date': 'January 2025',
}

# =============================================================================
# EXECUTIVE SUMMARY
# =============================================================================
EXECUTIVE_SUMMARY = {
    'problem': (
        "Creator platforms extract over $5 billion annually in fees from tips and donations. "
        "Meanwhile, every crypto transaction on public blockchains creates a permanent, "
        "traceable record\u2014exposing both creators and supporters to financial surveillance."
    ),
    'solution': (
        "TIPZ is the first private, fee-free, crypto-native tipping infrastructure. "
        "Using Zcash shielded transactions, tips leave no trace. Creators keep 100% of support. "
        "Any token in, ZEC out\u2014zero platform fees, zero surveillance."
    ),
    'opportunity': (
        "The creator tipping market is $2.9B with 350M+ annual transactions. "
        "40% are micropayments under $10\u2014exactly where current fee structures hurt most. "
        "Privacy-preserving crypto is surging: Zcash hit $5B market cap with 30% now shielded."
    ),
}

HERO_STATS = [
    {'value': '$2.9B', 'label': 'Creator Tipping Market', 'color': 'primary'},
    {'value': '350M+', 'label': 'Annual Tips', 'color': 'success'},
    {'value': '40%', 'label': 'Micropayments (<$10)', 'color': 'primary'},
    {'value': '$5B+', 'label': 'Extracted in Fees/Year', 'color': 'error'},
]

# =============================================================================
# PROBLEM SECTION
# =============================================================================
PROBLEM = {
    'fee_extraction': {
        'title': 'The Fee Extraction Crisis',
        'description': (
            "On a $5 tip through traditional platforms, creators lose up to 39% to fees. "
            "Payment processors take 2.9% + $0.30, platforms take 5-50%, and currency conversion "
            "adds more. Micropayments\u2014the most common form of support\u2014are hit hardest."
        ),
    },
    'surveillance': {
        'title': 'Financial Surveillance',
        'description': (
            "Every on-chain transaction is permanent and public. Wallet analytics companies "
            "sell creator financial data. Supporters can be deanonymized through chain analysis. "
            "69% of consumers are worried about financial data misuse."
        ),
        'stats': [
            {'value': '69%', 'label': 'Worried about financial data misuse'},
            {'value': '72%', 'label': 'Would switch for better data security'},
            {'value': '$50B', 'label': 'Digital payment fraud cost (2025)'},
        ],
    },
    'concentration': {
        'title': 'Platform Concentration',
        'description': (
            "A few platforms control creator monetization with extractive fee structures. "
            "Creators have no leverage. Supporters subsidize platform profits, not creators."
        ),
    },
}

# Fee waterfall data: $5 tip breakdown on traditional platform
FEE_WATERFALL = {
    'tip_amount': 5.00,
    'steps': [
        {'name': 'Tip Sent', 'amount': 5.00, 'type': 'start'},
        {'name': 'Payment Processing', 'amount': -0.45, 'type': 'fee', 'rate': '2.9% + $0.30'},
        {'name': 'Platform Fee (10%)', 'amount': -0.50, 'type': 'fee', 'rate': '10%'},
        {'name': 'Currency Conversion', 'amount': -0.15, 'type': 'fee', 'rate': '3%'},
        {'name': 'Withdrawal Fee', 'amount': -0.25, 'type': 'fee', 'rate': 'Flat'},
    ],
    'creator_receives': 3.65,
    'total_fees': 1.35,
    'fee_percentage': 27,
}

# TIPZ fee comparison
TIPZ_WATERFALL = {
    'tip_amount': 5.00,
    'steps': [
        {'name': 'Tip Sent (Any Token)', 'amount': 5.00, 'type': 'start'},
        {'name': 'Swap Fee (DEX)', 'amount': -0.01, 'type': 'fee', 'rate': '0.2%'},
        {'name': 'Zcash Network Fee', 'amount': -0.01, 'type': 'fee', 'rate': '~$0.01'},
    ],
    'creator_receives': 4.98,
    'total_fees': 0.02,
    'fee_percentage': 0.4,
}

# =============================================================================
# MARKET OPPORTUNITY
# =============================================================================
MARKET = {
    'creator_economy': {
        'title': 'Creator Economy',
        'current_size': 250,  # Billions
        'projected_size': 480,  # Billions by 2027
        'cagr': 23.3,
        'creators': 207,  # Millions
        'full_time_pct': 54.9,
        'source': 'Goldman Sachs, 2024',
    },
    'tipping_market': {
        'title': 'Creator Tipping Market',
        'size': 2.9,  # Billions
        'annual_tips': 350,  # Millions
        'micropayment_pct': 40,  # Under $10
        'fees_extracted': 5,  # Billions annually
        'source': 'StreamLabs, Patreon Reports, 2024',
    },
    'privacy_crypto': {
        'title': 'Privacy & Zcash Momentum',
        'zcash_surge': 700,  # Percent gain
        'zcash_mcap': 5,  # Billions
        'shielded_pct': 30,  # Up from 11%
        'privacy_tx_pct': 11.4,  # Privacy coin transactions
        'grayscale_aum': 123,  # Millions
        'merchants': 886,
        'source': 'Grayscale, Chainalysis, 2025',
    },
}

# Creator economy growth trajectory data
CREATOR_ECONOMY_GROWTH = [
    {'year': 2020, 'value': 104},
    {'year': 2021, 'value': 138},
    {'year': 2022, 'value': 168},
    {'year': 2023, 'value': 210},
    {'year': 2024, 'value': 250},
    {'year': 2025, 'value': 308},
    {'year': 2026, 'value': 380},
    {'year': 2027, 'value': 480},
]

# Tip size distribution
TIP_SIZE_DISTRIBUTION = [
    {'range': '$1-5', 'percentage': 25, 'is_micropayment': True},
    {'range': '$5-10', 'percentage': 15, 'is_micropayment': True},
    {'range': '$10-25', 'percentage': 22, 'is_micropayment': False},
    {'range': '$25-50', 'percentage': 18, 'is_micropayment': False},
    {'range': '$50-100', 'percentage': 12, 'is_micropayment': False},
    {'range': '$100+', 'percentage': 8, 'is_micropayment': False},
]

# Zcash shielded pool growth
ZCASH_SHIELDED_GROWTH = [
    {'year': '2021', 'percentage': 11},
    {'year': '2022', 'percentage': 15},
    {'year': '2023', 'percentage': 21},
    {'year': '2024', 'percentage': 26},
    {'year': '2025', 'percentage': 30},
]

# =============================================================================
# COMPETITIVE LANDSCAPE
# =============================================================================
COMPETITORS = [
    {
        'name': 'YouTube Super Chat',
        'platform_fee': '30%',
        'payment_fee': '-',
        'total_take': '30%',
        'privacy': 'None',
        'custody': 'Platform',
        'tokens': 'Fiat only',
    },
    {
        'name': 'Twitch Bits',
        'platform_fee': '50%',
        'payment_fee': '-',
        'total_take': '50%',
        'privacy': 'None',
        'custody': 'Platform',
        'tokens': 'Fiat only',
    },
    {
        'name': 'TikTok Gifts',
        'platform_fee': '50%',
        'payment_fee': '-',
        'total_take': '50%',
        'privacy': 'None',
        'custody': 'Platform',
        'tokens': 'Fiat only',
    },
    {
        'name': 'Patreon',
        'platform_fee': '8-12%',
        'payment_fee': '2.9% + $0.30',
        'total_take': '11-15%+',
        'privacy': 'Low',
        'custody': 'Platform',
        'tokens': 'Fiat only',
    },
    {
        'name': 'Ko-fi',
        'platform_fee': '0-5%',
        'payment_fee': '2.9% + $0.30',
        'total_take': '3-8%+',
        'privacy': 'Low',
        'custody': 'Platform',
        'tokens': 'Fiat only',
    },
    {
        'name': 'Buy Me a Coffee',
        'platform_fee': '5%',
        'payment_fee': '2.9% + $0.30',
        'total_take': '8%+',
        'privacy': 'Low',
        'custody': 'Platform',
        'tokens': 'Fiat only',
    },
    {
        'name': 'Ethereum Tips',
        'platform_fee': '0%',
        'payment_fee': 'Gas (~$2-20)',
        'total_take': 'Variable',
        'privacy': 'None',
        'custody': 'Self',
        'tokens': 'ETH/ERC-20',
    },
    {
        'name': 'TIPZ',
        'platform_fee': '0%',
        'payment_fee': '~$0.02',
        'total_take': '~0.5%',
        'privacy': 'Full',
        'custody': 'Self',
        'tokens': 'Any \u2192 ZEC',
        'highlight': True,
    },
]

# Feature comparison matrix
FEATURE_COMPARISON = {
    'features': ['Full Privacy', 'Zero Platform Fee', 'Self-Custody', 'Any Token Support', 'Micropayment Friendly'],
    'competitors': {
        'YouTube': [False, False, False, False, False],
        'Twitch': [False, False, False, False, False],
        'Patreon': [False, False, False, False, False],
        'Ko-fi': [False, True, False, False, False],
        'ETH Tips': [False, True, True, True, False],
        'TIPZ': [True, True, True, True, True],
    }
}

# Competitive positioning (for quadrant chart)
# x = Privacy (0-10), y = Fee-Free Score (0-10, inverse of fees)
COMPETITIVE_POSITIONING = [
    {'name': 'YouTube', 'privacy': 0, 'fee_score': 2, 'size': 100},
    {'name': 'Twitch', 'privacy': 0, 'fee_score': 1, 'size': 80},
    {'name': 'TikTok', 'privacy': 0, 'fee_score': 1, 'size': 90},
    {'name': 'Patreon', 'privacy': 2, 'fee_score': 5, 'size': 60},
    {'name': 'Ko-fi', 'privacy': 2, 'fee_score': 7, 'size': 40},
    {'name': 'Buy Me a Coffee', 'privacy': 2, 'fee_score': 6, 'size': 45},
    {'name': 'ETH Tips', 'privacy': 1, 'fee_score': 8, 'size': 50},
    {'name': 'TIPZ', 'privacy': 10, 'fee_score': 10, 'size': 70},
]

# =============================================================================
# TIPZ SOLUTION
# =============================================================================
SOLUTION = {
    'overview': (
        "TIPZ is privacy-first tipping infrastructure for creators. Any token can be swapped "
        "to ZEC and delivered to a creator's shielded address. No trace. No fees. No platform capture."
    ),
    'architecture': {
        'steps': [
            {'step': 1, 'name': 'Any Token', 'description': 'Tipper sends any supported token'},
            {'step': 2, 'name': 'DEX Swap', 'description': 'Automated swap to ZEC via DEX'},
            {'step': 3, 'name': 'Shielded Transfer', 'description': 'ZEC sent to shielded address'},
            {'step': 4, 'name': 'Creator Receives', 'description': 'Private, self-custodied funds'},
        ],
    },
    'components': [
        {
            'name': 'Browser Extension',
            'description': 'One-click tipping from X (Twitter). Detects creator profiles, shows tip button.',
            'status': 'MVP Complete',
        },
        {
            'name': 'Creator Registration',
            'description': 'Connect X handle to Zcash shielded address. Tweet-based verification.',
            'status': 'MVP Complete',
        },
        {
            'name': 'Creator Directory',
            'description': 'Discover registered creators. Search and browse tip-enabled profiles.',
            'status': 'MVP Complete',
        },
        {
            'name': 'Token Swap Engine',
            'description': 'Automated any-token-to-ZEC swaps via DEX aggregation.',
            'status': 'In Development',
        },
    ],
    'value_props': {
        'creators': [
            {'title': 'Keep 100%', 'description': 'Zero platform fees. Only minimal network costs.'},
            {'title': 'Full Privacy', 'description': 'Income invisible to chain analysis and surveillance.'},
            {'title': 'Self-Custody', 'description': 'Your keys, your crypto. No platform can freeze funds.'},
            {'title': 'Any Asset', 'description': 'Accept tips in any token, receive in ZEC.'},
        ],
        'tippers': [
            {'title': 'Anonymous Support', 'description': 'No one knows you tipped. No traceable record.'},
            {'title': 'Direct Impact', 'description': 'Creators get the full amount. No middleman extraction.'},
            {'title': 'Any Token', 'description': 'Tip from any wallet, any chain, any token.'},
            {'title': 'Low Fees', 'description': 'Micropayments are finally viable. ~$0.02 per tip.'},
        ],
    },
}

# =============================================================================
# BUSINESS MODEL & PROJECTIONS
# =============================================================================
BUSINESS_MODEL = {
    'revenue_streams': [
        {
            'name': 'Zero Platform Fees',
            'description': 'TIPZ charges no platform fees. Growth driven by network effects and grants.',
            'status': 'Active',
        },
        {
            'name': 'Future: Premium Features',
            'description': 'Optional analytics, custom profiles, API access for power creators.',
            'status': 'Planned',
        },
        {
            'name': 'Future: Enterprise Licensing',
            'description': 'White-label privacy tipping infrastructure for other platforms.',
            'status': 'Exploratory',
        },
    ],
    'funding': {
        'current': 'Pre-seed / Grant-funded',
        'seeking': 'Ecosystem grants (Zcash Community Grants, EFF)',
        'use_of_funds': [
            {'category': 'Engineering', 'percentage': 50},
            {'category': 'Security Audits', 'percentage': 20},
            {'category': 'Community Growth', 'percentage': 20},
            {'category': 'Operations', 'percentage': 10},
        ],
    },
}

# 3-scenario volume projections (ZEC tipped per month)
PROJECTIONS = {
    'scenarios': {
        'conservative': {
            'name': 'Conservative',
            'description': 'Organic growth, Zcash community only',
            'data': [
                {'month': 0, 'volume': 0},
                {'month': 6, 'volume': 500},
                {'month': 12, 'volume': 2000},
                {'month': 18, 'volume': 5000},
                {'month': 24, 'volume': 10000},
                {'month': 36, 'volume': 25000},
            ],
        },
        'base': {
            'name': 'Base',
            'description': 'Grant funding, creator partnerships',
            'data': [
                {'month': 0, 'volume': 0},
                {'month': 6, 'volume': 2000},
                {'month': 12, 'volume': 8000},
                {'month': 18, 'volume': 20000},
                {'month': 24, 'volume': 50000},
                {'month': 36, 'volume': 150000},
            ],
        },
        'optimistic': {
            'name': 'Optimistic',
            'description': 'Viral adoption, platform integrations',
            'data': [
                {'month': 0, 'volume': 0},
                {'month': 6, 'volume': 5000},
                {'month': 12, 'volume': 25000},
                {'month': 18, 'volume': 75000},
                {'month': 24, 'volume': 200000},
                {'month': 36, 'volume': 500000},
            ],
        },
    },
    'assumptions': [
        'Average tip: $15 equivalent in ZEC',
        'ZEC price: $50 (conservative baseline)',
        'Creator retention: 60% after 6 months',
        'Tipper conversion: 5% of creator followers',
    ],
}

# =============================================================================
# GO-TO-MARKET
# =============================================================================
GTM = {
    'target_segments': [
        {
            'segment': 'Crypto-Native Creators',
            'description': 'Already in crypto, need better tipping than ETH addresses',
            'size': '~500K creators',
            'priority': 'Primary',
        },
        {
            'segment': 'Privacy Advocates',
            'description': 'Journalists, activists, content creators in sensitive spaces',
            'size': '~100K creators',
            'priority': 'Primary',
        },
        {
            'segment': 'Zcash Community',
            'description': 'Existing ZEC holders, community members, advocates',
            'size': '~50K active users',
            'priority': 'Launch',
        },
        {
            'segment': 'Mainstream Creators',
            'description': 'Long-term: creators seeking fee-free alternatives',
            'size': '~10M+ creators',
            'priority': 'Future',
        },
    ],
    'tam_sam_som': {
        'tam': {'value': 2.9, 'unit': 'B', 'description': 'Global Creator Tipping Market'},
        'sam': {'value': 290, 'unit': 'M', 'description': 'Crypto-Accepting Creators (~10%)'},
        'som': {'value': 29, 'unit': 'M', 'description': 'Privacy-Focused Creators (~1%)'},
    },
    'phases': [
        {
            'phase': 'Phase 1: Foundation',
            'timeline': 'Q1-Q2 2025',
            'goals': [
                'Launch on X (Twitter) with browser extension',
                '100 registered creators',
                'Zcash community adoption',
            ],
        },
        {
            'phase': 'Phase 2: Growth',
            'timeline': 'Q3-Q4 2025',
            'goals': [
                'Multi-chain token support',
                '1,000 registered creators',
                'Partnership with crypto media',
            ],
        },
        {
            'phase': 'Phase 3: Scale',
            'timeline': '2026',
            'goals': [
                'Platform API for integrations',
                '10,000+ registered creators',
                'Additional social platform support',
            ],
        },
    ],
}

# =============================================================================
# TEAM & TRACTION (PLACEHOLDERS)
# =============================================================================
TEAM = {
    'note': '[PLACEHOLDER - TO BE FILLED]',
    'members': [
        {
            'name': '[Founder Name]',
            'role': 'Founder & CEO',
            'bio': '[Brief bio highlighting relevant experience in crypto, privacy tech, or creator economy]',
            'photo': None,
        },
        {
            'name': '[Technical Lead]',
            'role': 'CTO',
            'bio': '[Brief bio highlighting relevant technical experience]',
            'photo': None,
        },
    ],
    'advisors': [
        {
            'name': '[Advisor Name]',
            'affiliation': '[Organization]',
            'expertise': '[Relevant expertise]',
        },
    ],
}

TRACTION = {
    'note': '[PLACEHOLDER - TO BE FILLED WITH CURRENT METRICS]',
    'metrics': [
        {'name': 'Registered Creators', 'value': '[X]', 'growth': '[+Y% MoM]'},
        {'name': 'Extension Installs', 'value': '[X]', 'growth': '[+Y% MoM]'},
        {'name': 'Total ZEC Tipped', 'value': '[X ZEC]', 'growth': '[+Y% MoM]'},
        {'name': 'Monthly Active Tippers', 'value': '[X]', 'growth': '[+Y% MoM]'},
    ],
    'partnerships': [
        {'name': '[Partner 1]', 'status': 'In Discussion', 'description': '[Brief description]'},
        {'name': '[Partner 2]', 'status': 'Letter of Intent', 'description': '[Brief description]'},
    ],
    'grants': [
        {'name': '[Grant Name]', 'amount': '[Amount]', 'status': 'Applied/Awarded'},
    ],
}

# =============================================================================
# INVESTMENT OPPORTUNITY
# =============================================================================
INVESTMENT = {
    'headline': 'Building Privacy Infrastructure for the Creator Economy',
    'ask': '[Investment amount or grant request]',
    'milestones_12_months': [
        'Launch multi-chain token swap support',
        '1,000 registered creators',
        'Complete security audit',
        '$100K+ monthly tip volume',
        'Partnership with major crypto publication',
    ],
    'milestones_18_months': [
        'Platform API public launch',
        '5,000+ registered creators',
        'Second social platform integration',
        '$500K+ monthly tip volume',
    ],
    'contact': {
        'email': '[contact@tipz.app]',
        'website': 'https://tipz.app',
        'twitter': '@tipzapp',
    },
}

# =============================================================================
# SOURCES / CITATIONS
# =============================================================================
SOURCES = [
    {
        'category': 'Creator Economy Market',
        'citations': [
            'Goldman Sachs. "The Creator Economy Could Approach Half-a-Trillion Dollars by 2027." April 2024.',
            'SignalFire. "Creator Economy Market Map 2024." February 2024.',
            'Linktree. "Creator Report: State of the Creator Economy." 2024.',
        ],
    },
    {
        'category': 'Micropayments & Tipping',
        'citations': [
            'StreamLabs. "Year in Review: Live Streaming Data." 2024.',
            'Patreon. "Creator Earnings Report." 2024.',
            'Buy Me a Coffee. "State of Creator Support." 2024.',
        ],
    },
    {
        'category': 'Privacy & Financial Surveillance',
        'citations': [
            'Morning Consult. "Consumer Attitudes Toward Financial Data Privacy." 2024.',
            'CFPB. "Request for Information on Data Privacy in Consumer Finance." 2024.',
            'Juniper Research. "Digital Payment Fraud: Global Forecast 2025." 2024.',
        ],
    },
    {
        'category': 'Zcash & Privacy Crypto',
        'citations': [
            'Grayscale. "Zcash Trust Quarterly Report." Q4 2024.',
            'Chainalysis. "Privacy Coin Transaction Analysis." 2025.',
            'Electric Coin Co. "Zcash Shielded Adoption Metrics." January 2025.',
            'CoinGecko. "Zcash Market Data." January 2025.',
        ],
    },
    {
        'category': 'Platform Fee Structures',
        'citations': [
            'YouTube. "Super Chat & Super Stickers Policies." 2024.',
            'Twitch. "Affiliate & Partner Program Terms." 2024.',
            'Patreon. "Pricing & Fees." 2024.',
            'Ko-fi. "Fee Structure." 2024.',
        ],
    },
]
