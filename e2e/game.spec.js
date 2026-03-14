/**
 * e2e/game.spec.js
 *
 * End-to-end tests for IsoBloom: The Flower Garden â€” v1.4 open board
 *
 * Coverage:
 *  1.  Title screen renders and Start button works
 *  2.  Game transitions to HUD after Start
 *  3.  All 19 nodes are present and clickable from round 1
 *  4.  Reset button clears selection
 *  5.  Submit with wrong count shows feedback and decrements a heart
 *  6.  Submit button disabled when nothing selected
 *  7.  Correct pattern (round 1 line2) advances round counter
 *  8.  Claimed nodes show placed-round label and cannot be re-clicked
 *  9.  All 5 rounds complete on the persistent board â†’ End screen
 * 10.  End screen shows final score + rating, Play Again works
 * 11.  Exhausting 3 attempts shows Fail screen
 * 12.  Try Again from Fail screen returns to title
 */

import { test, expect } from '@playwright/test'

// â”€â”€ Canonical placements (Python-verified, no overlaps) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//
//  R1  line2     [n0, n1]                degrees [1,1]
//  R2  triangle  [n4, n5, n9]            degrees [2,2,2]
//  R3  line3     [n7, n12, n16]          degrees [1,1,2]
//  R4  fork      [n14, n10, n13, n18]    degrees [1,1,1,3]  hub=n14
//  R5  line4     [n2, n6, n11, n15]      degrees [1,1,2,2]
//  Unclaimed: n3, n8, n17

const R1 = ['[data-node-id="n0"]',  '[data-node-id="n1"]']
const R2 = ['[data-node-id="n4"]',  '[data-node-id="n5"]',  '[data-node-id="n9"]']
const R3 = ['[data-node-id="n7"]',  '[data-node-id="n12"]', '[data-node-id="n16"]']
const R4 = ['[data-node-id="n14"]', '[data-node-id="n10"]', '[data-node-id="n13"]', '[data-node-id="n18"]']
const R5 = ['[data-node-id="n2"]',  '[data-node-id="n6"]',  '[data-node-id="n11"]', '[data-node-id="n15"]']

const ALL_ROUNDS = [R1, R2, R3, R4, R5]

// Free nodes (never claimed in canonical packing â€” safe for interaction tests)
const FREE_A = '[data-node-id="n8"]'
const FREE_B = '[data-node-id="n3"]'

/** Click every node in a selector array */
async function clickNodes(page, selectors) {
  for (const sel of selectors) {
    await page.locator(sel).click({ force: true })
  }
}

/** Play through N rounds using canonical combos, waiting for round transition. */
async function playRounds(page, count) {
  for (let i = 0; i < count; i++) {
    await clickNodes(page, ALL_ROUNDS[i])
    await page.getByTestId('btn-submit').click()
    await page.waitForTimeout(1600)
  }
}

/** Start and complete all 5 rounds â†’ reach End screen */
async function completeGame(page) {
  await page.goto('/')
  await page.getByTestId('btn-start').click()
  await playRounds(page, 5)
  await page.waitForSelector('text=Garden Complete!', { timeout: 5000 })
}

// â”€â”€ Tests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

test.describe('IsoBloom â€” Start Screen', () => {
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

test.describe('IsoBloom â€” Game Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('btn-start').click()
  })

  test('all nodes are present on the board from round 1', async ({ page }) => {
    // Spot-check a few spread-out nodes
    for (const id of ['n0', 'n4', 'n9', 'n14', 'n18']) {
      await expect(page.locator(`[data-node-id="${id}"]`)).toBeVisible()
    }
  })

  test('clicking a node selects it', async ({ page }) => {
    await page.locator(FREE_A).click({ force: true })
    await expect(page.getByText(/1 node selected/i)).toBeVisible()
  })

  test('clicking two nodes shows correct selection count', async ({ page }) => {
    await page.locator(FREE_A).click({ force: true })
    await page.locator(FREE_B).click({ force: true })
    await expect(page.getByText(/2 nodes selected/i)).toBeVisible()
  })

  test('Reset button clears selection', async ({ page }) => {
    await page.locator(FREE_A).click({ force: true })
    await page.locator(FREE_B).click({ force: true })
    await page.getByTestId('btn-reset').click()
    await expect(page.getByText(/0 nodes selected/i)).toBeVisible()
  })

  test('submit with wrong count shows feedback and decrements heart', async ({ page }) => {
    // Round 1 is line2 (needs 2); submit just 1 node
    await page.locator(FREE_A).click({ force: true })
    await page.getByTestId('btn-submit').click()
    await expect(page.getByText(/select exactly/i)).toBeVisible()
    await expect(page.getByText(/2 attempts left/i)).toBeVisible()
  })

  test('Submit button is disabled when nothing is selected', async ({ page }) => {
    await expect(page.getByTestId('btn-submit')).toBeDisabled()
  })
})

test.describe('IsoBloom â€” Round Progression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('btn-start').click()
  })

  test('round 1 (line2 n0+n1): correct selection advances to round 2', async ({ page }) => {
    await clickNodes(page, R1)
    await page.getByTestId('btn-submit').click()
    await expect(page.getByText(/Pattern matched|Perfect bloom/i)).toBeVisible()
    await expect(page.getByTestId('round-value')).toContainText('2', { timeout: 3000 })
  })

  test('claimed nodes show placed-round label after a win', async ({ page }) => {
    test.setTimeout(10000)
    await clickNodes(page, R1)
    await page.getByTestId('btn-submit').click()
    await page.waitForTimeout(1600)
    await expect(page.locator('[data-node-id="n0"]')).toHaveAttribute('aria-label', /placed round 1/i)
    await expect(page.locator('[data-node-id="n1"]')).toHaveAttribute('aria-label', /placed round 1/i)
  })

  test('all 5 rounds complete on the persistent board â†’ End screen', async ({ page }) => {
    test.setTimeout(25000)
    await playRounds(page, 5)
    await expect(page.getByText('Garden Complete!')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('btn-restart')).toBeVisible()
  })
})

test.describe('IsoBloom â€” End Screen', () => {
  test('shows final score and rating', async ({ page }) => {
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

test.describe('IsoBloom â€” Fail Screen', () => {
  test('exhausting 3 attempts shows the Fail screen', async ({ page }) => {
    test.setTimeout(20000)
    await page.goto('/')
    await page.getByTestId('btn-start').click()
    // Submit 1 node 3 times (wrong count for line2 which needs 2)
    for (let i = 0; i < 3; i++) {
      await page.locator(FREE_A).click({ force: true })
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
      await page.locator(FREE_A).click({ force: true })
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
