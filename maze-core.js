class Maze {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.grid = []; // 二维数组：0=通道 1=墙壁
  }

  // ---------- 生成迷宫：随机化DFS（递归回溯法）----------
  generate() {
    // 初始化全墙
    this.grid = Array.from({ length: 2 * this.rows + 1 }, () =>
      Array(2 * this.cols + 1).fill(1)
    );
    // 打通所有偶数行偶数列（单元格位置）
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.grid[2 * r + 1][2 * c + 1] = 0;
      }
    }
    // 递归回溯法打通墙壁
    const visited = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(false)
    );
    const stack = [];
    let curr = [0, 0];
    visited[0][0] = true;
    stack.push(curr);

    while (stack.length > 0) {
      const [r, c] = curr;
      const neighbors = [];
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && !visited[nr][nc]) {
          neighbors.push([nr, nc, dr, dc]);
        }
      }
      if (neighbors.length > 0) {
        const [nr, nc, dr, dc] = neighbors[Math.floor(Math.random() * neighbors.length)];
        // 打通墙壁
        this.grid[2 * r + 1 + dr][2 * c + 1 + dc] = 0;
        visited[nr][nc] = true;
        stack.push([nr, nc]);
        curr = [nr, nc];
      } else {
        curr = stack.pop();
      }
    }
    // 入口出口
    this.grid[1][0] = 0;     // 入口 (0,1) -> 迷宫坐标(1,0)
    this.grid[2 * this.rows - 1][2 * this.cols] = 0; // 出口
    return this;
  }

  // ---------- 从二维数组加载迷宫 ----------
  load(gridData) {
    this.grid = gridData;
    this.rows = (gridData.length - 1) / 2;
    this.cols = (gridData[0].length - 1) / 2;
    return this;
  }

  // ---------- 获取单元格通道（偶数行列） ----------
  isPassage(r, c) {
    return r >= 0 && r < this.grid.length &&
           c >= 0 && c < this.grid[0].length &&
           this.grid[r][c] === 0;
  }

  // ---------- DFS求解（栈）----------
  // 返回步骤数组用于动画
  solveDFS() {
    const steps = [];
    const H = this.grid.length, W = this.grid[0].length;
    const visited = Array.from({ length: H }, () => Array(W).fill(false));
    const parent = Array.from({ length: H }, () => Array(W).fill(null));
    const stack = [];

    const start = [1, 0]; // 入口
    const exit = [H - 2, W - 1]; // 出口

    visited[start[0]][start[1]] = true;
    stack.push(start);

    while (stack.length > 0) {
      const [r, c] = stack.pop();
      const front = stack.map(p => ({ row: p[0], col: p[1] }));

      steps.push({
        current: { row: r, col: c },
        visited: steps.length > 0
          ? new Map(steps[steps.length - 1].visited)
          : new Map(),
        front,
        backtrack: false,
        done: false,
        path: null
      });
      // Update visited map
      if (steps.length > 1) {
        const prev = steps[steps.length - 2].visited;
        const cur = steps[steps.length - 1].visited;
        for (const [k, v] of prev) cur.set(k, v);
      }
      steps[steps.length - 1].visited.set(`${r},${c}`, true);

      if (r === exit[0] && c === exit[1]) {
        // 重建路径
        const path = [];
        let cur = [r, c];
        while (cur) {
          path.push({ row: cur[0], col: cur[1] });
          cur = parent[cur[0]][cur[1]];
        }
        path.reverse();
        steps[steps.length - 1].done = true;
        steps[steps.length - 1].path = path;
        return steps;
      }

      const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      let pushed = false;
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (this.isPassage(nr, nc) && !visited[nr][nc]) {
          visited[nr][nc] = true;
          parent[nr][nc] = [r, c];
          stack.push([nr, nc]);
          pushed = true;
        }
      }
      if (!pushed) {
        steps[steps.length - 1].backtrack = true;
      }
    }
    // 无解
    steps[steps.length - 1].done = true;
    return steps;
  }

  // ---------- BFS求解（队列）----------
  solveBFS() {
    const steps = [];
    const H = this.grid.length, W = this.grid[0].length;
    const visited = Array.from({ length: H }, () => Array(W).fill(false));
    const parent = Array.from({ length: H }, () => Array(W).fill(null));
    const queue = [];

    const start = [1, 0];
    const exit = [H - 2, W - 1];

    visited[start[0]][start[1]] = true;
    queue.push(start);

    while (queue.length > 0) {
      const [r, c] = queue.shift(); // 出队
      const front = queue.map(p => ({ row: p[0], col: p[1] }));

      // Build current visited map
      const visitedMap = new Map();
      for (let i = 0; i < H; i++)
        for (let j = 0; j < W; j++)
          if (visited[i][j]) visitedMap.set(`${i},${j}`, true);

      steps.push({
        current: { row: r, col: c },
        visited: visitedMap,
        front,
        done: false,
        path: null
      });

      if (r === exit[0] && c === exit[1]) {
        const path = [];
        let cur = [r, c];
        while (cur) {
          path.push({ row: cur[0], col: cur[1] });
          cur = parent[cur[0]][cur[1]];
        }
        path.reverse();
        steps[steps.length - 1].done = true;
        steps[steps.length - 1].path = path;
        return steps;
      }

      const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (this.isPassage(nr, nc) && !visited[nr][nc]) {
          visited[nr][nc] = true;
          parent[nr][nc] = [r, c];
          queue.push([nr, nc]);
        }
      }
    }
    // 无解
    if (steps.length > 0) steps[steps.length - 1].done = true;
    return steps;
  }

  // ---------- 导出迷宫文本（#墙壁 .通道 *路径）----------
  toText(pathCells = null) {
    const pathSet = new Set();
    if (pathCells) {
      for (const p of pathCells) pathSet.add(`${p.row},${p.col}`);
    }
    const lines = [];
    for (let r = 0; r < this.grid.length; r++) {
      let line = "";
      for (let c = 0; c < this.grid[0].length; c++) {
        if (pathSet.has(`${r},${c}`)) line += "*";
        else line += this.grid[r][c] === 1 ? "#" : ".";
      }
      lines.push(line);
    }
    return lines.join("\n");
  }

  // ---------- 统计信息 ----------
  getStats() {
    let wallCount = 0, passageCount = 0;
    for (const row of this.grid) {
      for (const cell of row) {
        if (cell === 1) wallCount++;
        else passageCount++;
      }
    }
    return {
      rows: this.grid.length,
      cols: this.grid[0].length,
      cells: this.grid.length * this.grid[0].length,
      walls: wallCount,
      passages: passageCount
    };
  }
}

// 兼容浏览器和Node
if (typeof module !== "undefined") module.exports = Maze;
