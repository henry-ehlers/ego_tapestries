"use strict";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { State } from './state.js';
import customRadialForce from './customradialforce.js';
import customYforce from "./customYforce.js";
import { CompressionMsg } from "./CompressionMsg.js";

export class NodeLinkRenderer {

    constructor(nodelink, canvasWidth, canvasHeight, globalDispatcher = d3.dispatch("highlight", "hover-in", "hover-out", "compression")) { // default dispatcher if not provided, but can be shared across renderers for coordinated interactions
        this.nodelink = nodelink;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.globalDispatcher = globalDispatcher;

        this.nodes = this.nodelink.graph.nodes;
        this.edges = this.nodelink.graph.edges;

        // AHHH I LOVE IT. Took me hours to figure out.
        // Default values are infinity for x and y in node and edge classes.
        // If left unchanged, d3 will try to do math with infinity and result in NaN positions.
        this.nodes.forEach(n => {
            n.x = this.canvasWidth / 2 + Math.random() * 10;
            n.y = this.canvasHeight / 2 - Math.random() * 100;
        });
    }

    render(svg) {
        const edgeWidth = 0.1;
        const nodeRadius = 0.3;
        let mainG = svg.append("g");

        // force layout
        let simulation = this.initializeForceSimulation(mainG);
        // attach ticked function to update positions on each tick of the simulation
        simulation.on("tick", ticked);

        const link = mainG.append("g")
            .attr("stroke-width", edgeWidth)
            .selectAll("line")
            .data(this.edges)
            .join("line")
            .attr("color", d => (d.get_depth() % 1) === 0.5 ? "#c0c0c0" : "transparent") // color is not used for svg elements, but by setting it we can access the color with currentColor in CSS.
            .attr("stroke", d => (d.get_depth() % 1) === 0.5 ? "#c0c0c0" : "transparent"); // links between different depths are gray lines, arcs are in color within same depth.

        const arc = mainG.append("g")
            .attr("fill", "none")
            .attr("stroke", "none")
            .attr("stroke-width", edgeWidth)
            .selectAll("path")
            .data(this.edges)
            .join("path")
            .attr("color", d => (d.get_depth() % 1) === 0.5 ? "transparent" : d3.schemeObservable10[d.get_depth()]) // color is not used for svg elements, but by setting it we can access the color with currentColor in CSS.
            .attr("stroke", d => (d.get_depth() % 1) === 0.5 ? "transparent" : d3.schemeObservable10[d.get_depth()]); // links between different depths are gray lines, arcs are in color within same depth.

        const node = mainG.append("g")
            .selectAll("circle")
            .data(this.nodes)
            .join("circle")
            .attr("r", nodeRadius)
            .attr("color", d => d3.schemeObservable10[d.get_depth()]) // ditto
            .attr("fill", d => d3.schemeObservable10[d.get_depth()])
            .call(drag(simulation))
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                this.globalDispatcher.call("highlight", this, d.get_id());
            })
            .on("contextmenu", (event, d) => {
                // change ego and rerender everything
                event.preventDefault();
                unsetFixedPositions(this.nodes);
                this.nodelink.graph.change_ego_and_reconstruct(d);
                svg.selectAll("*").remove();
                this.render(svg);
            })
            .on("dblclick", (_event, d) => {
                this.globalDispatcher.call("compression", this, new CompressionMsg(d.get_id(), true));
            })
            .on("mouseover", (_event, d) => {
                this.globalDispatcher.call("hover-in", this, d.get_id());
            })
            .on("mouseout", () => {
                this.globalDispatcher.call("hover-out");
            });

        node.append("title").text(d => d.get_label());

        // Dispatcher callbacks for all interactions

        this.globalDispatcher.on(`highlight.nodelink.${this.nodelink.layoutType}`, (id) => {
            const selected_node = this.nodes.find(n => n.get_id() === id);
            if (selected_node.get_state() === State["Fully Compressed"]) { // toggle highlight all nodes in this depth level
                const isHighlighted = selected_node.get_highlighted();
                this.nodes.filter(n => n.get_depth() === selected_node.get_depth()).forEach(n => n.set_highlighted(!isHighlighted));
                node.filter(n => n.get_depth() === selected_node.get_depth()).classed("highlight", !isHighlighted);
            } else {
                selected_node.get_highlighted() ? selected_node.set_highlighted(false) : selected_node.set_highlighted(true);
                node.filter(n => n.get_id() === id).classed("highlight", selected_node.get_highlighted());
            }

            // Revisit may be defined globally, if the user is running this in a Revisit environment.
            if (Revisit) {
                let highlightedNodes = this.nodelink.graph.nodes.filter(n => n.get_highlighted()).map(n => n.label);
                Revisit.postAnswers({
                    // 'graphVis' must match id defined in config.json baseComponent response 
                    ['graphVis']: highlightedNodes,
                });
            }
        });

        this.globalDispatcher.on(`compression.nodelink.${this.nodelink.layoutType}`, (msg) => {
            let id;

            if (!msg.fullcompression) {
                return;
            } else if (msg.type === "string") {
                id = msg.msg;
            } else {
                const depth = msg.msg.get_depth();
                const any_node_of_depth = this.nodes.find(n => n.get_depth() === depth);
                id = any_node_of_depth.get_id();
            }

            const selected_node = this.nodes.find(n => n.get_id() === id);
            const depth = selected_node.get_depth();
            const x = selected_node.get_x();
            const y = selected_node.get_y();

            switch (selected_node.get_state()) {
                case State["Uncompressed"]:
                    this.nodes.filter(n => n.get_depth() === depth).forEach(n => {
                        n.set_state(State["Fully Compressed"]);
                        n.oldx = n.get_x();
                        n.oldy = n.get_y();
                        n.fx = x;
                        n.fy = y;
                    });
                    break;
                case State["Fully Compressed"]:
                    this.nodes.filter(n => n.get_depth() === depth).forEach(n => {
                        n.set_state(State["Uncompressed"]);

                        unsetFixedPositions(this.nodes.filter(n => n.get_depth() === depth));
                    });
                    break;
            }
            // change radius of nodes in this depth level to indicate compression state
            node.attr("r", d => d.get_state() === State["Fully Compressed"] ? nodeRadius * 2 : nodeRadius);
            this.easeSimulation(simulation);
        });

        this.globalDispatcher.on(`hover-in.nodelink.${this.nodelink.layoutType}`, (id) => {
            // fade all nodes and edges that are not on the path to ego
            const n = this.nodes.find(n => n.get_id() === id); // node objects are different in each renderer, but they have the same id.
            const path_to_ego = this.nodelink.graph.find_path_to_ego(n);
            node.classed("fade-nodelink-node", n => !path_to_ego.includes(n));
            link.classed("fade-nodelink-link", l => !(path_to_ego.includes(l.target) && path_to_ego.includes(l.source)));
            arc.classed("fade-nodelink-link", true);
        });

        this.globalDispatcher.on(`hover-out.nodelink.${this.nodelink.layoutType}`, () => {
            node.classed("fade-nodelink-node", false);
            link.classed("fade-nodelink-link", false);
            arc.classed("fade-nodelink-link", false);
        });

        function unsetFixedPositions(nodes) {
            nodes.forEach(n => {
                n.fx = null;
                n.fy = null;
            });
        }

        function ticked() {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            arc.attr("d", d => {
                const dx = d.target.x - d.source.x;
                const dy = d.target.y - d.source.y;
                const dr = Math.sqrt(dx * dx + dy * dy) * 0.8;
                return `M${d.source.x},${d.source.y} A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
            });

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        }

        function drag(simulation) {
            function precheck(event) {
                return event.subject.get_state() !== State["Fully Compressed"];
            }

            function dragstarted(event) {
                if (!precheck(event)) return;
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            function dragged(event) {
                if (!precheck(event)) return;
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            function dragended(event) {
                if (!precheck(event)) return;
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        const zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .filter(event => {
                // do not zoom if we double click a circle (handled by dblclick event on node)
                return !(event.type === "dblclick" && event.target.tagName === "circle");
            })
            .on("zoom", (event) => {
                mainG.attr("transform", event.transform);
            });

        svg.call(zoom);
    }

    easeSimulation(simulation) {
        // restart the simulation with a temporary alpha to let the nodes transition to their new positions after state changes
        simulation.alphaTarget(0.5).restart();
        setTimeout(() => {
            simulation.alphaTarget(0);
        }, 2000);
    }

    initializeForceSimulation(mainG) {
        switch (this.nodelink.layoutType) {
            case "force":
                return this.initializeDefaultForceLink();
            case "radial":
                return this.initializeRadialLayout(mainG);
            case "layered":
                return this.initializeLayeredLayout(mainG);
            default:
                console.warn("Unknown layout type. Defaulting to force-directed.");
                return this.initializeDefaultForceLink();
        }
    }

    initializeLayeredLayout(mainG) {
        const layerHeight = this.canvasHeight / (d3.max(this.nodes, d => d.get_depth()) + 1) * 0.9;

        // draw dashed lines for layers
        const depth_lines = mainG.append("g");
        for (let depth = 0; depth <= d3.max(this.nodes, d => d.get_depth()); depth++) {
            const y = layerHeight * (depth + 0.5);
            depth_lines.append("line")
                .attr("x1", 0 + this.canvasWidth * 0.1)
                .attr("y1", y)
                .attr("x2", this.canvasWidth - this.canvasWidth * 0.1)
                .attr("y2", y)
                .attr("stroke", "#c5c5c5")
                .attr("stroke-width", 0.05)
                .attr("stroke-dasharray", "0.5,0.5")
                .attr("stroke-linecap", "round");
        }

        const simulation = d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.edges)
                .id(d => d.get_id())
                .distance(60)
                .strength(0.1)
            )
            .force("charge", d3.forceManyBody().strength(-40))
            .force("x", d3.forceX(this.canvasWidth / 2).strength(0.25))

            // Use custom Y force to pull nodes into horizontal layers based on depth
            .force("yLayer0", customYforce(layerHeight * 0.5, 0).strength(2))
            .force("yLayer1", customYforce(layerHeight * 1.5, 1).strength(2))
            .force("yLayer2", customYforce(layerHeight * 2.5, 2).strength(2))
            .force("yLayer3", customYforce(layerHeight * 3.5, 3).strength(2))
            .force("yLayer4", customYforce(layerHeight * 4.5, 4).strength(2))
            .force("yLayer5", customYforce(layerHeight * 5.5, 5).strength(2));

        this.easeSimulation(simulation);
        return simulation;
    }

    initializeRadialLayout(mainG) {
        const canvasXcenter = this.canvasWidth / 2;
        const canvasYcenter = this.canvasHeight / 2;

        const maxDepth = d3.max(this.nodes, d => d.get_depth());
        const radiusBase = Math.min(this.canvasWidth, this.canvasHeight / 2) * 1.2;
        const radiusPerDepth = radiusBase / (maxDepth + 1);

        // draw concentric circles for depth levels
        const depth_circles = mainG.append("g");
        for (let depth = 1; depth <= maxDepth; depth++) {
            depth_circles.append("circle")
                .attr("cx", canvasXcenter)
                .attr("cy", canvasYcenter)
                .attr("r", radiusPerDepth * (depth))
                .attr("stroke", "#c5c5c5")
                .attr("stroke-width", 0.05)
                .attr("stroke-dasharray", "0.5,0.5")
                .attr("fill", "none");
        }

        const simulation = d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.edges).id(d => d.get_id()).strength(0.2).distance(2.5))
            .force("charge", d3.forceManyBody().strength(-0.5))

            // Use custom radial force to pull nodes into concentric circles based on depth
            .force("radius0", customRadialForce(radiusPerDepth * 0, canvasXcenter, canvasYcenter, 0).strength(1))
            .force("radius1", customRadialForce(radiusPerDepth * 1, canvasXcenter, canvasYcenter, 1).strength(1))
            .force("radius2", customRadialForce(radiusPerDepth * 2, canvasXcenter, canvasYcenter, 2).strength(1))
            .force("radius3", customRadialForce(radiusPerDepth * 3, canvasXcenter, canvasYcenter, 3).strength(1))
            .force("radius4", customRadialForce(radiusPerDepth * 4, canvasXcenter, canvasYcenter, 4).strength(1))
            .force("radius5", customRadialForce(radiusPerDepth * 5, canvasXcenter, canvasYcenter, 5).strength(1));

        this.easeSimulation(simulation);
        return simulation;
    }

    initializeDefaultForceLink() {
        return d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.edges)
                .id(d => d.get_id())
                .distance(40)
                .strength(0.5)
            )
            .force("charge", d3.forceManyBody().strength(-50))
            .force("center", d3.forceCenter(this.canvasWidth / 2, this.canvasHeight / 2));
    }
}
