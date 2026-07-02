# Graph Terminology

To be able to complete this study, you must be familiar with the terminology. Please carefully read the following text.

## Basic Terms

Every graph is made of just two things:
- **Nodes:** The items or points in the graph.
- **Edges:** The links or lines that connect those items.

### Subway Analogy

You may already be familiar with some graphs without knowing it.

Think of a standard city metro or subway map:

- The **stations** are the **nodes**.
- The **subway lines** connecting the stations are the **edges**.

## Visualization Styles

In this study, you will be shown four different types of graph visualization.
The nodes and edges stay the same, but the way they look changes completely.

### Node-Link Force-Directed Diagrams

This is the classic view that looks exactly like the subway map we just described.
You will see circles (nodes) connected by lines (edges).

### Node-Link Layered Diagrams.


Similar to the one above with lines as edges and circles as nodes.
The nodes are drawn on different visual layers however.

### Adjacency Matrix

Instead of a map, imagine a grid (similar to a spreadsheet), or a game of Battleship. 

- The **nodes** are listed as labels along the left side (rows) and the top (columns).
- The **edges** are shown as markings inside the grid squares. If there is a mark where a row and a column intersect, it means those two nodes are connected.

### BioFabric

This is a unique layout designed for complex networks. 
- The **nodes** are shown as long **horizontal bars** running from left to right.
- The **edges** are shown as **vertical lines** that cross over these horizontal bars, linking them together.

---

If this still feels a bit abstract, that is completely normal.
Before the actual evaluation starts, we will show you real examples of each visualization so you can get comfortable with them.

## Ego Networks

Sometimes, we don't want to look at a massive graph all at once.
Instead, we want to zoom in on just one specific node and see the world from its perspective. 

This is called an **Ego Network**.

### The Social Media Analogy

Think of your personal social media profile:
- **The Ego:** This is **you**. The single central person we are focusing on
- **The first level Alters:** These are your **immediate friends or connections**
- **The second/third/etc. level Alters:** The map shows you, all of your direct friends, and **your friend's friends**

---
