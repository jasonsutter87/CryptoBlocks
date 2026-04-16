import type { BlockDefinition, BlockCategory } from '../types/block'
import { CATEGORY_COLORS } from '../types/block'
import { basicsBlocks } from './definitions/basics'
import { mathBlocks } from './definitions/math'
import { textBlocks } from './definitions/text'
import { logicBlocks } from './definitions/logic'
import { listsBlocks } from './definitions/lists'
import { matrixBlocks } from './definitions/matrix'
import { dataBlocks } from './definitions/data'
import { webBlocks } from './definitions/web'
import { artBlocks } from './definitions/art'
import { databaseBlocks } from './definitions/database'
import { cryptoBlocks } from './definitions/crypto'
import { aiBlocks } from './definitions/ai'
import { soundBlocks } from './definitions/sound'
import { gamesBlocks } from './definitions/games'
import { hardwareBlocks } from './definitions/hardware'
import { microbitBlocks } from './definitions/microbit'
import { gamepadBlocks } from './definitions/gamepad'
import { turtleBlocks } from './definitions/turtle'
import { secretBlocks } from './definitions/secrets'
import { testingBlocks } from './definitions/testing'
import { visionBlocks } from './definitions/vision'

class BlockRegistry {
  private blocks: Map<string, BlockDefinition> = new Map()

  constructor() {
    this.registerAll(basicsBlocks)
    this.registerAll(mathBlocks)
    this.registerAll(textBlocks)
    this.registerAll(logicBlocks)
    this.registerAll(listsBlocks)
    this.registerAll(matrixBlocks)
    this.registerAll(dataBlocks)
    this.registerAll(databaseBlocks)
    this.registerAll(webBlocks)
    this.registerAll(artBlocks)
    this.registerAll(cryptoBlocks)
    this.registerAll(aiBlocks)
    this.registerAll(soundBlocks)
    this.registerAll(gamesBlocks)
    this.registerAll(hardwareBlocks)
    this.registerAll(microbitBlocks)
    this.registerAll(gamepadBlocks)
    this.registerAll(turtleBlocks)
    this.registerAll(secretBlocks)
    this.registerAll(testingBlocks)
    this.registerAll(visionBlocks)
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
