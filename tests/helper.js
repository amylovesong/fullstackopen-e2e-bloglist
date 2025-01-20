const createBlog = async (page, title, author, url) => {
  await page.getByRole('button', { name: 'new note' }).click()

  await page.getByPlaceholder('write blog title here').fill(title)
  await page.getByPlaceholder('write blog author here').fill(author)
  await page.getByPlaceholder('write blog url here').fill(url)

  await page.getByRole('button', { name: 'create' }).click()
}

module.exports = { createBlog }
