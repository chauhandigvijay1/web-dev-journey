export type SearchResultItem = {
  id: string
  title: string
  context: string
  route: string
}

export type SearchResults = {
  tasks: SearchResultItem[]
  notes: SearchResultItem[]
  messages: SearchResultItem[]
  members: SearchResultItem[]
  files: SearchResultItem[]
}
