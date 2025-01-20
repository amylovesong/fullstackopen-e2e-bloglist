const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        username: 'amylovesong',
        password: 'abcd',
        name: 'Amy Sun'
      }
    })

    await page.goto('http://localhost:5173')
  })

  test('Login from is shown', async ({ page }) => {
    await expect(page.getByText('Log in to application')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByTestId('username').fill('amylovesong')
      await page.getByTestId('password').fill('abcd')

      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('Amy Sun logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByTestId('username').fill('amylovesong')
      await page.getByTestId('password').fill('wrong')

      await page.getByRole('button', { name: 'login' }).click()

      const notificationDiv = await page.locator('.notification')
      await expect(notificationDiv).toHaveText('wrong username or password')
      await expect(notificationDiv).toHaveCSS('border-style', 'solid')
      await expect(notificationDiv).toHaveCSS('color', 'rgb(255, 0, 0)')

      await expect(page.getByText('Amy Sun logged in')).not.toBeVisible()
    })
  })
})
