/**
 * e2e/game.spec.js
 *
 * End-to-end tests for IsoBloom: The Flower Garden
 *
 * Coverage:
 *  1. Title screen renders and Start button works
 *  2. Game HUD appears after starting
 *  3. Nodes are clickable and selection is shown
 *  4. Reset button clears selection
 *  5. Submit with wrong node count shows feedback
 *  6. Correct pattern (line2 = any 2 adjacent nodes) advances the round
 *  7. All 6 rounds can be completed to reach the End screen
 *  8. Play Again returns to start
 */

import { test, expect } from '@playwright/test'

// ── Round 1 helpers ──────────────────────────────────────────────────────────
// Line-2 pattern: exactly 2 adjacent nodes.
// n8 and n9 are always adjacent on the board (horizontal centre pair).
const NODE_A = '[data-node-id="n8"]'
const NODE_B = '[data-node-id="n9"]'

// Round-2 line3: n7, n8, n9 (three in a horizontal line)
const LINE3 = ['[data-node-id="n7"]', '[data-node-id="n8"]', '[data-node-id="n9"]']

// Round-3 triangle: n8, n9, n13 — they form a triangle (n8-n9, n9-n13, n8-n13)
const TRIANGLE = ['[data-node-id="n8"]', '[data-node-id="n9"]', '[data-node-id="n13"]']

// Round-4 fork (Y): n9 as hub, arms = n5, n8, n14.
// Edge check: n9-n5 ✓, n9-n8 ✓, n9-n14 ✓; n5-n8 ✗, n5-n14 ✗, n8-n14 ✗ → 3 edges, degrees [1,1,1,3] ✓
const FORK = [
  '[data-node-id="n9"]',   // hub (degree 3 in selection)
  '[data-node-id="n5"]',
  '[data-node-id="n8"]',
  '[data-node-id="n14"]',
]

// Round-5 line4: n7, n8, n9, n10 — four in a horizontal line
const LINE4 = [
  '[data-node-id="n7"]',
  '[data-node-id="n8"]',
  '[data-node-id="n9"]',
  '[data-node-id="n10"]',
]

// Round-6 kite: triangle n8/n9/n13 + pendant n7 from n8.
// Edges: n7-n8, n8-n9, n8-n13, n9-n13; n7 connects only to n8 → degrees [1,2,2,3] ✓
const KITE = [
  '[data-node-id="n8"]',
  '[data-node-id="n9"]',
  '[data-node-id="n13"]',
  '[data-node-id="n7"]',
]

// Round-7 diamond (K₄-e): n4 + n8 + n9 + n13.
// Edges: n4-n8, n4-n9, n8-n9, n8-n13, n9-n13 (5 edges) → degrees [2,2,3,3] ✓
const DIAMOND = [
  '[data-node-id="n4"]',
  '[data-node-id="n8"]',
  '[data-node-id="n9"]',
  '[data-node-id="n13"]',
]

// Round-8 line5 (P5): n7-n8-n9-n10-n11 horizontal path.
// No diagonals between any non-adjacent pair → degrees [1,1,2,2,2] ✓
const LINE5 = [
  '[data-node-id="n7"]',
  '[data-node-id="n8"]',
  '[data-node-id="n9"]',
  '[data-node-id="n10"]',
  '[data-node-id="n11"]',
]

// Round-9 caterpillar: hub n9 (arms n5, n8, n14) + pendant n12 from n8.
// n5-n8✗ n5-n14✗ n8-n14✗ n12-n9✗ n12-n5✗ n12-n14✗ → 4 edges, degrees [1,1,1,2,3] ✓
const CATERPILLAR = [
  '[data-node-id="n9"]',
  '[data-node-id="n5"]',
  '[data-node-id="n8"]',
  '[data-node-id="n14"]',
  '[data-node-id="n12"]',
]

// Round-10 tadpole: triangle n8/n9/n13 + chain n9-n10-n11.
// n8-n10✗ n8-n11✗ n13-n10✗ n13-n11✗ n9-n11✗ → 5 edges, degrees [1,2,2,2,3] ✓
const TADPOLE = [
  '[data-node-id="n8"]',
  '[data-node-id="n9"]',
  '[data-node-id="n13"]',
  '[data-node-id="n10"]',
  '[data-node-id="n11"]',
]

// Round-11 bull: triangle n8/n9/n13 + pendant n7 from n8, pendant n10 from n9.
// n7-n9✗ n7-n13✗ n7-n10✗ n13-n10✗ → 5 edges, degrees [1,1,2,3,3] ✓
const BULL = [
  '[data-node-id="n7"]',
  '[data-node-id="n8"]',
  '[data-node-id="n9"]',
  '[data-node-id="n13"]',
  '[data-node-id="n10"]',
]

// Round-12 doubleCat: hub n9 (arms n5, n8, n14) + n1 from n5, n12 from n8.
// n1-n8✗ n1-n9✗ n1-n12✗ n1-n14✗ n12-n9✗ n12-n5✗ n12-n14✗ → 5 edges, degrees [1,1,1,2,2,3] ✓
const DOUBLE_CAT = [
  '[data-node-id="n1"]',
  '[data-node-id="n5"]',
  '[data-node-id="n8"]',
  '[data-node-id="n9"]',
  '[data-node-id="n12"]',
  '[data-node-id="n14"]',
]

const ALL_ROUNDS = [LINE3, TRIANGLE, FORK, LINE4, KITE, DIAMOND, LINE5, CATERPILLAR, TADPOLE, BULL, DOUBLE_CAT]

/** Click every node in a selector array */
async function clickNodes(page, selectors) {
  for (const sel of selectors) {
    await page.locator(sel).click({ force: true })
  }
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
    // HUD should appear
    await expect(page.getByText('Round')).toBeVisible()
    await expect(page.getByText('Score')).toBeVisible()
  })
})

test.describe('IsoBloom — Game Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('btn-start').click()
  })

  test('nodes are present on the board', async ({ page }) => {
    const node = page.locator(NODE_A)
    await expect(node).toBeVisible()
  })

  test('clicking a node selects it (selection count updates)', async ({ page }) => {
    await page.locator(NODE_A).click({ force: true })
    await expect(page.getByText(/1 node selected/i)).toBeVisible()
  })

  test('clicking two nodes shows correct selection count', async ({ page }) => {
    await page.locator(NODE_A).click({ force: true })
    await page.locator(NODE_B).click({ force: true })
    await expect(page.getByText(/2 nodes selected/i)).toBeVisible()
  })

  test('Reset button clears selection', async ({ page }) => {
    await page.locator(NODE_A).click({ force: true })
    await page.locator(NODE_B).click({ force: true })
    await page.getByTestId('btn-reset').click()
    await expect(page.getByText(/0 nodes selected/i)).toBeVisible()
  })

  test('submit with wrong count shows feedback', async ({ page }) => {
    // Select only 1 node; round 1 needs 2
    await page.locator(NODE_A).click({ force: true })
    await page.getByTestId('btn-submit').click()
    await expect(page.getByText(/select exactly/i)).toBeVisible()
  })

  test('Submit button is disabled when nothing is selected', async ({ page }) => {
    await expect(page.getByTestId('btn-submit')).toBeDisabled()
  })
})

test.describe('IsoBloom — Round Progression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('btn-start').click()
  })

  test('round 1 (line2): correct selection advances to round 2', async ({ page }) => {
    await page.locator(NODE_A).click({ force: true })
    await page.locator(NODE_B).click({ force: true })
    await page.getByTestId('btn-submit').click()
    await expect(page.getByText(/Pattern matched|Perfect bloom/i)).toBeVisible()
    // After delay, round should advance — use the HUD round counter (data-testid='round-value')
    await expect(page.getByTestId('round-value')).toContainText('2', { timeout: 3000 })
  })

  test('all 12 rounds complete and reach the End screen', async ({ page }) => {
    test.setTimeout(40000)
    // Round 1 — line2
    await clickNodes(page, [NODE_A, NODE_B])
    await page.getByTestId('btn-submit').click()
    await page.waitForTimeout(1600)

    // Rounds 2-6
    for (const roundNodes of ALL_ROUNDS) {
      await clickNodes(page, roundNodes)
      await page.getByTestId('btn-submit').click()
      await page.waitForTimeout(1600)
    }

    // End screen
    await expect(page.getByText('Garden Complete!')).toBeVisible({ timeout: 4000 })
    await expect(page.getByTestId('btn-restart')).toBeVisible()
  })
})

test.describe('IsoBloom — End Screen', () => {
  async function completeGame(page) {
    await page.goto('/')
    await page.getByTestId('btn-start').click()

    await clickNodes(page, [NODE_A, NODE_B])
    await page.getByTestId('btn-submit').click()
    await page.waitForTimeout(1600)

    for (const roundNodes of ALL_ROUNDS) {
      await clickNodes(page, roundNodes)
      await page.getByTestId('btn-submit').click()
      await page.waitForTimeout(1600)
    }
    await page.waitForSelector('text=Garden Complete!', { timeout: 4000 })
  }

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
