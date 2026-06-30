# Formula

Working prototype of a visual editor for formula dependencies.
Math, Physics.


![](https://github.com/zbirow/Formula/blob/main/tests/Formula.png)
![](https://github.com/zbirow/Formula/blob/main/tests/Formula2.png)

## Startup

Node.js 18 or later is required.

```powershell
npm start
```

Open `http://127.0.0.1:4173`.

Engine Tests:

```powershell
npm test
```

## What's already working

- 212 formulas in 25 areas of mathematics and physics;
- value sources and editable symbols;
- explicit port → port connections;
- automatic recalculation of the entire graph;
- cycle detection;
- trace the origin of the result;
- drag and drop nodes and formulas from the library;
- custom formula creator with a safe expression parser;
- local graph and library storage. - Linear, quadratic, exponential, and trigonometric function graphs within nodes;
- Visualizations of 2D figure areas and 3D solid surfaces and volumes;
- Actual proportions of the dimensions of figures and solids, scaled uniformly to the available space;
- Quadratic graphs with autoscale including the current point, vertex, and zeros;
- A wide catalog of physics: motion, forces, energy, gravity, heat, waves, optics, current, magnetism, fluids, and atomic physics;
- Separate nodes for physical constants, making their origins transparent.
- Infinite board with background shifting, 20-250% zoom, and full graph alignment;
- Multi-row, expandable categories without truncation.
- Switch the entire interface between English and Polish (English is the default);
- A final "Result" component that displays the connected value without any additional action and copies it with full precision; - Shortening the presentation of numbers after 10 decimal places without losing the full value;
- Automatically positioned side descriptions and all polygon angles.
- Multiple independent projects with listing, creation, renaming, switching, and deletion;
- Explicit project saving with the `Ctrl+S` button or shortcut, and automatic draft recovery of unsaved work;
- Safe confirmations before clearing the board, loading an example, and deleting a project.

## Semantic Model

Each node instance has its own `nodeId`. Each port has a stable `portId`. The wire stores four fields:

```json
{
"sourceNodeId": "difference-demo",
"sourcePortId": "result",
"targetNodeId": "work-demo",
"targetPortId": "force"
}
```

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
