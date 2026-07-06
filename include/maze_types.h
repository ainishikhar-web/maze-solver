/*
 * maze_types.h
 * 迷宫求解系统 - 数据类型定义（C语言）
 * 数据结构与算法课程设计
 */

/* 迷宫方向枚举 */
typedef enum {
    DIR_UP    = 0,
    DIR_DOWN  = 1,
    DIR_LEFT  = 2,
    DIR_RIGHT = 3
} Direction;

/* 迷宫单元格状态 */
typedef enum {
    CELL_WALL    = 0,  /* 墙壁 */
    CELL_PASSAGE = 1,  /* 通道 */
    CELL_VISITED = 2,  /* 已访问 */
    CELL_PATH    = 3   /* 路径 */
} CellType;

/* 迷宫坐标 */
typedef struct {
    int row;
    int col;
} Position;

/* 迷宫结构体 */
typedef struct {
    int rows;          /* 迷宫行数 */
    int cols;          /* 迷宫列数 */
    int **grid;        /* 二维数组：0=墙 1=通道 */
    Position start;    /* 入口坐标 */
    Position end;      /* 出口坐标 */
} Maze;

/* 栈结点（用于DFS） */
typedef struct StackNode {
    Position pos;
    struct StackNode *next;
} StackNode;

/* 栈结构体 */
typedef struct {
    StackNode *top;    /* 栈顶指针 */
    int size;          /* 栈大小 */
} Stack;

/* 队列结点（用于BFS） */
typedef struct QueueNode {
    Position pos;
    struct QueueNode *next;
} QueueNode;

/* 队列结构体 */
typedef struct {
    QueueNode *front;  /* 队首指针 */
    QueueNode *rear;   /* 队尾指针 */
    int size;          /* 队列大小 */
} Queue;

/* 路径记录链表 */
typedef struct PathNode {
    Position pos;
    struct PathNode *next;
} PathNode;

/* 函数声明 */
Maze* maze_create(int rows, int cols);
void  maze_destroy(Maze *maze);
void  maze_generate(Maze *maze);
int   maze_solve_dfs(Maze *maze, PathNode **path, Stack *stack_state);
int   maze_solve_bfs(Maze *maze, PathNode **path, Queue *queue_state);
void  maze_print(const Maze *maze, const PathNode *path);
