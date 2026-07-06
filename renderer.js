class MazeRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  resize(maze, containerWidth) {
    const cellSize = Math.floor(
      Math.min(
        (containerWidth - 20) / maze.grid[0].length,
        600 / maze.grid.length,
        30
      )
    );
    this.cellSize = Math.max(cellSize, 4);
    this.padding = 10;
    const w = maze.grid[0].length * this.cellSize + this.padding * 2;
    const h = maze.grid.length * this.cellSize + this.padding * 2;
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.canvas.style.width = w + "px";
      this.canvas.style.height = h + "px";
    }
  }

  draw(maze, state) {
    const ctx = this.ctx;
    const cs = this.cellSize;
    const pad = this.padding;
    const H = maze.grid.length;
    const W = maze.grid[0].length;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 背景
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 指示入口和出口
    // 入口 (1,0) 行1列0
    ctx.fillStyle = "#00ff88";
    ctx.fillRect(pad + 0 * cs, pad + 1 * cs, cs, cs);
    // 出口 (H-2, W-1)
    ctx.fillStyle = "#ff4444";
    ctx.fillRect(pad + (W - 1) * cs, pad + (H - 2) * cs, cs, cs);

    // 遍历每个格子
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        const x = pad + c * cs;
        const y = pad + r * cs;
        const isWall = maze.grid[r][c] === 1;

        // 跳过入口出口
        if ((r === 1 && c === 0) || (r === H - 2 && c === W - 1)) continue;

        if (isWall) {
          ctx.fillStyle = "#16213e";
          ctx.fillRect(x, y, cs, cs);
          // 墙壁边框
          ctx.strokeStyle = "#0f3460";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, cs, cs);
        } else {
          ctx.fillStyle = "#1a1a2e";
          ctx.fillRect(x, y, cs, cs);
        }
      }
    }

    if (!state) return;

    // 绘制访问过的格子
    if (state.visited) {
      for (const key of state.visited.keys()) {
        const [r, c] = key.split(",").map(Number);
        const x = pad + c * cs;
        const y = pad + r * cs;
        if (maze.grid[r][c] === 1) continue;
        ctx.fillStyle = "#16213e";
        ctx.fillRect(x, y, cs, cs);
        // 半透明蓝
        ctx.fillStyle = "rgba(0, 100, 255, 0.15)";
        ctx.fillRect(x, y, cs, cs);
      }
    }

    // 绘制front（栈/队列内容）
    if (state.front) {
      for (const cell of state.front) {
        const x = pad + cell.col * cs;
        const y = pad + cell.row * cs;
        if (maze.grid[cell.row][cell.col] === 1) continue;
        ctx.fillStyle = "rgba(0, 200, 255, 0.25)";
        ctx.fillRect(x, y, cs, cs);
      }
    }

    // 绘制回溯标记（DFS）
    if (state.backtrack) {
      const { row, col } = state.current;
      const x = pad + col * cs;
      const y = pad + row * cs;
      ctx.fillStyle = "rgba(255, 100, 0, 0.3)";
      ctx.fillRect(x, y, cs, cs);
    }

    // 绘制当前搜索节点
    if (state.current && !state.done) {
      const { row, col } = state.current;
      const x = pad + col * cs;
      const y = pad + row * cs;
      ctx.fillStyle = "#ffe066";
      ctx.fillRect(x, y, cs, cs);
      // 边框高亮
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, cs, cs);
    }

    // 绘制最终路径
    if (state.path && state.done) {
      for (const cell of state.path) {
        const x = pad + cell.col * cs;
        const y = pad + cell.row * cs;
        if (maze.grid[cell.row][cell.col] === 1) continue;
        ctx.fillStyle = "#00ff88";
        ctx.fillRect(x + 2, y + 2, cs - 4, cs - 4);
        // 路径点发光
        ctx.shadowColor = "#00ff88";
        ctx.shadowBlur = 4;
        ctx.fillRect(x + 4, y + 4, cs - 8, cs - 8);
        ctx.shadowBlur = 0;
      }
    }
  }

  // ---------- 文本显示（字符界面）----------
  drawText(maze, pathCells) {
    return maze.toText(pathCells);
  }
}
