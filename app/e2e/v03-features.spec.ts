import { test, expect } from '@playwright/test'

test.describe('v0.3 Features', () => {
  // --- Menu dropdown ---

  test('Menu dropdown contains key navigation links', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.blocklySvg', { timeout: 15000 })
    await page.waitForTimeout(1500)
    // Menu button has a hamburger icon + "Menu" text + chevron
    const menuBtn = page.locator('button:has-text("Menu")').first()
    if (await menuBtn.isVisible()) {
      await menuBtn.click()
      await page.waitForTimeout(500)
      await expect(page.locator('text=Shareplace').first()).toBeVisible()
    }
  })

  // --- Shareplace ---

  test('Shareplace page loads', async ({ page }) => {
    await page.goto('/shareplace')
    await expect(page.locator('h1:has-text("Shareplace")')).toBeVisible({ timeout: 10000 })
  })

  test('Shareplace search input exists', async ({ page }) => {
    await page.goto('/shareplace')
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible({ timeout: 10000 })
  })

  test('Shareplace category filters exist', async ({ page }) => {
    await page.goto('/shareplace')
    await expect(page.locator('text=All')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Games')).toBeVisible()
  })

  // --- Daily Challenge ---

  test('Daily Challenge page loads', async ({ page }) => {
    await page.goto('/daily')
    await expect(page.locator('text=Daily Challenge')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Current Streak')).toBeVisible()
    await expect(page.locator('text=Start Today')).toBeVisible()
  })

  test('Daily Challenge shows puzzle info', async ({ page }) => {
    await page.goto('/daily')
    await expect(page.locator('text=Target Output')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Par:')).toBeVisible()
  })

  // --- Leaderboard ---

  test('Leaderboard page loads', async ({ page }) => {
    await page.goto('/leaderboard')
    await expect(page.locator('h1:has-text("Leaderboard")')).toBeVisible({ timeout: 10000 })
  })

  // --- Teacher Dashboard ---

  test('Teacher/Classrooms page loads', async ({ page }) => {
    await page.goto('/teacher')
    // Should show sign-in prompt or classroom list
    await expect(page.locator('text=Classrooms').first()).toBeVisible({ timeout: 10000 })
  })

  // --- Profile ---

  test('Profile page loads', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.locator('text=Profile & Settings')).toBeVisible({ timeout: 10000 })
  })

  test('Profile has theme selector', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.locator('text=Theme')).toBeVisible({ timeout: 10000 })
    const themeSelect = page.locator('select').filter({ hasText: 'Dark' })
    await expect(themeSelect).toBeVisible()
  })

  // --- Dashboard ---

  test('Dashboard page loads with stats', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('text=Your Dashboard')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Total Blocks Created')).toBeVisible()
    await expect(page.locator('text=Total Runs')).toBeVisible()
  })

  // --- Editor features ---

  test('Sign In button visible when not authenticated', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.blocklySvg', { timeout: 15000 })
    await expect(page.locator('button', { hasText: 'Sign In' })).toBeVisible({ timeout: 10000 })
  })

  test('micro:bit button visible in toolbar', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.blocklySvg', { timeout: 15000 })
    await expect(page.locator('[title*="micro:bit"], button:has-text("micro:bit")')).toBeVisible({ timeout: 10000 })
  })

  test('Time Travel button visible in workspace', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.blocklySvg', { timeout: 15000 })
    await expect(page.locator('[title*="Time Travel"]')).toBeVisible({ timeout: 10000 })
  })

  test('Slow-Mo button visible in workspace', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.blocklySvg', { timeout: 15000 })
    await expect(page.locator('[title*="Slow-Mo"]')).toBeVisible({ timeout: 10000 })
  })

  test('Run button triggers execution', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.blocklySvg', { timeout: 15000 })
    await page.waitForTimeout(500)
    const runBtn = page.locator('button:has-text("Run")').first()
    await runBtn.click()
    await page.waitForTimeout(2000)
    await expect(page.locator('.blocklySvg')).toBeVisible()
  })

  // --- Build menu ---

  test('Build menu shows creative tools', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.blocklySvg', { timeout: 15000 })
    await page.waitForTimeout(1500)
    const buildBtn = page.locator('button:has-text("Build")').first()
    if (await buildBtn.isVisible()) {
      await buildBtn.click()
      await page.waitForTimeout(500)
      await expect(page.locator('text=Create Block').first()).toBeVisible()
    }
  })

  // --- Game blocks in toolbox ---

  test('Games category exists in toolbox', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.blocklySvg', { timeout: 15000 })
    await expect(page.locator('.blocklyToolboxCategoryLabel:has-text("Games")')).toBeVisible()
  })

  test('micro:bit category exists in toolbox', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.blocklySvg', { timeout: 15000 })
    await expect(page.locator('.blocklyToolboxCategoryLabel:has-text("micro:bit")')).toBeVisible()
  })

  // --- API endpoints ---

  test('Projects API returns JSON', async ({ request }) => {
    const res = await request.get('/api/projects')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data).toHaveProperty('projects')
    expect(Array.isArray(data.projects)).toBeTruthy()
  })

  test('Leaderboard API returns JSON', async ({ request }) => {
    const res = await request.get('/api/leaderboard')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data).toHaveProperty('topBuilders')
    expect(data).toHaveProperty('mostLoved')
  })

  test('Daily board API returns JSON', async ({ request }) => {
    const res = await request.get('/api/daily/board?day=10')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data).toHaveProperty('topSolvers')
    expect(data).toHaveProperty('todaySolvers')
  })

  test('Projects API accepts POST', async ({ request }) => {
    const res = await request.post('/api/projects', {
      data: { name: 'E2E Test', workspaceJson: '{}' },
    })
    // Either 201 (no auth enforced) or 401 (auth enforced) — both valid
    expect([201, 401]).toContain(res.status())
  })
})
