/**
 * e2e/game.spec.js
 *
 * End-to-end tests for IsoBloom: The Flower Garden — v1.3 zone-unlock mechanic
 *
 * Coverage:
 *  1.  Title screen renders and Start button works
 *  2.  Game HUD appears with zone petal indicator
 *  3.  Seed-zone nodes are clickable on round 1
 *  4.  Locked petal nodes (zones not yet unlocked) are not interactive on round 1
 *  5.  Reset button clears selection
 *  6.  Submit with wrong count shows feedback + decrements heart
 *  7.  Correct pattern in round 1 advances to round 2
 *  8.  Zone-reveal banner appears after a win
 *  9.  Claimed nodes cannot be re-selected after a round is solved
 * 10.  NW petal nodes unlock and become interactive after round 1 win
 * 11.  All 7 rounds complete on the growing board → End screen
 * 12.  End screen shows final score and rating
 * 13.  Play Again returns to title
 * 14.  Exhausting 3 attempts shows the Fail screen
 * 15.  Try Again from Fail screen returns to title
 */

import { test, expect } from '@playwright/test'

// ── Canonical placements (Python-verified, all 19 nodes, no overlaps) ────────
//
//  Zone 0 (Seed, always active): n4 n5 n8 n9 n10 n13 n14
//  R1  line2     [n4, n9]              unlocksZone 0  (Seed — already active)
//  R2  line3     [n0, n3, n8]          unlocksZone 1  (NW Petal: n0, n3)
//  R3  triangle  [n1, n2, n5]          unlocksZone 2  (N Petal: n1, n2)
//  R4  triangle  [n6, n10, n11]        unlocksZone 3  (NE Petal: n6, n11)
//  R5  triangle  [n14, n15, n18]       unlocksZone 4  (SE Petal: n15, n18)
//  R6  triangle  [n13, n16, n17]       unlocksZone 5  (S Petal: n16, n17)
//  R7  line2     [n7, n12]             unlocksZone 6  (SW Petal: n7, n12)

const R1 = ['[data-node-id="n4"]',  '[data-node-id="n9"]']
const R2 = ['[data-node-id="n0"]',  '[data-node-id="n3"]',  '[data-node-id="n8"]']
const R3 = ['[data-node-id="n1"]',  '[data-node-id="n2"]',  '[data-node-id="n5"]']
const R4 = ['[data-node-id="n6"]',  '[data-node-id="n10"]', '[data-node-id="n11"]']
const R5 = ['[data-node-id="n14"]', '[data-node-id="n15"]', '[data-node-id="n18"]']
const R6 = ['[data-node-id="n13"]', '[data-node-id="n16"]', '[data-node-id="n17"]']
const R7 = ['[data-node-id="n7"]',  '[data-node-id="n12"]']

const ALL_ROUNDS = [R1, R2, R3, R4, R5, R6, R7]

// Seed-zone nodes: always active from round 1
const SEED_NODE_A = '[data-node-id="n4"]'
const SEED_NODE_B = '[data-node-id="n9"]'

// A petal node locked on round 1 (zone 1 NW petal, unlocked after round 1 win)
const LOCKED_NODE_R1 = '[data-node-id="n0"]'

/** Click every node in a selector array */
async function clickNodes(page, selectors) {
  for (const sel of selectors) {
    await page.locator(sel).click({ force: true })
  }
}

/**
 * Play through a given number of rounds using the canonical combos,
 * waiting for each advance + zone-reveal to finish (1400 + 600 = 2000ms).
 */
async function playRounds(page, count) {
  for (let i = 0; i < count; i++) {
    await clickNodes(page, ALL_ROUNDS[i])
    await page.getByTestId('btn-submit').click()
    await page.waitForTimeout(2200)
  }
}

/** Start the game and complete all 7 rounds → End screen */
async function completeGame(page) {
  await page.goto('/')
  await page.getByTestId('btn-start').click()
  await playRounds(page, 7)
  await page.waitForSelector('text=Garden Complete!', { timeout: 5000 })
}

// ── Tests ────────────────────────────────────────────────────────────────────

test.describe('IsoBloom — Start Screen', () => {
  test('shows title and Start button', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('IsoBloom')).toBeVisible()
    await expect(page.getByText('The Flower Garden')).toBeVisible()
    await expect(page.getByTestId('btn-start')).toBeVisible()
  })

  test('Start button transitions to the game screen', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('btn-start').click()
    await expect(page.getByText('Round')).toBeVisible()
    await expect(page.getByText('Score')).toBeVisible()
    await expect(page.getByText('Lives')).toBeVisible()
    await expect(page.getByText('Garden')).toBeVisible()
  })
})

test.describe('IsoBloom — Game Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('btn-start').click()
  })

  test('seed-zone nodes are present and visible on round 1', async ({ page }) => {
    await expect(page.locator(SEED_NODE_A)).toBeVisible()
    await expect(page.locator(SEED_NODE_B)).toBeVisible()
  })

  test('clicking a seed node selects it (selection count updates)', async ({ page }) => {
    await page.locator(SEED_NODE_A).click({ force: true })
    await expect(page.getByText(/1 node selected/i)).toBeVisible()
  })

  test('clicking two seed nodes shows correct selection count', async ({ page }) => {
    await page.locator(SEED_NODE_A).click({ force: true })
    await page.locator(SEED_NODE_B).click({ force: true })
    await expect(page.getByText(/2 nodes selected/i)).toBeVisible()
  })

  test('Reset button clears selection', async ({ page }) => {
    await page.locator(SEED_NODE_A).click({ force: true })
    await page.locator(SEED_NODE_B).click({ force: true })
    await page.getByTestId('btn-reset').click()
    await expect(page.getByText(/0 nodes selected/i)).toBeVisible()
  })

  test('submit with wrong count shows feedback and decrements attempts', async ({ page }) => {
    // Select only 1 node; round 1 (line2) needs exactly 2
    await page.locator(SEED_NODE_A).click({ force: true })
    await page.getByTestId('btn-submit').click()
    await expect(page.getByText(/select exactly/i)).toBeVisible()
    await expect(page.getByText(/2 attempts left/i)).toBeVisible()
  })

  test('Submit button is disabled when nothing is selected', async ({ page }) => {
    await expect(page.getByTestId('btn-submit')).toBeDisabled()
  })

  test('locked petal node cannot be selected on round 1', async ({ page }) => {
    // n0 is in zone 1 (NW petal) — locked as ghost on round 1
    // ghost nodes have pointer-events:none → clicking should NOT increment selection
    await page.locator(LOCKED_NODE_R1).click({ force: true })
    await expect(page.getByText(/0 nodes selected/i)).toBeVisible()
  })
})

test.describe('IsoBloom — Round Progression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('btn-start').click()
  })

  test('round 1 (line2 n4+n9): correct selection advances to round 2', async ({ page }) => {
    await clickNodes(page, R1)
    await page.getByTestId('btn-submit').click()
    await expect(page.getByText(/Pattern matched|Perfect bloom/i)).toBeVisible()
    await expect(page.getByTestId('round-value')).toContainText('2', { timeout: 4000 })
  })

  test('after round 1 win, zone-reveal banner appears briefly', async ({ page }) => {
    await clickNodes(page, R1)
    await page.getByTestId('btn-submit').click()
    await expect(page.getByText(/New zone unlocked/i)).toBeVisible({ timeout: 2000 })
  })

  test('claimed nodes show placed-round label after a round is solved', async ({ page }) => {
    test.setTimeout(10000)
    await clickNodes(page, R1)
    await page.getByTestId('btn-submit').click()
    await page.waitForTimeout(2200)
    const n4 = page.locator('[data-node-id="n4"]')
    await expect(n4).toHaveAttribute('aria-label', /placed round 1/i)
  })

  test('all 7 rounds complete on the growing board and reach the End screen', async ({ page }) => {
    test.setTimeout(40000)
    await playRounds(page, 7)
    await expect(page.getByText('Garden Complete!')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('btn-restart')).toBeVisible()
  })
})

test.describe('IsoBloom — Zone Unlock Visual', () => {
  test('NW petal node (n0) becomes interactive after round 1 win', async ({ page }) => {
    test.setTimeout(12000)
    await page.goto('/')
    await page.getByTestId('btn-start').click()

    // Before round 1: n0 is locked ghost — clicking should not select it
    await page.locator('[data-node-id="n0"]').click({ force: true })
    await expect(page.getByText(/0 nodes selected/i)).toBeVisible()

    // Complete round 1 to unlock zone 1 (NW petal)
    await clickNodes(page, R1)
    await page.getByTestId('btn-submit').click()
    await page.waitForTimeout(2200)

    // After zone unlock: n0 should now be clickable
    await page.locator('[data-node-id="n0"]').click({ force: true })
    await expect(page.getByText(/1 node selected/i)).toBeVisible()
  })
})

test.describe('IsoBloom — End Screen', () => {
  test('End screen shows final score and rating', async ({ page }) => {
    test.setTimeout(40000)
    await completeGame(page)
    await expect(page.getByText('Final Score')).toBeVisible()
    await expect(page.getByText('Patterns Found')).toBeVisible()
  })

  test('Play Again returns to title screen', async ({ page }) => {
    test.setTimeout(40000)
    await completeGame(page)
    await page.getByTestId('btn-restart').click()
    await expect(page.getByTestId('btn-start')).toBeVisible({ timeout: 2000 })
  })
})

test.describe('IsoBloom — Fail Screen', () => {
  test('exhausting 3 attempts on round 1 shows the Fail screen', async ({ page }) => {
    test.setTimeout(20000)
    await page.goto('/')
    await page.getByTestId('btn-start').click()

    // Submit single-node (wrong count for line2 which needs 2) three times
    for (let i = 0; i < 3; i++) {
      await page.locator(SEED_NODE_A).click({ force: true })
      await page.getByTestId('btn-submit').click()
      if (i < 2) {
        await page.waitForTimeout(300)
        await page.getByTestId('btn-reset').click()
      }
    }

    await expect(page.getByText('Garden Blocked!')).toBeVisible({ timeout: 4000 })
    await expect(page.getByTestId('btn-try-again')).toBeVisible()
  })

  test('Try Again from Fail screen returns to title', async ({ page }) => {
    test.setTimeout(20000)
    await page.goto('/')
    await page.getByTestId('btn-start').click()

    for (let i = 0; i < 3; i++) {
      await page.locator(SEED_NODE_A).click({ force: true })
      await page.getByTestId('btn-submit').click()
      if (i < 2) {
        await page.waitForTimeout(300)
        await page.getByTestId('btn-reset').click()
      }
    }

    await expect(page.getByTestId('btn-try-again')).toBeVisible({ timeout: 4000 })
    await page.getByTestId('btn-try-again').click()
    await expect(page.getByTestId('btn-start')).toBeVisible({ timeout: 2000 })
  })
})

