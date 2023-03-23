import Stack from "../../Wolfie2D/DataTypes/Collections/Stack";
import Graph from "../../Wolfie2D/DataTypes/Graphs/Graph";
import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import NavPathStrat from "../../Wolfie2D/Pathfinding/Strategies/NavigationStrategy";
import GraphUtils from "../../Wolfie2D/Utils/GraphUtils";

// TODO Construct a NavigationPath object using A*

interface AStarNode {
    node: number;
    gcost: number;
    hcost: number;
    parent: number;
}
/**
 * The AstarStrategy class is an extension of the abstract NavPathStrategy class. For our navigation system, you can
 * now specify and define your own pathfinding strategy. Originally, the two options were to use Djikstras or a
 * direct (point A -> point B) strategy. The only way to change how the pathfinding was done was by hard-coding things
 * into the classes associated with the navigation system. 
 * 
 * - Peter
 */
export default class AstarStrategy extends NavPathStrat {

    private static getDistance(graph: PositionGraph, a: number, b: number): number {
        let positions = graph.positions;

        let aPos = positions[a];
        let bPos = positions[b];

        let dx = Math.abs(aPos.x - bPos.x);
        let dy = Math.abs(aPos.y - bPos.y);

        let diag = Math.min(dx, dy);

        return 14 * diag + 10 * (Math.max(dx,dy) - diag);
    }

    private static getNeighbors(graph: Graph, nodeIndex: number): number[]{
        let edge = graph.getEdges(nodeIndex);
        let neighbors = [];

        while(edge != null){
            neighbors.push(edge.y);
            edge = edge.next;
        }
        return neighbors;
    }

    private static getLowestFCost(list: AStarNode[]): AStarNode{
        let lowestCost = list[0].gcost + list[0].hcost;
        let lowestIndex = 0;
        list.map((node, i) => {
            if(node.gcost + node.hcost < lowestCost)
                lowestIndex = i;
        })
        return list[lowestIndex];
    }

    /**
     * @see NavPathStrat.buildPath()
     */
    public buildPath(to: Vec2, from: Vec2): NavigationPath {
        // Indices of start and end node
        let start = this.mesh.graph.snap(from);
		let end = this.mesh.graph.snap(to);
        
        let path = new Stack<Vec2>(this.mesh.graph.numVertices);

        let startNode: AStarNode = {node: start, gcost: 0, hcost: -1, parent: -1};
        let open = [startNode];
        let close = [];

        let current: AStarNode;

        while(open.length > 0){
            // Remove the lowest cost node from open list
            current = AstarStrategy.getLowestFCost(open);

            if(current.node == end) break;
            
            let neighbors = AstarStrategy.getNeighbors(this.mesh.graph, current.node);
            
            for(let i = 0; i < neighbors.length; i++){
                let successor = neighbors[i];

                let open_index = open.findIndex((el) => el.node == successor);
                let close_index = close.findIndex((el) => el.node == successor);

                let cost = current.gcost;
                cost = cost + AstarStrategy.getDistance(this.mesh.graph, current.node, successor);

                if(open_index >= 0){
                    // If already in open list, replace only if lower cost
                    if(cost < open[open_index].gcost){
                        open[open_index].gcost = cost;
                        open[open_index].parent = successor;
                    }
                }
                else if(close_index >= 0){
                    // // If already in close list, replace only if lower cost
                    // if(cost < close[close_index].gcost){
                    //     close[close_index].gcost = cost;
                    //     close[close_index].parent = successor;
                    // }
                }
                else {
                    // Add neighbor to open list
                    let h = AstarStrategy.getDistance(this.mesh.graph, end, successor);
                    open.push({node: successor, gcost: cost, hcost: h, parent: current.node});
                }
            }

            // Add current node to close list and remove from open
            close.push(current);

            let curr_index = open.findIndex((node) => node.node == current.node)
            open.splice(curr_index, 1);            
        }
        let positions = this.mesh.graph.positions;

        let parent = 0;

        while(parent != -1){
            parent = current.parent;
            current = close.find((node) => node.node == parent);
            if(positions[parent])
                path.push(positions[parent]);
        }

        return new NavigationPath(path);
    }
    
}