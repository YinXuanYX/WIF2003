import { scoreToProfile, getProfileAllocation } from './server/utils/investmentProfile.js';

const testCases = [
  { score: 0, expectedProfile: 'Conservative', description: 'Lower boundary for Conservative' },
  { score: 10, expectedProfile: 'Conservative', description: 'Upper boundary for Conservative' },
  { score: 11, expectedProfile: 'Moderate', description: 'Lower boundary for Moderate' },
  { score: 15, expectedProfile: 'Moderate', description: 'Middle of Moderate range' },
  { score: 20, expectedProfile: 'Moderate', description: 'Upper boundary for Moderate' },
  { score: 21, expectedProfile: 'Aggressive', description: 'Lower boundary for Aggressive' },
  { score: 30, expectedProfile: 'Aggressive', description: 'Upper boundary for Aggressive' },
];

const allocationCases = [
  { profile: 'Conservative', expectedAllocation: { bonds: 60, equities: 20, cash: 20 } },
  { profile: 'Moderate', expectedAllocation: { bonds: 40, equities: 50, cash: 10 } },
  { profile: 'Aggressive', expectedAllocation: { bonds: 10, equities: 80, cash: 10 } },
];

const invalidScores = [-1, 31, -100, 100, 10.5];
const invalidProfiles = ['Conservative123', 'moderate', 'Unknown', '', null];

console.log('========== Testing scoreToProfile ==========\n');

let passed = 0;
let failed = 0;

testCases.forEach(({ score, expectedProfile, description }) => {
  try {
    const profile = scoreToProfile(score);
    if (profile === expectedProfile) {
      console.log(`✓ PASS: ${description} (score=${score} → ${profile})`);
      passed++;
    } else {
      console.log(`✗ FAIL: ${description} (expected ${expectedProfile}, got ${profile})`);
      failed++;
    }
  } catch (error) {
    console.log(`✗ FAIL: ${description} (threw error: ${error.message})`);
    failed++;
  }
});

console.log('\n========== Testing getProfileAllocation ==========\n');

allocationCases.forEach(({ profile, expectedAllocation }) => {
  try {
    const allocation = getProfileAllocation(profile);
    const match =
      allocation.bonds === expectedAllocation.bonds &&
      allocation.equities === expectedAllocation.equities &&
      allocation.cash === expectedAllocation.cash;

    if (match) {
      console.log(`✓ PASS: ${profile} allocation correct (${JSON.stringify(allocation)})`);
      passed++;
    } else {
      console.log(
        `✗ FAIL: ${profile} allocation mismatch (expected ${JSON.stringify(expectedAllocation)}, got ${JSON.stringify(allocation)})`
      );
      failed++;
    }
  } catch (error) {
    console.log(`✗ FAIL: ${profile} allocation (threw error: ${error.message})`);
    failed++;
  }
});

console.log('\n========== Testing Invalid Scores ==========\n');

invalidScores.forEach((score) => {
  try {
    scoreToProfile(score);
    console.log(`✗ FAIL: Should reject invalid score ${score}`);
    failed++;
  } catch (error) {
    console.log(`✓ PASS: Rejected invalid score ${score} (${error.message})`);
    passed++;
  }
});

console.log('\n========== Testing Invalid Profiles ==========\n');

invalidProfiles.forEach((profile) => {
  try {
    getProfileAllocation(profile);
    console.log(`✗ FAIL: Should reject invalid profile "${profile}"`);
    failed++;
  } catch (error) {
    console.log(`✓ PASS: Rejected invalid profile "${profile}" (${error.message})`);
    passed++;
  }
});

console.log('\n========== Summary ==========');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed === 0) {
  console.log('\n✓ All tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed!');
  process.exit(1);
}
