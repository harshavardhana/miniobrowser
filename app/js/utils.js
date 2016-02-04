export const sortObjectsByName = (objects, order) => {
  let folders = objects.filter(object => object.name.endsWith('/'))
  let files = objects.filter(object => !object.name.endsWith('/'))
  folders = folders.sort((a, b) => {
    if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
    if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
    return 0
  })
  files = files.sort((a, b) => {
    if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
    if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
    return 0
  })
  if (order) {
    folders = folders.reverse()
    files = files.reverse()
  }
  return [...folders, ...files]
}

export const sortObjectsBySize = (objects, order) => {
  let folders = objects.filter(object => object.name.endsWith('/'))
  let files = objects.filter(object => !object.name.endsWith('/'))
  files = files.sort((a, b) => a.size - b.size)
  if (order) files = files.reverse()
  return [...folders, ...files]
}

export const sortObjectsByDate = (objects, order) => {
  let folders = objects.filter(object => object.name.endsWith('/'))
  let files = objects.filter(object => !object.name.endsWith('/'))
  files = files.sort((a, b) => new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime())
  if (order) files = files.reverse()
  return [...folders, ...files]
}
