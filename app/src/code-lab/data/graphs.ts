import type { LabPack } from '../types'

export const graphs: LabPack = {
  id: 'lab-graph',
  name: 'Graphs',
  description: 'Build and traverse graphs using adjacency lists, BFS, and DFS',
  icon: '🕸️',
  color: '#8b5cf6',
  exercises: [
    {
      id: 'lab-graph-1',
      title: 'Adjacency List',
      description:
        'Build an undirected graph as an adjacency list from this edge list:\n[[0,1],[0,2],[1,3],[2,3],[3,4]]\n\nPrint each node\'s neighbors sorted ascending, one node per line:\n"0: 1,2"\n"1: 0,3"\netc.',
      difficulty: 'beginner',
      expectedOutput: ['0: 1,2', '1: 0,3', '2: 0,3', '3: 1,2,4', '4: 3'],
      starterCode: '// Build adjacency list\nvar edges = [[0,1],[0,2],[1,3],[2,3],[3,4]];\nvar graph = {};\n\n// Add each edge to the adjacency list (undirected)\n',
      hints: [
        'For each edge [u, v], add v to graph[u] and u to graph[v]',
        'Initialize graph[u] = [] if it does not exist yet',
        'After building, sort each neighbor list, then loop nodes 0–4 and print "node: neighbors.join(\',\')"',
      ],
    },
    {
      id: 'lab-graph-2',
      title: 'Breadth-First Search',
      description:
        'Using the graph: [[0,1],[0,2],[1,3],[2,3],[3,4]], perform BFS starting from node 0.\n\nPrint the nodes in the order they are first visited, space-separated on one line.\n\nExample: "0 1 2 3 4"',
      difficulty: 'beginner',
      expectedOutput: ['0 1 2 3 4'],
      starterCode: '// BFS traversal\nvar edges = [[0,1],[0,2],[1,3],[2,3],[3,4]];\nvar graph = {0:[1,2],1:[0,3],2:[0,3],3:[1,2,4],4:[3]};\nvar visited = {};\nvar queue = [0];\nvar order = [];\n',
      hints: [
        'Mark the start node as visited before entering the loop',
        'While queue is not empty, shift the front node, push to order, then enqueue unvisited neighbors',
        'Mark each neighbor visited as you enqueue it, not when you dequeue it',
      ],
    },
    {
      id: 'lab-graph-3',
      title: 'Depth-First Search',
      description:
        'Using the same graph [[0,1],[0,2],[1,3],[2,3],[3,4]], perform iterative DFS starting from node 0.\n\nPrint the nodes in visit order, space-separated.\n\nWith a stack (LIFO), neighbors are pushed right-to-left so left neighbor is visited first.',
      difficulty: 'intermediate',
      expectedOutput: ['0 1 3 2 4'],
      starterCode: '// Iterative DFS\nvar graph = {0:[1,2],1:[0,3],2:[0,3],3:[1,2,4],4:[3]};\nvar visited = {};\nvar stack = [0];\nvar order = [];\n',
      hints: [
        'Pop from the stack; if already visited skip it, otherwise mark visited and push to order',
        'Push neighbors in reverse order so the first neighbor ends up on top of the stack',
        'Continue until the stack is empty, then print order.join(" ")',
      ],
    },
    {
      id: 'lab-graph-4',
      title: 'Path Finding',
      description:
        'Find if a path exists between two nodes in a graph.\n\nGraph edges: [[0,1],[1,2],[2,3],[4,5]]\n\nPrint "true" if a path exists from 0 to 3, then "false" for 0 to 5.',
      difficulty: 'intermediate',
      expectedOutput: ['true', 'false'],
      starterCode: '// Path finding with BFS\nvar edges = [[0,1],[1,2],[2,3],[4,5]];\nvar graph = {0:[1],1:[0,2],2:[1,3],3:[2],4:[5],5:[4]};\n\nfunction hasPath(graph, start, end) {\n  // BFS from start, return true if end is reached\n}\n\nconsole.log(hasPath(graph, 0, 3));\nconsole.log(hasPath(graph, 0, 5));\n',
      hints: [
        'Use a queue and a visited set; start BFS from "start"',
        'If you dequeue a node equal to "end", return true',
        'If the queue empties without finding "end", return false',
      ],
    },
    {
      id: 'lab-graph-5',
      title: 'Cycle Detection',
      description:
        'Detect if an undirected graph contains a cycle.\n\nGraph A edges: [[0,1],[1,2],[2,0]] (has cycle)\nGraph B edges: [[0,1],[1,2],[2,3]] (no cycle)\n\nPrint "true" then "false".',
      difficulty: 'advanced',
      expectedOutput: ['true', 'false'],
      starterCode: '// Cycle detection in undirected graph\nfunction hasCycle(numNodes, edges) {\n  var graph = {};\n  for (var i = 0; i < numNodes; i++) graph[i] = [];\n  for (var e of edges) {\n    graph[e[0]].push(e[1]);\n    graph[e[1]].push(e[0]);\n  }\n  // DFS: if we reach a visited node that isn\'t our parent, cycle exists\n}\n\nconsole.log(hasCycle(3, [[0,1],[1,2],[2,0]]));\nconsole.log(hasCycle(4, [[0,1],[1,2],[2,3]]));\n',
      hints: [
        'DFS from node 0, tracking parent to avoid false positives on the edge you came from',
        'If a neighbor is visited and is not the parent, a cycle is found',
        'Use a visited object and a recursive or stack-based DFS that passes along the parent node',
      ],
    },
  ],
}
