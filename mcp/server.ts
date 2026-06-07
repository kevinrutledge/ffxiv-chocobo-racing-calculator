/**
 * MCP server for the perfect-chocobo advisor. It imports the same pure math core as the
 * web app and exposes it as a tool, and it serves the game-mechanics reference and the
 * paper as resources.
 *
 * Run with npm run mcp (node --experimental-strip-types).
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { z } from 'zod'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { parseState } from '../src/schema/state.ts'
import { advise } from '../src/math/advisor.ts'
import { formatPercent, formatOdds } from '../src/format.ts'
import { STAT_NAMES } from '../src/types/stats.ts'
import { MAX_RANK, NUM_STATS, SLOTS } from '../src/math/model.ts'

const docsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs')

const server = new McpServer({ name: 'chocobo-advisor', version: '0.1.0' })

server.registerTool(
  'chocobo_odds',
  {
    title: 'Chocobo perfect-finish odds',
    description:
      'Given a chocobo mid-raise, return the odds of perfecting four attributes from here ' +
      'and the recommended action. values are five points in the range 55 to 500 in steps ' +
      'of 5, in the order Maximum Speed, Acceleration, Endurance, Stamina, Cunning. ' +
      'dumpIndex is which attribute (0 to 4) is the dump.',
    inputSchema: {
      rank: z.number().int().min(1).max(MAX_RANK),
      values: z.array(z.number().int()).length(NUM_STATS),
      dumpIndex: z
        .number()
        .int()
        .min(0)
        .max(NUM_STATS - 1),
      slotsSpent: z.number().int().min(0).max(SLOTS).optional(),
    },
  },
  async ({ rank, values, dumpIndex, slotsSpent }) => {
    const state = parseState({ rank, values, dumpIndex, slotsSpent: slotsSpent ?? 0 })
    if (state === null) {
      return {
        isError: true,
        content: [{ type: 'text', text: 'Invalid chocobo state. Values must be 55 to 500 in steps of 5.' }],
      }
    }
    const result = advise(state)
    const lines = [
      `Status ${result.status}`,
      `Four maxed (dump at most 250) ${formatPercent(result.fourFixedDump)} (${formatOdds(result.fourFixedDump)})`,
      `Perfect at most 250, online ${formatPercent(result.onlineLe250)} (${formatOdds(result.onlineLe250)})`,
      `Exact 250, online ${formatPercent(result.onlineEq250)} (${formatOdds(result.onlineEq250)})`,
      `Perfect lineup reachable ${result.perfectReachable ? 'yes' : 'no'}`,
      `Advice. ${result.headline}`,
    ]
    for (const target of result.targetAdvice) {
      lines.push(`  ${STAT_NAMES[target.index]} ${target.label}`)
    }
    return {
      content: [
        { type: 'text', text: lines.join('\n') },
        { type: 'text', text: JSON.stringify(result) },
      ],
    }
  },
)

server.registerResource(
  'research',
  'chocobo://research',
  {
    title: 'FFXIV chocobo racing game-mechanics reference',
    description: 'The verified game-mechanics reference behind the model.',
    mimeType: 'text/markdown',
  },
  async (uri) => ({
    contents: [{ uri: uri.href, text: readFileSync(join(docsDir, 'chocobo-racing-research.md'), 'utf8') }],
  }),
)

server.registerResource(
  'paper',
  'chocobo://paper',
  {
    title: 'Perfecting a Final Chocobo, paper source',
    description: 'The LaTeX source of the probability paper, with every derivation and proof.',
    mimeType: 'text/x-tex',
  },
  async (uri) => ({
    contents: [{ uri: uri.href, text: readFileSync(join(docsDir, 'chocobo-racing-probability.tex'), 'utf8') }],
  }),
)

await server.connect(new StdioServerTransport())
