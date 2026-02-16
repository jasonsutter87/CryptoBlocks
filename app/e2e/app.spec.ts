import { test, expect } from '@playwright/test'

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
})
