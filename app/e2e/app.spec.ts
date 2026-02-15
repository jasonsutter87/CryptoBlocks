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
})
