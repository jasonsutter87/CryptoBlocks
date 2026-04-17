export interface SharedProject {
  id: string
  name: string
  author: string
  authorId?: string
  description: string
  category: string
  blockCount: number
  downloads: number
  likes: number
  createdAt: string
  tags: string[]
  parentId?: string | null
  visibility?: string
}
