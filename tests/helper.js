const loginWith = async (page, username, password) => {
  await page.getByTestId('username').fill(username)
  await page.getByTestId('password').fill(password)

  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, title, author, url) => {
  await page.getByRole('button', { name: 'new note' }).click()

  await page.getByPlaceholder('write blog title here').fill(title)
  await page.getByPlaceholder('write blog author here').fill(author)
  await page.getByPlaceholder('write blog url here').fill(url)

  await page.getByRole('button', { name: 'create' }).click()

  // wait for the inserted note to be rendered on the screen
  await page.getByText(`${title} ${author}`).waitFor()
}

module.exports = { createBlog, loginWith }
