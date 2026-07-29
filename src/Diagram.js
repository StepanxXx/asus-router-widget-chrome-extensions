class Diagram {

    constructor({canvas, width, height, maxPoints, step, corector, max, min}) {
        this.ctx = canvas.getContext("2d");
        this.width = width;
        this.height = height;
        this.maxPoints = maxPoints;
        this.step = step;
        this.corector = corector;
        this.max = max;
        this.min = min;
        canvas.setAttribute("width", width); 
        canvas.setAttribute("height", height);
    }

    drawDiagram(points, color) {
        const { y, bezierCurves } = this.prepaerPoints(points);

        this.ctx.beginPath();
        this.ctx.lineWgetidth = 0;
        this.ctx.strokeStyle = "rgba(0, 0, 0, 0)";
        this.moveToR(0, 0);
        this.lineToR(0, y[0]);
        this.ctx.lineJoin = "round";
        bezierCurves.map(item => this.bezierCurveToR(...item)
        );
        const lastX = Math.min(this.width, this.width / (this.maxPoints - 1) * (y.length - 1));
        this.lineToR(lastX, 0);
        this.ctx.fillStyle = "rgba(" + color + ", 0.3)";
        this.ctx.fill();
        this.ctx.stroke();


        this.ctx.beginPath();
        this.ctx.globalAlpha = 1;
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "rgb(" + color + ")";
        this.lineToR(0, y[0]);
        this.ctx.lineJoin = "round";
        bezierCurves.map(item => this.bezierCurveToR(...item)
        );
        this.ctx.stroke();

    }

    prepaerPoints(points) {
        const y = points.map(point => {
            if (point <= 0) return point = 1;
            return Math.round((point - this.min) / (this.max - this.min) * (this.height - 2)) + 1;
        });

        const bezierCurves = y.map((p, index, arr) => {
            if (arr.length == index + 1) return [];
            const lineSizeX = this.width / (this.maxPoints - 1);
            const
                cp1x = index * lineSizeX + this.step - this.corector, cp1y = p, cp2x = (index + 1) * lineSizeX - this.step + this.corector, cp2y = arr[index + 1], x = (index + 1) * lineSizeX, y = arr[index + 1];
            return [cp1x, cp1y, cp2x, cp2y, x, y];
        });
        bezierCurves.pop();
        return { y, bezierCurves };
    }

    reversY(arg) {
        for (let index = 1; index < arg.length; index++)
            if (index % 2 == 1) arg[index] = this.height - arg[index];
    }

    bezierCurveToR(cp1x, cp1y, cp2x, cp2y, x, y) {
        this.reversY(arguments);
        this.ctx.bezierCurveTo(...arguments);
    }

    moveToR(x, y) {
        this.reversY(arguments);
        this.ctx.moveTo(...arguments);
    };

    lineToR(x, y) {
        this.reversY(arguments);
        this.ctx.lineTo(...arguments);
    };

}

globalThis.Diagram = Diagram;