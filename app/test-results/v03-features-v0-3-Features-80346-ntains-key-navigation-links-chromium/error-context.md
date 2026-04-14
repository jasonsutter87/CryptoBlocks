# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: v03-features.spec.ts >> v0.3 Features >> Menu dropdown contains key navigation links
- Location: e2e/v03-features.spec.ts:6:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button').filter({ hasText: /^.*Menu.*$/ }).first()
    - locator resolved to <button title="Friends, Shareplace, Stats, Learn" class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors text-[#cdd6f4] hover:bg-[#313244]">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">…</div> intercepts pointer events
    - retrying click action
      - waiting 100ms
    51 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5] [cursor=pointer]:
      - heading "CryptoBlocks" [level=1] [ref=e10]
      - generic [ref=e11]: v0.3
    - generic [ref=e12]:
      - button "File" [ref=e14]:
        - img [ref=e15]
        - text: File
        - img [ref=e17]
      - button "Build" [ref=e20]:
        - img [ref=e21]
        - text: Build
        - img [ref=e23]
      - button "Menu" [ref=e27]:
        - img [ref=e28]
        - text: Menu
        - img [ref=e30]
      - generic "Blocks on workspace" [ref=e32]:
        - img [ref=e33]
        - text: "0"
      - generic [ref=e38]:
        - button "Undo" [ref=e39]:
          - img [ref=e40]
        - button "Redo" [ref=e42]:
          - img [ref=e43]
        - button "Fit View" [ref=e45]:
          - img [ref=e46]
      - button "Peek Code" [ref=e48]:
        - img [ref=e49]
        - generic [ref=e51]: Peek Code
      - button "micro:bit" [ref=e53]:
        - generic [ref=e55]: micro:bit
      - button "Run" [ref=e56]:
        - img [ref=e57]
        - text: Run
      - button "Sign In" [ref=e59]
  - generic [ref=e61]:
    - generic [ref=e63]:
      - tree [ref=e65]:
        - treeitem "Basics" [level=1] [ref=e66]:
          - generic [ref=e67]:
            - generic: Basics
        - treeitem "Math" [level=1] [ref=e68]:
          - generic [ref=e69]:
            - generic: Math
        - treeitem "Text" [level=1] [ref=e70]:
          - generic [ref=e71]:
            - generic: Text
        - treeitem "Logic" [level=1] [ref=e72]:
          - generic [ref=e73]:
            - generic: Logic
        - treeitem "Lists" [level=1] [ref=e74]:
          - generic [ref=e75]:
            - generic: Lists
        - treeitem "Data" [level=1] [ref=e76]:
          - generic [ref=e77]:
            - generic: Data
        - treeitem "Database" [level=1] [ref=e78]:
          - generic [ref=e79]:
            - generic: Database
        - treeitem "Web" [level=1] [ref=e80]:
          - generic [ref=e81]:
            - generic: Web
        - treeitem "Art" [level=1] [ref=e82]:
          - generic [ref=e83]:
            - generic: Art
        - treeitem "Crypto" [level=1] [ref=e84]:
          - generic [ref=e85]:
            - generic: Crypto
        - treeitem "AI" [level=1] [ref=e86]:
          - generic [ref=e87]:
            - generic: AI
        - treeitem "Sound" [level=1] [ref=e88]:
          - generic [ref=e89]:
            - generic: Sound
        - treeitem "Games" [level=1] [ref=e90]:
          - generic [ref=e91]:
            - generic: Games
        - treeitem "Hardware" [level=1] [ref=e92]:
          - generic [ref=e93]:
            - generic: Hardware
        - treeitem "micro:bit" [level=1] [ref=e94]:
          - generic [ref=e95]:
            - generic: micro:bit
        - treeitem "Pen" [level=1] [ref=e96]:
          - generic [ref=e97]:
            - generic: Pen
        - treeitem "Testing" [level=1] [ref=e98]:
          - generic [ref=e99]:
            - generic: Testing
        - treeitem "Vision" [level=1] [ref=e100]:
          - generic [ref=e101]:
            - generic: Vision
        - treeitem "Functions" [level=1] [ref=e102]:
          - generic [ref=e103]:
            - generic: Functions
        - treeitem "Events" [level=1] [ref=e104]:
          - generic [ref=e105]:
            - generic: Events
        - treeitem "HTML" [level=1] [ref=e106]:
          - generic [ref=e107]:
            - generic: HTML
        - treeitem "Libraries" [level=1] [ref=e108]:
          - generic [ref=e109]:
            - generic: Libraries
        - treeitem "Values" [level=1] [ref=e111]:
          - generic [ref=e112]:
            - generic: Values
      - img [ref=e113]:
        - generic "Blockly Workspace" [ref=e114]
      - img
      - img
    - generic:
      - button "Time Travel" [disabled] [ref=e126]:
        - img [ref=e127]
      - button "Slow-Mo" [ref=e130]:
        - img [ref=e131]
  - generic [ref=e135]:
    - generic [ref=e136]: 🐢
    - heading "Welcome to CryptoBlocks!" [level=2] [ref=e137]
    - paragraph [ref=e138]: Build apps, games, and websites with drag-and-drop blocks. No typing code required.
    - generic [ref=e139]:
      - button "Start Tour" [ref=e140]
      - button "Skip for now" [ref=e141]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | test.describe('v0.3 Features', () => {
  4   |   // --- Menu dropdown ---
  5   | 
  6   |   test('Menu dropdown contains key navigation links', async ({ page }) => {
  7   |     await page.goto('/')
  8   |     await page.waitForSelector('.blocklySvg', { timeout: 15000 })
  9   |     await page.waitForTimeout(1000)
  10  |     const menuBtn = page.locator('button').filter({ hasText: /^.*Menu.*$/ }).first()
> 11  |     await menuBtn.click()
      |                   ^ Error: locator.click: Test timeout of 30000ms exceeded.
  12  |     await page.waitForTimeout(500)
  13  |     await expect(page.locator('a:has-text("Shareplace")')).toBeVisible()
  14  |     await expect(page.locator('a:has-text("Daily Challenge")')).toBeVisible()
  15  |   })
  16  | 
  17  |   // --- Shareplace ---
  18  | 
  19  |   test('Shareplace page loads', async ({ page }) => {
  20  |     await page.goto('/shareplace')
  21  |     await expect(page.locator('h1:has-text("Shareplace")')).toBeVisible({ timeout: 10000 })
  22  |   })
  23  | 
  24  |   test('Shareplace search input exists', async ({ page }) => {
  25  |     await page.goto('/shareplace')
  26  |     await expect(page.locator('input[placeholder*="Search"]')).toBeVisible({ timeout: 10000 })
  27  |   })
  28  | 
  29  |   test('Shareplace category filters exist', async ({ page }) => {
  30  |     await page.goto('/shareplace')
  31  |     await expect(page.locator('text=All')).toBeVisible({ timeout: 10000 })
  32  |     await expect(page.locator('text=Games')).toBeVisible()
  33  |   })
  34  | 
  35  |   // --- Daily Challenge ---
  36  | 
  37  |   test('Daily Challenge page loads', async ({ page }) => {
  38  |     await page.goto('/daily')
  39  |     await expect(page.locator('text=Daily Challenge')).toBeVisible({ timeout: 10000 })
  40  |     await expect(page.locator('text=Current Streak')).toBeVisible()
  41  |     await expect(page.locator('text=Start Today')).toBeVisible()
  42  |   })
  43  | 
  44  |   test('Daily Challenge shows puzzle info', async ({ page }) => {
  45  |     await page.goto('/daily')
  46  |     await expect(page.locator('text=Target Output')).toBeVisible({ timeout: 10000 })
  47  |     await expect(page.locator('text=Par:')).toBeVisible()
  48  |   })
  49  | 
  50  |   // --- Leaderboard ---
  51  | 
  52  |   test('Leaderboard page loads', async ({ page }) => {
  53  |     await page.goto('/leaderboard')
  54  |     await expect(page.locator('h1:has-text("Leaderboard")')).toBeVisible({ timeout: 10000 })
  55  |   })
  56  | 
  57  |   // --- Teacher Dashboard ---
  58  | 
  59  |   test('Teacher/Classrooms page loads', async ({ page }) => {
  60  |     await page.goto('/teacher')
  61  |     // Should show sign-in prompt or classroom list
  62  |     await expect(page.locator('text=Classrooms').first()).toBeVisible({ timeout: 10000 })
  63  |   })
  64  | 
  65  |   // --- Profile ---
  66  | 
  67  |   test('Profile page loads', async ({ page }) => {
  68  |     await page.goto('/profile')
  69  |     await expect(page.locator('text=Profile & Settings')).toBeVisible({ timeout: 10000 })
  70  |   })
  71  | 
  72  |   test('Profile has theme selector', async ({ page }) => {
  73  |     await page.goto('/profile')
  74  |     await expect(page.locator('text=Theme')).toBeVisible({ timeout: 10000 })
  75  |     const themeSelect = page.locator('select').filter({ hasText: 'Dark' })
  76  |     await expect(themeSelect).toBeVisible()
  77  |   })
  78  | 
  79  |   // --- Dashboard ---
  80  | 
  81  |   test('Dashboard page loads with stats', async ({ page }) => {
  82  |     await page.goto('/dashboard')
  83  |     await expect(page.locator('text=Your Dashboard')).toBeVisible({ timeout: 10000 })
  84  |     await expect(page.locator('text=Total Blocks Created')).toBeVisible()
  85  |     await expect(page.locator('text=Total Runs')).toBeVisible()
  86  |   })
  87  | 
  88  |   // --- Editor features ---
  89  | 
  90  |   test('Sign In button visible when not authenticated', async ({ page }) => {
  91  |     await page.goto('/')
  92  |     await page.waitForSelector('.blocklySvg', { timeout: 15000 })
  93  |     await expect(page.locator('button', { hasText: 'Sign In' })).toBeVisible({ timeout: 10000 })
  94  |   })
  95  | 
  96  |   test('micro:bit button visible in toolbar', async ({ page }) => {
  97  |     await page.goto('/')
  98  |     await page.waitForSelector('.blocklySvg', { timeout: 15000 })
  99  |     await expect(page.locator('[title*="micro:bit"], button:has-text("micro:bit")')).toBeVisible({ timeout: 10000 })
  100 |   })
  101 | 
  102 |   test('Time Travel button visible in workspace', async ({ page }) => {
  103 |     await page.goto('/')
  104 |     await page.waitForSelector('.blocklySvg', { timeout: 15000 })
  105 |     await expect(page.locator('[title*="Time Travel"]')).toBeVisible({ timeout: 10000 })
  106 |   })
  107 | 
  108 |   test('Slow-Mo button visible in workspace', async ({ page }) => {
  109 |     await page.goto('/')
  110 |     await page.waitForSelector('.blocklySvg', { timeout: 15000 })
  111 |     await expect(page.locator('[title*="Slow-Mo"]')).toBeVisible({ timeout: 10000 })
```