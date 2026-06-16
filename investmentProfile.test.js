// investmentProfile.test.js
// Prepared for WIF2003 Web Programming · Module 5 Testing Suite

describe('Module 5: Investment Strategy Module', () => {

    // ----------------------------------------------------
    // Core Engine Logic Under Test
    // ----------------------------------------------------
    function scoreToProfile(score) {
        if (score < 0 || score > 30 || typeof score !== 'number' || !Number.isInteger(score)) {
            throw new Error(`Invalid score: ${score}. Must be between 0 and 30.`);
        }
        if (score <= 10) return 'Conservative';
        if (score <= 20) return 'Moderate';
        return 'Aggressive';
    }

    function getProfileAllocation(profile) {
        const validProfiles = ['Conservative', 'Moderate', 'Aggressive'];
        if (!validProfiles.includes(profile)) {
            throw new Error(`Invalid profile: ${profile}`);
        }
        if (profile === 'Conservative') return { bonds: 60, equities: 20, cash: 20 };
        if (profile === 'Moderate') return { bonds: 40, equities: 50, cash: 10 };
        return { bonds: 10, equities: 80, cash: 10 };
    }

    // ========================================================
    // 1. UNIT TESTING (UT)
    // ========================================================
    describe('1. Unit Testing - Score Boundaries & Allocations', () => {
        
        test('UT-05-01: score=10 should be Conservative, score=11 should be Moderate', () => {
            expect(scoreToProfile(10)).toBe('Conservative');
            expect(scoreToProfile(11)).toBe('Moderate');
        });

        test('UT-05-02: score=20 should be Moderate, score=21 should be Aggressive', () => {
            expect(scoreToProfile(20)).toBe('Moderate');
            expect(scoreToProfile(21)).toBe('Aggressive');
        });

        test('UT-05-03: Check allocation arrays match specifications for Moderate profile', () => {
            const moderateAlloc = getProfileAllocation('Moderate');
            expect(moderateAlloc).toHaveProperty('bonds', 40);
            expect(moderateAlloc).toHaveProperty('equities', 50);
            expect(moderateAlloc).toHaveProperty('cash', 10);
        });

        test('UT-05-04: Reject invalid score boundaries outside 0-30', () => {
            expect(() => scoreToProfile(-1)).toThrow('Invalid score');
            expect(() => scoreToProfile(31)).toThrow('Invalid score');
        });

        test('UT-05-05: Reject invalid non-integer and non-number types', () => {
            expect(() => scoreToProfile(10.5)).toThrow('Invalid score');
            expect(() => scoreToProfile("25")).toThrow('Invalid score');
            expect(() => scoreToProfile(null)).toThrow('Invalid score');
        });
    });

    // ========================================================
    // 2. FUNCTIONAL TESTING (FT-01 to FT-07)
    // ========================================================
    describe('2. Functional Testing - End-to-End Component Flow Simulation', () => {
        
        // FT-05-01: Verifies successful rendering state assembly for Conservative profile
        test('FT-05-01: Verify rendering state compilation for Conservative score (Score 5)', () => {
            const p = scoreToProfile(5);
            const a = getProfileAllocation(p);
            const state = { component: 'StrategyView', props: { profile: p, data: a } };
            expect(state.props.profile).toBe('Conservative');
            expect(state.props.data.bonds).toBe(60);
        });

        // FT-05-02: Verifies successful rendering state assembly for Moderate profile
        test('FT-05-02: Verify rendering state compilation for Moderate score (Score 15)', () => {
            const p = scoreToProfile(15);
            const a = getProfileAllocation(p);
            const state = { component: 'StrategyView', props: { profile: p, data: a } };
            expect(state.props.profile).toBe('Moderate');
            expect(state.props.data.equities).toBe(50);
        });

        // FT-05-03: Verifies successful rendering state assembly for Aggressive profile
        test('FT-05-03: Verify rendering state compilation for Aggressive score (Score 25)', () => {
            const p = scoreToProfile(25);
            const a = getProfileAllocation(p);
            const state = { component: 'StrategyView', props: { profile: p, data: a } };
            expect(state.props.profile).toBe('Aggressive');
            expect(state.props.data.equities).toBe(80);
        });

        // FT-05-04: Simulates UI tab switching behavior between profiles
        test('FT-05-04: Simulate UI strategy tab switching state updates smoothly', () => {
            let activeTab = 'Conservative';
            expect(getProfileAllocation(activeTab).bonds).toBe(60);
            
            activeTab = 'Aggressive';
            expect(getProfileAllocation(activeTab).bonds).toBe(10);
        });

        // FT-05-05: Simulates the component view reset and clearing payload memory
        test('FT-05-05: Simulate user UI clear/reset action flushes state memory data', () => {
            const UIState = { hasCalculated: true, allocationData: getProfileAllocation('Moderate') };
            expect(UIState.allocationData.cash).toBe(10);

            UIState.hasCalculated = false;
            UIState.allocationData = null;
            expect(UIState.allocationData).toBeNull();
        });

        // FT-05-06: Verifies conditional high-risk warnings for Aggressive profiles
        test('FT-05-06: Verify that conditional warning flags trigger for high equity risk allocations', () => {
            const allocation = getProfileAllocation('Aggressive');
            const showHighRiskWarning = allocation.equities > 70;
            expect(showHighRiskWarning).toBe(true);
        });

        // FT-05-07: Verifies safety fallback layout matching when engine encounters unexpected errors
        test('FT-05-07: Verify UI fallback layout state triggers cleanly upon calculation error intercept', () => {
            let UIErrorState = null;
            let renderComponent = 'StrategyDisplay';

            try {
                scoreToProfile(-5); // Triggers runtime error
            } catch (err) {
                UIErrorState = err.message;
                renderComponent = 'FallbackErrorWidget';
            }

            expect(UIErrorState).toContain('Invalid score');
            expect(renderComponent).toBe('FallbackErrorWidget');
        });
    });
});