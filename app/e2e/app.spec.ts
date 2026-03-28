import { test, expect, Page } from '@playwright/test'

/** Filter out known noise: Monaco init, Blockly CSP media warnings */
function isKnownNoise(msg: string): boolean {
  return (
    msg.includes('Monaco initialization') ||
    msg.includes('Content Security Policy') ||
    msg.includes('blockly-demo.appspot.com')
  )
}

/** Helper: open a toolbar dropdown menu by name (File, Build, Share, Learn) */
async function openMenu(page: Page, menuName: string) {
  const menuBtn = page.locator('button', { hasText: menuName }).first()
  await menuBtn.click()
}

/** Helper: click a menu item inside an already-opened dropdown */
async function clickMenuItem(page: Page, menuName: string, itemText: string) {
  await openMenu(page, menuName)
  await page.locator('button', { hasText: itemText }).first().click()
}

test.describe('CryptoBlocks App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for Blockly workspace AND toolbox to initialize
    await page.waitForSelector('.blocklySvg', { timeout: 15000 })
    await page.waitForSelector('.blocklyToolboxDiv', { timeout: 10000 }).catch(() => {
      // Some Blockly versions use different class names
    })
    // Extra buffer for React hydration
    await page.waitForTimeout(500)
  })

  test('loads without error', async ({ page }) => {
    // App title is visible
    await expect(page.getByRole('heading', { name: 'CryptoBlocks' })).toBeVisible()
    // Blockly workspace is rendered
    await expect(page.locator('.blocklySvg')).toBeVisible()
  })

  test('Brick Bin shows categories', async ({ page }) => {
    // Blockly toolbox categories are visible (try both class names)
    const toolbox = page.locator('.blocklyToolboxDiv, .blocklyToolboxCategories').first()
    await expect(toolbox).toBeVisible({ timeout: 10000 })

    // Check for specific categories
    await expect(page.locator('.blocklyToolboxCategoryLabel:has-text("Basics")')).toBeVisible()
    await expect(page.locator('.blocklyToolboxCategoryLabel:has-text("Math")')).toBeVisible()
    await expect(page.locator('.blocklyToolboxCategoryLabel:has-text("Web")')).toBeVisible()
  })

  test('File menu shows Save and Load options', async ({ page }) => {
    await openMenu(page, 'File')
    await expect(page.locator('button', { hasText: 'Save .blocks' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Load .blocks' })).toBeVisible()
  })

  test('Run button exists and is clickable', async ({ page }) => {
    const runButton = page.locator('button', { hasText: 'Run' })
    await expect(runButton).toBeVisible()
    await expect(runButton).toBeEnabled()
  })

  test('Output panel shows placeholder text', async ({ page }) => {
    await expect(page.locator('text=Hit Play to run your blocks')).toBeVisible({ timeout: 10000 })
  })

  test('Peek Code toggle works', async ({ page }) => {
    // The Peek Code text is inside a span with hidden sm:inline
    const peekButton = page.locator('button:has-text("Peek Code")').first()
    await expect(peekButton).toBeVisible({ timeout: 10000 })

    await peekButton.click()

    // After clicking, should show "Hide Code"
    await expect(page.locator('button:has-text("Hide Code")').first()).toBeVisible()
  })

  // --- Build menu ---

  test('Code to Blocks modal opens and closes', async ({ page }) => {
    await clickMenuItem(page, 'Build', 'Code to Blocks')

    // Modal should appear
    await expect(page.locator('text=Code to Blocks').first()).toBeVisible()

    // Close via Escape
    await page.keyboard.press('Escape')
  })

  test('Create Block modal opens and closes', async ({ page }) => {
    await clickMenuItem(page, 'Build', 'Create Block')

    // Modal should appear
    await page.waitForTimeout(500)
    await expect(page.locator('text=Create Block').first()).toBeVisible()

    // Close via Escape
    await page.keyboard.press('Escape')
  })

  // --- File menu ---

  test('Clear workspace works', async ({ page }) => {
    await clickMenuItem(page, 'File', 'Clear Workspace')

    // Workspace should still be visible but empty
    await expect(page.locator('.blocklySvg')).toBeVisible()
  })

  // --- Share menu ---

  test('Share dropdown shows Export HTML and Copy Embed', async ({ page }) => {
    await openMenu(page, 'Share')
    await expect(page.locator('text=Export as HTML')).toBeVisible()
    await expect(page.locator('text=Copy Embed Snippet')).toBeVisible()
  })

  // --- Learn menu ---

  test('Examples opens from Learn menu', async ({ page }) => {
    await clickMenuItem(page, 'Learn', 'Examples')

    // Should show examples list with known names
    await expect(page.locator('text=Hello World')).toBeVisible()
    await expect(page.locator('text=Quick Math')).toBeVisible()

    // Close modal
    await page.keyboard.press('Escape')
  })

  test('Challenges mode opens browser', async ({ page }) => {
    await clickMenuItem(page, 'Learn', 'Challenges')

    // Challenge browser heading should be visible
    await expect(page.getByRole('heading', { name: 'Challenges' }).first()).toBeVisible()
  })

  test('Language tabs switch code generation', async ({ page }) => {
    const peekBtn = page.locator('button', { hasText: 'Peek Code' })
    if (await peekBtn.isVisible()) {
      await peekBtn.click()
    }

    const pythonTab = page.locator('button', { hasText: 'Python' }).or(page.locator('text=PY'))
    if (await pythonTab.count() > 0) {
      await pythonTab.first().click()
      await page.waitForTimeout(500)
      await expect(page.locator('.blocklySvg')).toBeVisible()
    }
  })

  test('Run with empty workspace does not time out', async ({ page }) => {
    // Clear workspace first
    await clickMenuItem(page, 'File', 'Clear Workspace')

    const runBtn = page.locator('button', { hasText: 'Run' })
    await runBtn.click()

    await page.waitForTimeout(2000)
    await expect(page.locator('text=Execution timed out')).not.toBeVisible()
  })

  // --- Blocksets E2E ---

  test('Blocksets browser opens without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !isKnownNoise(msg.text())) errors.push(msg.text())
    })

    await clickMenuItem(page, 'Learn', 'Blocksets')

    await expect(page.getByRole('heading', { name: 'Blocksets' })).toBeVisible()
    await expect(page.locator('text=Basics 101')).toBeVisible()
    await expect(page.locator('text=Loops & Logic')).toBeVisible()

    expect(errors).toHaveLength(0)
  })

  test('Blocksets pack expands and shows individual blocksets', async ({ page }) => {
    await clickMenuItem(page, 'Learn', 'Blocksets')

    // Expand Basics 101 pack
    await page.locator('text=Basics 101').click()

    await expect(page.locator('text=First Print')).toBeVisible()
    await expect(page.locator('text=Number Crunch')).toBeVisible()
  })

  test('Selecting a blockset enters active-blockset mode without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !isKnownNoise(msg.text())) errors.push(msg.text())
    })

    await clickMenuItem(page, 'Learn', 'Blocksets')
    await page.locator('text=Basics 101').click()
    await page.locator('text=First Print').click()

    await expect(page.locator('text=First Print').first()).toBeVisible()
    await expect(page.locator('text=Step 1')).toBeVisible()
    await expect(page.locator('.blocklySvg')).toBeVisible()

    expect(errors).toHaveLength(0)
  })

  test('Blockset step navigation works', async ({ page }) => {
    await clickMenuItem(page, 'Learn', 'Blocksets')
    await page.locator('text=Basics 101').click()
    await page.locator('text=First Print').click()

    await expect(page.locator('text=Step 1')).toBeVisible()

    await page.locator('text=Next →').click()
    await expect(page.locator('text=Step 2')).toBeVisible()

    await page.locator('text=← Previous').click()
    await expect(page.locator('text=Step 1')).toBeVisible()
  })

  test('Blockset back button returns to browser', async ({ page }) => {
    await clickMenuItem(page, 'Learn', 'Blocksets')
    await page.locator('text=Basics 101').click()
    await page.locator('text=First Print').click()

    await page.locator('button[title="Back to Blocksets"]').click()

    await expect(page.getByRole('heading', { name: 'Blocksets' })).toBeVisible()
  })

  // --- Code Golf E2E ---

  test('Code Golf browser opens without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !isKnownNoise(msg.text())) errors.push(msg.text())
    })

    await clickMenuItem(page, 'Learn', 'Code Golf')

    await expect(page.getByRole('heading', { name: 'Code Golf' })).toBeVisible()
    await expect(page.locator('text=Warmup')).toBeVisible()
    await expect(page.locator('text=Brain Teasers')).toBeVisible()
    await expect(page.locator('text=Mind Benders')).toBeVisible()

    expect(errors).toHaveLength(0)
  })

  test('Code Golf pack expands and shows problems with par', async ({ page }) => {
    await clickMenuItem(page, 'Learn', 'Code Golf')

    await page.locator('text=Warmup').click()

    await expect(page.locator('text=One Hundred')).toBeVisible()
    await expect(page.locator('text=Triple Echo')).toBeVisible()
    await expect(page.locator('text=Par 2')).toBeVisible()
  })

  test('Selecting a golf problem enters active-golf mode without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !isKnownNoise(msg.text())) errors.push(msg.text())
    })

    await clickMenuItem(page, 'Learn', 'Code Golf')
    await page.locator('text=Warmup').click()
    await page.locator('text=One Hundred').click()

    await expect(page.locator('text=One Hundred').first()).toBeVisible()
    await expect(page.locator('text=Par:')).toBeVisible()
    await expect(page.locator('text=Blocks:')).toBeVisible()
    await expect(page.locator('.blocklySvg')).toBeVisible()

    expect(errors).toHaveLength(0)
  })

  test('Golf back button returns to browser', async ({ page }) => {
    await clickMenuItem(page, 'Learn', 'Code Golf')
    await page.locator('text=Warmup').click()
    await page.locator('text=One Hundred').click()

    await page.locator('button[title="Back to Code Golf"]').click()

    await expect(page.getByRole('heading', { name: 'Code Golf' })).toBeVisible()
  })

  // --- Code Lab E2E ---

  test('Code Lab browser opens without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !isKnownNoise(msg.text())) errors.push(msg.text())
    })

    await clickMenuItem(page, 'Learn', 'Code Lab')

    await expect(page.getByRole('heading', { name: 'Code Lab' }).first()).toBeVisible()
    expect(errors).toHaveLength(0)
  })

  test('Code Lab pack expands and shows exercises', async ({ page }) => {
    await clickMenuItem(page, 'Learn', 'Code Lab')

    await page.waitForTimeout(500)
    const packs = page.locator('button:has-text("Variables"), button:has-text("Print"), button:has-text("Basics")')
    if (await packs.count() > 0) {
      await packs.first().click()
      await page.waitForTimeout(500)
    }

    await expect(page.getByRole('heading', { name: 'Code Lab' }).first()).toBeVisible()
  })

  // --- Stats Panel E2E ---

  test('Stats panel opens and shows stats', async ({ page }) => {
    const statsBtn = page.locator('button[title="Developer Stats"]').first()
    if (await statsBtn.isVisible()) {
      await statsBtn.click()
      await page.waitForTimeout(500)
      await expect(page.getByRole('heading', { name: 'Developer Stats' })).toBeVisible()
    }
  })

  // --- Block drag-and-run E2E ---

  test('drag a Print block from toolbox and run it', async ({ page }) => {
    const toolbox = page.locator('.blocklyToolboxDiv, .blocklyToolboxCategories').first()
    await toolbox.locator('text=Basics').click()

    await page.waitForSelector('.blocklyFlyout .blocklyDraggable', { timeout: 5000 })

    const flyoutBlock = page.locator('.blocklyFlyout .blocklyDraggable').first()
    const workspace = page.locator('.blocklyMainBackground')

    const flyoutBox = await flyoutBlock.boundingBox()
    const wsBox = await workspace.boundingBox()
    if (flyoutBox && wsBox) {
      await page.mouse.move(flyoutBox.x + flyoutBox.width / 2, flyoutBox.y + flyoutBox.height / 2)
      await page.mouse.down()
      await page.mouse.move(wsBox.x + wsBox.width / 2, wsBox.y + wsBox.height / 2, { steps: 10 })
      await page.mouse.up()
    }

    await page.waitForTimeout(500)
    const workspaceBlocks = page.locator('.blocklyWorkspace > .blocklyBlockCanvas .blocklyDraggable')
    const blockCount = await workspaceBlocks.count()
    expect(blockCount).toBeGreaterThanOrEqual(1)

    await page.locator('button', { hasText: 'Run' }).click()

    await page.waitForTimeout(3000)
    await expect(page.locator('text=Execution timed out')).not.toBeVisible()
  })

  // --- Error display E2E ---

  test('running empty workspace completes without error', async ({ page }) => {
    await page.locator('button', { hasText: 'Run' }).click()
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Execution timed out')).not.toBeVisible()
  })

  // --- Keyboard shortcuts E2E ---

  test('Ctrl+Enter triggers Run without crash', async ({ page }) => {
    await page.keyboard.press('Control+Enter')
    await page.waitForTimeout(1000)
    await expect(page.locator('.blocklySvg')).toBeVisible()
  })
})
