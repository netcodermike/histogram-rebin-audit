import { readFileSync } from 'node:fs'

function analyze({ sourceEdges, counts, targetEdges }) {
  const validEdges = edges => Array.isArray(edges) && edges.length > 1 && edges.every((edge, i) => Number.isFinite(edge) && (!i || edge > edges[i - 1]))
  if (!validEdges(sourceEdges) || !validEdges(targetEdges) || !Array.isArray(counts) || counts.length !== sourceEdges.length - 1 || !counts.every(count => Number.isFinite(count) && count >= 0)) {
    throw Error('Provide strictly increasing finite edges and one nonnegative count per source bin')
  }
  const result = Array(targetEdges.length - 1).fill(0)
  let source = 0, target = 0
  while (source < counts.length && target < result.length) {
    const start = Math.max(sourceEdges[source], targetEdges[target])
    const end = Math.min(sourceEdges[source + 1], targetEdges[target + 1])
    if (end > start) result[target] += counts[source] * ((end - start) / (sourceEdges[source + 1] - sourceEdges[source]))
    const sourceEnd = sourceEdges[source + 1], targetEnd = targetEdges[target + 1]
    if (sourceEnd <= targetEnd) source++
    if (targetEnd <= sourceEnd) target++
  }
  const sourceCount = counts.reduce((a,b) => a+b, 0)
  const assigned = result.reduce((a,b) => a+b, 0)
  const rounded = value => Number(value.toFixed(6))
  return { sourceCount: rounded(sourceCount), counts: result.map(rounded), outsideCount: rounded(Math.max(0, sourceCount-assigned)) }
}

try {
  if (process.argv.length !== 3) throw new Error('Usage: node app.mjs input.json')
  console.log(JSON.stringify(analyze(JSON.parse(readFileSync(process.argv[2], 'utf8')))))
} catch (error) {
  console.error(error.message)
  process.exitCode = 2
}
