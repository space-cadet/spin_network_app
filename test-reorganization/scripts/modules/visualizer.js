// Network Visualizer Module
export default class NetworkVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.reset();
    }

    reset() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawTensor(tensor, container) {
        // Create a visual representation of the tensor
        const dimensions = tensor.getDimensions();
        const table = document.createElement('table');
        table.className = 'tensor-visualization';
        
        if (dimensions.length <= 2) {
            // For 1D or 2D tensors, create a table
            const rows = dimensions[0];
            const cols = dimensions.length > 1 ? dimensions[1] : 1;
            
            for (let i = 0; i < rows; i++) {
                const row = document.createElement('tr');
                for (let j = 0; j < cols; j++) {
                    const cell = document.createElement('td');
                    const value = dimensions.length > 1 ? 
                        tensor.get([i, j]) : 
                        tensor.get([i]);
                    cell.textContent = value.toFixed(4);
                    row.appendChild(cell);
                }
                table.appendChild(row);
            }
        } else {
            // For higher dimensional tensors, show a summary
            const summary = document.createElement('div');
            summary.textContent = `Tensor of rank ${dimensions.length} with shape [${dimensions.join(', ')}]`;
            table.appendChild(summary);
        }
        
        container.appendChild(table);
    }

    setGraph(graph) {
        this.reset();
        
        // Draw nodes
        graph.nodes.forEach(node => {
            this.drawNode(node);
        });
        
        // Draw edges
        graph.getEdges().forEach(edge => {
            this.drawEdge(edge);
        });
    }

    drawNode(node) {
        const x = node.position?.x || this.canvas.width / 2;
        const y = node.position?.y || this.canvas.height / 2;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, 10, 0, Math.PI * 2);
        this.ctx.fillStyle = '#4a90e2';
        this.ctx.fill();
        this.ctx.strokeStyle = '#2171c7';
        this.ctx.stroke();
        
        // Draw node label
        this.ctx.fillStyle = '#000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(node.id.toString(), x, y - 20);
    }

    drawEdge(edge) {
        const source = edge.source;
        const target = edge.target;
        
        this.ctx.beginPath();
        this.ctx.moveTo(source.position.x, source.position.y);
        this.ctx.lineTo(target.position.x, target.position.y);
        this.ctx.strokeStyle = '#666';
        this.ctx.stroke();
        
        // Draw edge label (spin value)
        const midX = (source.position.x + target.position.x) / 2;
        const midY = (source.position.y + target.position.y) / 2;
        this.ctx.fillStyle = '#000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(edge.spin.toString(), midX, midY - 10);
    }
}