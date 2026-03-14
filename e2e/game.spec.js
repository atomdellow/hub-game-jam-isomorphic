/**
 * e2e/game.spec.js
 *
 * End-to-end tests for IsoBloom: The Flower Garden
 *
 * Coverage:
 *  1. Title screen renders and Start button works
 *  2. Game HUD appears after starting (round counter + attempt hearts)
 *  3. Nodes are clickable and selection is shown
 *  4. Claimed nodes cannot be re-selected after a round is solved
 *  5. Reset button clears selection
 *  6. Submit with wrong node count shows feedback + decrements heart
 *  7. Correct pattern advances the round counter
 *  8. All 5 rounds on the persistent board reach the End screen
 *  9. Play Again returns to start
 * 10. Exhausting attempts on a round shows the Fail screen
 */

import { test, expect } from '@playwright/test'

// ── UI helpers (round-agnostic adjacent pair) ─────────────────────────────────
// n8 and n9 are adjacent; used for basic interaction tests that don't need to
// complete a round (each test gets a fresh page so no claimed-node conflicts).
const NODE_A = '[data-node-id="n8"]'
const NODE_B = '[data-node-id="n9"]'

// ── Board-completion combos — verified non-overlapping packing ────────────────
//
//   The 19-node board must hold all 5 pattern placements simultaneously.
//   Verified by exhaustive edge-check (Python, 2026-03-13):
//
//   R1 line2    {n0, n1}               2 nodes  degrees [1,1]
//   R2 line3    {n7, n12, n16}         3 nodes  degrees [1,1,2]    path n7-n12-n16
//   R3 triangle {n14, n15, n18}        3 nodes  degrees [2,2,2]    all 3 mutually adjacent
//   R4 fork     hub n5, arms n2,n4,n10 4 nodes  degrees [1,1,1,3]  no arm-arm edges
//   R5 line4    path n3→n8→n13→n17     4 nodes  degrees [1,1,2,2]  straight chain
//
//   Union = 16 nodes.  Remaining unused: {n6, n9, n11}  ✓
//
const R1_LINE2    = ['[data-node-id="n0"]', '[data-node-id="n1"]']
const R2_LINE3    = ['[data-node-id="n7"]', '[data-node-id="n12"]', '[data-node-id="n16"]']
const R3_TRIANGLE = ['[data-node-id="n14"]', '[data-node-id="n15"]', '[data-node-id="n18"]']
const R4_FORK     = ['[data-node-id="n5"]', '[data-node-id="n2"]', '[data-node-id="n4"]', '[data-node-id="n10"]']
const R5_LINE4    = ['[data-node-id="n3"]', '[data-node-id="n8"]', '[data-node-id="n13"]', '[data-node-id="n17"]']

/** All 5 rounds in order for the full-board completion tests */
const ALL_BOARD_ROUNDS = [R1_LINE2, R2_LINE3, R3_TRIANGLE, R4_FORK, R5_LINE4]

/** Click every node in a selector array */
async function clickNodes(page, selectors) {
  for (const sel of selectors) {
    await page.locator(sel).click({ force: true })
  }
}

/** Start the game and complete all 5 rounds using the non-overlapping packing. */
async function completeGame(page) {
  await page.goto('/')
  await page.getByTestId('btn-start').click()
  for (const combo of ALL_BOARD_ROUNDS) {
    await clickNodes(page, combo)
    await page.getByTestId('btn-submit').click()
    await page.waitForTimeout(1600)
  }
  await page.waitForSelector('text=Garden Complete!', { timeout: 4000 })
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
  })
})

test.describe('IsoBloom — Game Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('btn-start').click()
  })

  test('nodes are present on the board', async ({ page }) => {
    await expect(page.locator(NODE_A)).toBeVisible()
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

  test('submit with wrong count shows feedback and decrements attempts', async ({ page }) => {
    // Select only 1 node; round 1 needs 2
    await page.locator(NODE_A).click({ force: true })
    await page.getByTestId('btn-submit').click()
    // Error message includes "select exactly" and "(2 attempts left)"
    await expect(page.getByText(/select exactly/i)).toBeVisible()
    await expect(page.getByText(/2 attempts left/i)).toBeVisible()
  })

  test('Submit button is disabled when nothing is selected', async ({ page }) => {
    await expect(page.getByTestId('btn-submit')).toBeDisabled()
  })

  test('claimed nodes cannot be clicked after a round is solved', async ({ page }) => {
    // Complete round 1 using the non-overlapping R1 combo
    await clickNodes(page, R1_LINE2)
    await page.getByTestId('btn-submit').click()
    await page.waitForTimeout(1600)   // wait for advance animation
    // n0 and n1 should now be claimed (pointer-events: none)
    const n0 = page.locator('[data-node-id="n0"]')
    // The node should exist but have aria attribute indicating claimed
    await expect(n0).toHaveAttribute('aria-label', /placed round 1/i)
  })
})

test.describe('IsoBloom — Round Progression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('btn-start').click()
  })

  test('round 1 (line2): correct selection advances to round 2', async ({ page }) => {
    await clickNodes(page, R1_LINE2)
    await page.getByTestId('btn-submit').click()
    await expect(page.getByText(/Pattern matched|Perfect bloom/i)).toBeVisible()
    await expect(page.getByTestId('round-value')).toContainText('2', { timeout: 3000 })
  })

  test('all 5 rounds complete on the persistent board and reach the End screen', async ({ page }) => {
    test.setTimeout(25000)
    for (const combo of ALL_BOARD_ROUNDS) {
      await clickNodes(page, combo)
      await page.getByTestId('btn-submit').click()
      await page.waitForTimeout(1600)
    }
    await expect(page.getByText('Garden Complete!')).toBeVisible({ timeout: 4000 })
    await expect(page.getByTestId('btn-restart')).toBeVisible()
  })
})

test.describe('IsoBloom — End Screen', () => {
  test('End screen shows final score and rating', async ({ page }) => {
    test.setTimeout(25000)
    await completeGame(page)
    await expect(page.getByText('Final Score')).toBeVisible()
    await expect(page.getByText('Patterns Found')).toBeVisible()
  })

  test('Play Again returns to title screen', async ({ page }) => {
    test.setTimeout(25000)
    await completeGame(page)
    await page.getByTestId('btn-restart').click()
    await expect(page.getByTestId('btn-start')).toBeVisible({ timeout: 2000 })
  })
})

test.describe('IsoBloom — Fail Screen', () => {
  test('exhausting 3 attempts on a round shows the Fail screen', async ({ page }) => {
    test.setTimeout(20000)
    await page.goto('/')
    await page.getByTestId('btn-start').click()

    // Submit a single-node selection 3 times (always wrong for line2 which needs 2).
    // After the 3rd wrong submit isLocked=true, so we skip the Reset click on
    // that iteration and just wait for the fail-transition timer (1400 ms).
    for (let i = 0; i < 3; i++) {
      await page.locator(NODE_A).click({ force: true })
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
      await page.locator(NODE_A).click({ force: true })
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
