import type { BlockDefinition, BlockCategory } from '../types/block'
import { CATEGORY_COLORS } from '../types/block'
import { basicsBlocks } from './definitions/basics'
import { mathBlocks } from './definitions/math'
import { textBlocks } from './definitions/text'
import { logicBlocks } from './definitions/logic'
import { listsBlocks } from './definitions/lists'
import { dataBlocks } from './definitions/data'
import { webBlocks } from './definitions/web'
import { artBlocks } from './definitions/art'
import { databaseBlocks } from './definitions/database'
import { cryptoBlocks } from './definitions/crypto'

class BlockRegistry {
  private blocks: Map<string, BlockDefinition> = new Map()

  constructor() {
    this.registerAll(basicsBlocks)
    this.registerAll(mathBlocks)
    this.registerAll(textBlocks)
    this.registerAll(logicBlocks)
    this.registerAll(listsBlocks)
    this.registerAll(dataBlocks)
    this.registerAll(databaseBlocks)
    this.registerAll(webBlocks)
    this.registerAll(artBlocks)
    this.registerAll(cryptoBlocks)
  }

  register(block: BlockDefinition) {
    this.blocks.set(block.name, block)
  }

  registerAll(blocks: BlockDefinition[]) {
    blocks.forEach((b) => this.register(b))
  }

  unregister(name: string) {
    this.blocks.delete(name)
  }

  get(name: string): BlockDefinition | undefined {
    return this.blocks.get(name)
  }

  getAll(): BlockDefinition[] {
    return Array.from(this.blocks.values())
  }

  getByCategory(category: BlockCategory): BlockDefinition[] {
    return this.getAll().filter((b) => b.category === category)
  }

  getCategories(): BlockCategory[] {
    const cats = new Set(this.getAll().map((b) => b.category))
    return Array.from(cats)
  }

  getCategoryColor(category: BlockCategory): string {
    return CATEGORY_COLORS[category]
  }
}

export const registry = new BlockRegistry()
