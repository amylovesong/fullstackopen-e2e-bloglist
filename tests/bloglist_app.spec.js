const { test, expect, beforeEach, describe } = require('@playwright/test')
const { createBlog, loginWith } = require('./helper')

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
    await request.post('http://localhost:3003/api/users', {
      data: {
        username: 'leon',
        password: 'abcd',
        name: 'Leon Ma'
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
      await loginWith(page, 'amylovesong', 'abcd')

      await expect(page.getByText('Amy Sun logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'amylovesong', 'wrong')

      const notificationDiv = await page.locator('.notification')
      await expect(notificationDiv).toHaveText('wrong username or password')
      await expect(notificationDiv).toHaveCSS('border-style', 'solid')
      await expect(notificationDiv).toHaveCSS('color', 'rgb(255, 0, 0)')

      await expect(page.getByText('Amy Sun logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'amylovesong', 'abcd')
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'New blog created by test', 'Amy Sun',
        'http://localhost:5173')

      await expect(page.getByText('New blog created by test Amy Sun')).toBeVisible()
    })

    describe('and a blog exists', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, 'New blog created by test', 'Amy Sun',
          'http://localhost:5173')
      })

      test('a blog can be liked', async ({ page }) => {
        const blogText = await page.getByText('New blog created by test Amy Sun')
        const blogElement = await blogText.locator('..')
        await blogElement.getByRole('button', { name: 'view' }).click()
        
        await expect(blogElement.getByTestId('likes')).toBeVisible()
        await expect(blogElement.getByTestId('likes')).toHaveText('0')

        await blogElement.getByRole('button', { name: 'like' }).click()
  
        await expect(blogElement.getByTestId('likes')).toHaveText('1')
      })

      test('a blog can be deleted', async ({ page }) => {
        const blogText = await page.getByText('New blog created by test Amy Sun')
        const blogElement = await blogText.locator('..')
        await blogElement.getByRole('button', { name: 'view' }).click()
        
        // handle dialog
        page.on('dialog', dialog => dialog.accept())
        await blogElement.getByRole('button', { name: 'remove' }).click()
        
        await expect(page.getByText('New blog created by test Amy Sun')).not.toBeVisible()
      })

      test('only the user who added the blog sees the blog\'s delete button', async ({page}) => {
        await page.getByRole('button', { name: 'logout' }).click()
        await loginWith(page, 'leon', 'abcd')
        await createBlog(page, 'A blog with short title', 'Leon Ma', 'http://localhost:5173')

        const blogTextNew = await page.getByText('A blog with short title Leon Ma')
        const blogElementNew = await blogTextNew.locator('..')
        await blogElementNew.getByRole('button', { name: 'view' }).click()
        
        await expect(blogElementNew.getByRole('button', { name: 'remove' })).toBeVisible()

        const blogText = await page.getByText('New blog created by test Amy Sun')
        const blogElement = await blogText.locator('..')
        await blogElement.getByRole('button', { name: 'view' }).click()
        
        await expect(blogElement.getByRole('button', { name: 'remove' })).not.toBeVisible()
      })

      test('blogs are arranged in the order of likes', async ({ page }) => {
        await createBlog(page, 'A blog with most likes', 'Amy Sun',
          'http://localhost:5173')

        // check before like button click
        let blogs = await page.getByTestId('blog').all()
        expect(blogs.length).toBe(2)
        await expect(blogs[0].getByText('New blog created by test Amy Sun')).toBeVisible()
        await expect(blogs[1].getByText('A blog with most likes Amy Sun')).toBeVisible()
        
        await blogs[0].getByRole('button', { name: 'view' }).click()
        await expect(blogs[0].getByTestId('likes')).toHaveText('0')
        await blogs[1].getByRole('button', { name: 'view' }).click()
        await expect(blogs[1].getByTestId('likes')).toHaveText('0')

        // click the like button of the second blog
        await blogs[1].getByRole('button', { name: 'like' }).click()

        // check after like button click
        blogs = await page.getByTestId('blog').all()
        expect(blogs.length).toBe(2)
        await expect(blogs[0].getByText('A blog with most likes Amy Sun')).toBeVisible()
        await expect(blogs[0].getByTestId('likes')).toHaveText('1')
        await expect(blogs[1].getByText('New blog created by test Amy Sun')).toBeVisible()
        await expect(blogs[1].getByTestId('likes')).toHaveText('0')
      })
    })
  })
})
