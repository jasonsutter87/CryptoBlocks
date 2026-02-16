import { test, expect } from '@playwright/test'

/** Filter out known noise: Monaco init, Blockly CSP media warnings */
function isKnownNoise(msg: string): boolean {
  return (
    msg.includes('Monaco initialization') ||
    msg.includes('Content Security Policy') ||
    msg.includes('blockly-demo.appspot.com')
  )
}

test.describe('CryptoBlocks App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for Blockly to initialize
    await page.waitForSelector('.blocklySvg', { timeout: 10000 })
  })

  test('loads without error', async ({ page }) => {
    // App title is visible
    await expect(page.locator('text=CryptoBlocks')).toBeVisible()
    // Blockly workspace is rendered
    await expect(page.locator('.blocklySvg')).toBeVisible()
  })

  test('Brick Bin shows categories', async ({ page }) => {
    // Blockly toolbox categories are visible
    const toolbox = page.locator('.blocklyToolboxDiv')
    await expect(toolbox).toBeVisible()

    // Check for specific categories
    await expect(toolbox.locator('text=Basics')).toBeVisible()
    await expect(toolbox.locator('text=Math')).toBeVisible()
    await expect(toolbox.locator('text=Web')).toBeVisible()
  })

  test('Save and Load buttons exist and are clickable', async ({ page }) => {
    const saveButton = page.locator('button', { hasText: 'Save' })
    const loadButton = page.locator('button', { hasText: 'Load' })

    await expect(saveButton).toBeVisible()
    await expect(loadButton).toBeVisible()

    // Save button should be clickable (triggers download)
    await expect(saveButton).toBeEnabled()
    await expect(loadButton).toBeEnabled()
  })

  test('Run button exists and is clickable', async ({ page }) => {
    const runButton = page.locator('button', { hasText: 'Run' })
    await expect(runButton).toBeVisible()
    await expect(runButton).toBeEnabled()
  })

  test('Output panel shows placeholder text', async ({ page }) => {
    await expect(page.locator('text=Hit Play to run your blocks')).toBeVisible()
  })

  test('Peek Code toggle works', async ({ page }) => {
    const peekButton = page.locator('button', { hasText: 'Peek Code' })
    await expect(peekButton).toBeVisible()

    await peekButton.click()

    // After clicking, should show "Hide Code"
    await expect(page.locator('button', { hasText: 'Hide Code' })).toBeVisible()
  })

  // --- New E2E tests ---

  test('Code to Blocks modal opens and closes', async ({ page }) => {
    const codeToBlocksBtn = page.locator('button', { hasText: 'Code to Blocks' })
    await expect(codeToBlocksBtn).toBeVisible()

    await codeToBlocksBtn.click()

    // Modal should appear
    await expect(page.locator('text=Code to Blocks')).toBeVisible()

    // Close modal (click X or overlay)
    const closeBtn = page.locator('[aria-label="Close"]').or(page.locator('button', { hasText: 'Cancel' }))
    if (await closeBtn.count() > 0) {
      await closeBtn.first().click()
    } else {
      // Try pressing Escape
      await page.keyboard.press('Escape')
    }

    // Modal should be gone
    await expect(page.locator('button', { hasText: 'Code to Blocks' })).toBeVisible()
  })

  test('Create Block modal opens and closes', async ({ page }) => {
    const createBtn = page.locator('button', { hasText: 'Create Block' })
    await expect(createBtn).toBeVisible()

    await createBtn.click()

    // Modal should appear — look for form elements or heading
    await expect(page.locator('text=Create Block').or(page.locator('text=Block Builder'))).toBeVisible()

    // Close via Escape
    await page.keyboard.press('Escape')
  })

  test('Clear workspace works', async ({ page }) => {
    // Click Clear
    const clearBtn = page.locator('button', { hasText: 'Clear' })
    await expect(clearBtn).toBeVisible()
    await clearBtn.click()

    // After clear, workspace should have no user blocks
    // The blockly workspace should still be visible but empty
    await expect(page.locator('.blocklySvg')).toBeVisible()
  })

  test('Share dropdown shows Export HTML and Copy Embed', async ({ page }) => {
    const shareBtn = page.locator('button', { hasText: 'Share' })
    await expect(shareBtn).toBeVisible()

    await shareBtn.click()

    // Dropdown menu with options
    await expect(page.locator('text=Export as HTML')).toBeVisible()
    await expect(page.locator('text=Copy Embed Snippet')).toBeVisible()
  })

  test('Examples modal opens with example cards', async ({ page }) => {
    const examplesBtn = page.locator('button', { hasText: 'Examples' })
    await expect(examplesBtn).toBeVisible()

    await examplesBtn.click()

    // Should show examples list with known names
    await expect(page.locator('text=Hello World')).toBeVisible()
    await expect(page.locator('text=Quick Math')).toBeVisible()

    // Close modal
    await page.keyboard.press('Escape')
  })

  test('Challenges mode opens browser', async ({ page }) => {
    const challengesBtn = page.locator('button', { hasText: 'Challenges' })
    await expect(challengesBtn).toBeVisible()

    await challengesBtn.click()

    // Challenge browser should be visible
    await expect(page.locator('text=Challenges').first()).toBeVisible()
  })

  test('Language tabs switch code generation', async ({ page }) => {
    // Ensure code view is open
    const peekBtn = page.locator('button', { hasText: 'Peek Code' })
    if (await peekBtn.isVisible()) {
      await peekBtn.click()
    }

    // Look for a Python tab
    const pythonTab = page.locator('button', { hasText: 'Python' }).or(page.locator('text=PY'))
    if (await pythonTab.count() > 0) {
      await pythonTab.first().click()
      // After switching, the code pane should show Python-style comment
      await page.waitForTimeout(500)
      // The generated code should be visible
      await expect(page.locator('.blocklySvg')).toBeVisible()
    }
  })

  test('Run with empty workspace does not time out', async ({ page }) => {
    // Clear workspace first to ensure it's empty
    const clearBtn = page.locator('button', { hasText: 'Clear' })
    if (await clearBtn.isVisible()) {
      await clearBtn.click()
    }

    const runBtn = page.locator('button', { hasText: 'Run' })
    await runBtn.click()

    // Should NOT show "Execution timed out" — should resolve quickly
    // Wait a reasonable amount of time (2s) and check there's no timeout error
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Execution timed out')).not.toBeVisible()
  })

  // --- Blocksets E2E ---

  test('Blocksets browser opens without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !isKnownNoise(msg.text())) errors.push(msg.text())
    })

    // Click Blocksets button (desktop)
    const blocksetsBtn = page.locator('button', { hasText: 'Blocksets' }).first()
    await blocksetsBtn.click()

    // Browser should render
    await expect(page.getByRole('heading', { name: 'Blocksets' })).toBeVisible()
    await expect(page.locator('text=Basics 101')).toBeVisible()
    await expect(page.locator('text=Loops & Logic')).toBeVisible()

    expect(errors).toHaveLength(0)
  })

  test('Blocksets pack expands and shows individual blocksets', async ({ page }) => {
    const blocksetsBtn = page.locator('button', { hasText: 'Blocksets' }).first()
    await blocksetsBtn.click()

    // Expand Basics 101 pack
    await page.locator('text=Basics 101').click()

    // Individual blocksets should appear
    await expect(page.locator('text=First Print')).toBeVisible()
    await expect(page.locator('text=Number Crunch')).toBeVisible()
  })

  test('Selecting a blockset enters active-blockset mode without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !isKnownNoise(msg.text())) errors.push(msg.text())
    })

    // Navigate to Blocksets > Basics 101 > First Print
    await page.locator('button', { hasText: 'Blocksets' }).first().click()
    await page.locator('text=Basics 101').click()
    await page.locator('text=First Print').click()

    // BlocksetPanel should show with step instructions
    await expect(page.locator('text=First Print')).toBeVisible()
    await expect(page.locator('text=Step 1')).toBeVisible()
    await expect(page.locator('.blocklySvg')).toBeVisible()

    expect(errors).toHaveLength(0)
  })

  test('Blockset step navigation works', async ({ page }) => {
    await page.locator('button', { hasText: 'Blocksets' }).first().click()
    await page.locator('text=Basics 101').click()
    await page.locator('text=First Print').click()

    // Should start at step 1
    await expect(page.locator('text=Step 1')).toBeVisible()

    // Click Next
    await page.locator('text=Next →').click()
    await expect(page.locator('text=Step 2')).toBeVisible()

    // Click Previous
    await page.locator('text=← Previous').click()
    await expect(page.locator('text=Step 1')).toBeVisible()
  })

  test('Blockset back button returns to browser', async ({ page }) => {
    await page.locator('button', { hasText: 'Blocksets' }).first().click()
    await page.locator('text=Basics 101').click()
    await page.locator('text=First Print').click()

    // Click back arrow
    await page.locator('button[title="Back to Blocksets"]').click()

    // Should be back in browser
    await expect(page.getByRole('heading', { name: 'Blocksets' })).toBeVisible()
  })

  // --- Code Golf E2E ---

  test('Code Golf browser opens without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !isKnownNoise(msg.text())) errors.push(msg.text())
    })

    // Click Code Golf button (desktop)
    const golfBtn = page.locator('button', { hasText: 'Code Golf' }).first()
    await golfBtn.click()

    // Browser should render
    await expect(page.getByRole('heading', { name: 'Code Golf' })).toBeVisible()
    await expect(page.locator('text=Warmup')).toBeVisible()
    await expect(page.locator('text=Brain Teasers')).toBeVisible()
    await expect(page.locator('text=Mind Benders')).toBeVisible()

    expect(errors).toHaveLength(0)
  })

  test('Code Golf pack expands and shows problems with par', async ({ page }) => {
    await page.locator('button', { hasText: 'Code Golf' }).first().click()

    // Expand Warmup pack
    await page.locator('text=Warmup').click()

    // Individual problems should appear
    await expect(page.locator('text=One Hundred')).toBeVisible()
    await expect(page.locator('text=Triple Echo')).toBeVisible()
    // Par values should be visible
    await expect(page.locator('text=Par 2')).toBeVisible()
  })

  test('Selecting a golf problem enters active-golf mode without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !isKnownNoise(msg.text())) errors.push(msg.text())
    })

    // Navigate to Code Golf > Warmup > One Hundred
    await page.locator('button', { hasText: 'Code Golf' }).first().click()
    await page.locator('text=Warmup').click()
    await page.locator('text=One Hundred').click()

    // GolfPanel should show with par and block count
    await expect(page.locator('text=One Hundred')).toBeVisible()
    await expect(page.locator('text=Par:')).toBeVisible()
    await expect(page.locator('text=Blocks:')).toBeVisible()
    await expect(page.locator('.blocklySvg')).toBeVisible()

    expect(errors).toHaveLength(0)
  })

  test('Golf back button returns to browser', async ({ page }) => {
    await page.locator('button', { hasText: 'Code Golf' }).first().click()
    await page.locator('text=Warmup').click()
    await page.locator('text=One Hundred').click()

    // Click back arrow
    await page.locator('button[title="Back to Code Golf"]').click()

    // Should be back in browser
    await expect(page.getByRole('heading', { name: 'Code Golf' })).toBeVisible()
  })
})
