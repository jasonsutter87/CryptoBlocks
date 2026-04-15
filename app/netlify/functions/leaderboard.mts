/**
 * Netlify Function — Global Leaderboard.
 *
 * GET /api/leaderboard — top builders, most loved, most remixed.
 * Public endpoint (no auth) — read-only aggregates over the projects table.
 */

import { json, tursoExecute, isTursoConfigured } from './_lib/index.js'

export default async function handler() {
  try {
    if (!isTursoConfigured()) return json({ error: 'Database not configured' }, 500)

    // Top Builders — most projects shared (exclude seed author)
    const builders = await tursoExecute(`
      SELECT author_name, COUNT(*) as project_count, SUM(likes) as total_likes
      FROM projects
      WHERE author_name != 'CryptoBlocks'
      GROUP BY author_name
      ORDER BY project_count DESC, total_likes DESC
      LIMIT 20
    `)

    const loved = await tursoExecute(`
      SELECT id, name, author_name, likes, category
      FROM projects
      WHERE likes > 0
      ORDER BY likes DESC
      LIMIT 20
    `)

    const remixed = await tursoExecute(`
      SELECT p.id, p.name, p.author_name, p.category, COUNT(c.id) as remix_count
      FROM projects p
      JOIN projects c ON c.parent_id = p.id
      GROUP BY p.id
      ORDER BY remix_count DESC
      LIMIT 20
    `)

    const globalStats = await tursoExecute(`
      SELECT
        COUNT(*) as total_projects,
        COUNT(DISTINCT author_name) as total_builders,
        SUM(likes) as total_likes,
        COUNT(CASE WHEN parent_id IS NOT NULL THEN 1 END) as total_remixes
      FROM projects
      WHERE author_name != 'CryptoBlocks'
    `)

    return json({
      topBuilders: builders.rows.map((r) => ({
        authorName: r.author_name,
        projectCount: Number(r.project_count),
        totalLikes: Number(r.total_likes),
      })),
      mostLoved: loved.rows.map((r) => ({
        id: r.id, name: r.name, authorName: r.author_name,
        likes: Number(r.likes), category: r.category,
      })),
      mostRemixed: remixed.rows.map((r) => ({
        id: r.id, name: r.name, authorName: r.author_name,
        category: r.category, remixCount: Number(r.remix_count),
      })),
      global: globalStats.rows[0] ? {
        totalProjects: Number(globalStats.rows[0].total_projects),
        totalBuilders: Number(globalStats.rows[0].total_builders),
        totalLikes: Number(globalStats.rows[0].total_likes),
        totalRemixes: Number(globalStats.rows[0].total_remixes),
      } : { totalProjects: 0, totalBuilders: 0, totalLikes: 0, totalRemixes: 0 },
    })
  } catch (err) {
    console.error('Leaderboard error:', err instanceof Error ? err.message : String(err))
    return json({ error: 'Internal server error' }, 500)
  }
}
