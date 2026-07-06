(function () {
  "use strict";

  const canvas = document.getElementById("mazeCanvas");
  const renderer = new MazeRenderer(canvas);
  let maze = null;
  let steps = [];
  let currentStep = 0;
  let animTimer = null;
  let isRunning = false;
  let algoType = "dfs";

  // DOM 引用
  const el = {
    rows: document.getElementById("rows"),
    cols: document.getElementById("cols"),
    speed: document.getElementById("speed"),
    speedVal: document.getElementById("speedVal"),
    generateBtn: document.getElementById("generateBtn"),
    solveBtn: document.getElementById("solveBtn"),
    resetBtn: document.getElementById("resetBtn"),
    algoBtns: document.querySelectorAll(".algo-btn"),
    stepInfo: document.getElementById("stepInfo"),
    statBar: document.getElementById("statBar"),
    textOutput: document.getElementById("textOutput"),
    solvedLabel: document.getElementById("solvedLabel"),
    statNodes: document.getElementById("statNodes"),
    statPath: document.getElementById("statPath"),
    statSteps: document.getElementById("statSteps"),
    algoDesc: document.getElementById("algoDesc"),
  };

  // ---------- 生成迷宫 ----------
  function generateMaze() {
    stopAnim();
    const rows = parseInt(el.rows.value) || 10;
    const cols = parseInt(el.cols.value) || 10;
    maze = new Maze(rows, cols);
    maze.generate();

    const container = canvas.parentElement;
    renderer.resize(maze, container.clientWidth);
    renderer.draw(maze, null);
    steps = [];
    currentStep = 0;
    el.statBar.textContent = `迷宫已生成：${maze.grid.length}×${maze.grid[0].length}`;
    el.stepInfo.textContent = "等待求解…";
    el.textOutput.value = "";
    el.solvedLabel.textContent = "";
    updateStats(null);
    el.solveBtn.disabled = false;
  }

  // ---------- 求解 ----------
  function solveMaze() {
    if (!maze) return;
    stopAnim();

    const solveStart = performance.now();
    if (algoType === "dfs") {
      steps = maze.solveDFS();
    } else {
      steps = maze.solveBFS();
    }
    const solveTime = performance.now() - solveStart;
    currentStep = 0;

    if (steps.length === 0) {
      el.statBar.textContent = "迷宫无解！";
      el.solvedLabel.textContent = "无解";
      el.solvedLabel.style.color = "#ff4444";
      return;
    }

    const last = steps[steps.length - 1];
    const solved = last.done && last.path && last.path.length > 0;
    el.solvedLabel.textContent = solved ? "✓ 已找到路径" : "✗ 未找到路径";
    el.solvedLabel.style.color = solved ? "#00ff88" : "#ff4444";

    // 统计信息
    const exploredCount = last.visited ? last.visited.size : 0;
    const pathLen = solved ? last.path.length : 0;
    updateStats({ explored: exploredCount, pathLen, total: steps.length, time: solveTime });

    // 求解用时
    el.statBar.textContent =
      `求解完成：${steps.length} 步探索 | 用时 ${solveTime.toFixed(1)}ms | ${solved ? "路径长度 " + pathLen : "无解"}`;

    // 文本输出
    if (solved) {
      el.textOutput.value = maze.toText(last.path);
    } else {
      el.textOutput.value = maze.toText(null);
    }

    // 开始动画
    startAnim();
  }

  // ---------- 动画控制 ----------
  function startAnim() {
    isRunning = true;
    el.solveBtn.textContent = "⏸ 暂停";
    tickAnim();
  }

  function stopAnim() {
    isRunning = false;
    if (animTimer) {
      clearTimeout(animTimer);
      animTimer = null;
    }
    el.solveBtn.textContent = algoType === "dfs" ? "▶ DFS 求解" : "▶ BFS 求解";
  }

  function tickAnim() {
    if (!isRunning || currentStep >= steps.length) {
      if (currentStep >= steps.length) {
        isRunning = false;
        el.solveBtn.textContent = algoType === "dfs" ? "▶ DFS 求解" : "▶ BFS 求解";
      }
      return;
    }

    const step = steps[currentStep];
    renderer.draw(maze, step);
    el.stepInfo.textContent =
      `步骤 ${currentStep + 1}/${steps.length} | 当前: (${step.current.row}, ${step.current.col})` +
      (step.backtrack ? " [回溯]" : "") +
      (step.done ? " [完成]" : "");

    currentStep++;

    const speed = parseInt(el.speed.value);
    const delay = Math.max(1, 100 - speed * 0.9);
    animTimer = setTimeout(tickAnim, delay);
  }

  function resetAnim() {
    stopAnim();
    currentStep = 0;
    if (maze) {
      renderer.draw(maze, null);
      el.stepInfo.textContent = "已重置";
      el.textOutput.value = "";
    }
  }

  // ---------- 统计更新 ----------
  function updateStats(data) {
    if (!data) {
      el.statNodes.textContent = "-";
      el.statPath.textContent = "-";
      el.statSteps.textContent = "-";
      return;
    }
    el.statNodes.textContent = data.explored;
    el.statPath.textContent = data.pathLen;
    el.statSteps.textContent = data.total;
  }

  // ---------- 算法描述 ----------
  const ALGO_DESC = {
    dfs: "深度优先搜索（DFS）使用栈（Stack）存储待探索节点。从入口出发，沿一条路径尽可能深入，走不通时回溯（出栈）。\n\n时间复杂度：O(V+E)\n空间复杂度：O(V)\n\n特点：不一定找到最短路径，但内存占用较小。",
    bfs: "广度优先搜索（BFS）使用队列（Queue）存储待探索节点。从入口出发，逐层向外扩展，保证首次找到出口时路径最短。\n\n时间复杂度：O(V+E)\n空间复杂度：O(V)\n\n特点：一定能找到最短路径，但队列可能较大。"
  };

  // ---------- 事件绑定 ----------
  el.generateBtn.addEventListener("click", generateMaze);

  el.solveBtn.addEventListener("click", function () {
    if (isRunning) {
      stopAnim();
    } else {
      if (steps.length === 0) solveMaze();
      else startAnim();
    }
  });

  el.resetBtn.addEventListener("click", resetAnim);

  el.algoBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      el.algoBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      algoType = btn.dataset.algo;
      el.algoDesc.textContent = ALGO_DESC[algoType] || "";
      stopAnim();
      steps = [];
      currentStep = 0;
      if (maze) {
        renderer.draw(maze, null);
        el.stepInfo.textContent = "算法已切换，点击求解";
        el.textOutput.value = "";
        el.solvedLabel.textContent = "";
      }
    });
  });

  el.speed.addEventListener("input", function () {
    el.speedVal.textContent = el.speed.value + "%";
  });

  // 预设迷宫尺寸快捷按钮
  document.querySelectorAll(".size-preset").forEach(function (btn) {
    btn.addEventListener("click", function () {
      el.rows.value = btn.dataset.rows;
      el.cols.value = btn.dataset.cols;
      generateMaze();
    });
  });

  // ---------- 窗口自适应 ----------
  window.addEventListener("resize", function () {
    if (maze) {
      const container = canvas.parentElement;
      renderer.resize(maze, container.clientWidth);
      const lastStep = currentStep > 0 && currentStep <= steps.length
        ? steps[currentStep - 1] : null;
      renderer.draw(maze, lastStep);
    }
  });

  // ---------- 初始化 ----------
  (function init() {
    // 设置默认10x10的算法描述
    el.algoDesc.textContent = ALGO_DESC.dfs;
    generateMaze();
  })();
})();
