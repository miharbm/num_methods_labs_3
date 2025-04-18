import Plot from 'react-plotly.js';
import {
    sin,
    range,
    sparse,
    multiply,
    tan,
    sqrt,
    abs,
    subtract,
    lusolve,
    identity,
    norm,
    dot,
    random,
    floor,
    exp, zeros, divide, add
} from 'mathjs'
import {useMemo} from "react";
import {y} from "plotly.js/src/traces/bar/attributes.js";

const Lab2 = () => {
    const layoutSize = Math.min(window.innerWidth, window.innerHeight) - 120;

    const maxIter = 10000;

    const xStart = 0;
    const xEnd = Math.PI;
    const yStart = 0;
    const yEnd = 1;

    const h = 0.01;

    const u0Func = (x, y) => {
        return sin(4 * x) * y * exp(-5 * y);
    }

    const f = (x, y) => {
        return - (9 * y - 10) * sin(4 * x) * exp(-5 * y);
    }

    const phiB = (x) => {
        return - sin(4 * x);
    }

    const phiT = (x) => {
        return - ( 4 / exp(5) ) * sin(4 * x);
    }

    const xArr = useMemo(() => {
        return range(xStart + h/2, xEnd - h / 2 , h).toArray()
    }, [xEnd, xStart]);

    const yArr = useMemo(() => {
        return range(yStart + h/2, yEnd - h / 2 , h).toArray()
    }, [yEnd, yStart]);


    const zGrid = useMemo(() => {
        // return yArr.map(y => xArr.map(x => u0Func(x, y)));
        return xArr.map(x => yArr.map(y => u0Func(x, y)));
    }, [xArr, yArr]);


    const lambda_min_n = 4;

    const lambda_max_n =
        4 / (h ** 2) * Math.pow(Math.sin(Math.PI * (xArr.length - 1) * h / (2 * Math.PI)), 2) +
        4 / (h ** 2) * Math.pow(Math.sin(Math.PI * (yArr.length - 1) * h / (2)), 2) +
        4;

    const tau = 2 / (lambda_min_n + lambda_max_n);


    console.log("lambda_min_n:", lambda_min_n);
    console.log("lambda_max_n:", lambda_max_n);

    const rightHandSide = () => {
        const res = Array.from({ length: xArr.length }, () => Array(yArr.length).fill(0));

        for (let i = 0; i < xArr.length; i++) {
            for (let j = 0; j < xArr.length; j++) {
                res[i][j] += f(xArr[i], yArr[j]);
            }
        }

        for (let i = 0; i < xArr.length; i++) {
            res[i][0] += phiB(xArr[i]) / h;
            res[i][yArr.length - 1] += phiT(xArr[i]) / h;
        }

        // const res = xArr.map((x) => {
        //     return yArr.map((y, yIndex) => {
        //         return  f(x, y)
        //             // + ( yIndex === 0 ? phiB(x) / h : 0 )
        //             // + ( yIndex === yArr.length - 1 ? phiT(x) / h : 0 )
        //             + ( yIndex === 0 ? phiT(x) / h : 0 )
        //             + ( yIndex === yArr.length - 1 ? phiB(x) / h : 0 )
        //     } )
        // });

        return res;
    }

    const opL = (uArrArr) => {
        const res = Array.from({ length: uArrArr.length }, () => Array(uArrArr[0].length).fill(0));

        for (let i = 1; i < uArrArr.length; i++) {
            for(let j = 0; j < uArrArr[i].length; j++) {
                res[i][j] += ( uArrArr[i][j] - uArrArr[i - 1][j] ) / (h ** 2);
            }
        }

        for (let i = 0; i < uArrArr.length - 1; i++) {
            for(let j = 0; j < uArrArr[i].length; j++) {
                res[i][j] += ( uArrArr[i][j] - uArrArr[i + 1][j] ) / (h ** 2);
            }
        }

        for (let i = 0; i < uArrArr.length; i++) {
            for(let j = 1; j < uArrArr[i].length; j++) {
                res[i][j] += ( uArrArr[i][j] - uArrArr[i][j - 1] ) / (h ** 2);
            }
        }

        for (let i = 0; i < uArrArr.length; i++) {
            for(let j = 0; j < uArrArr[i].length - 1; j++) {
                res[i][j] += ( uArrArr[i][j] - uArrArr[i][j + 1] ) / (h ** 2);
            }
        }


        // условие периодичности
        for(let j = 0; j < uArrArr[0].length; j++) {
            res[0][j] += ( uArrArr[0][j] - uArrArr.at(-1)[j] ) / (h ** 2);
        }

        for(let j = 0; j < uArrArr[0].length; j++) {
            res.at(-1)[j] += ( uArrArr.at(-1)[j] - uArrArr[0][j] ) / (h ** 2);
        }

        return res;
    }


    // const initU = Array.from({ length: xArr.length }, () => Array(yArr.length).fill(0))

    const rightHandSideValues = rightHandSide();
    console.log("rightHandSideValues", rightHandSideValues)

    const simpleIteration = () => {
        const initU = Array.from({ length: xArr.length }, () => Array(yArr.length).fill(0))

        let u = JSON.parse(JSON.stringify(initU)); //просто копия

        for (let iter = 0; iter < maxIter; iter++) {

            let lUArrArr = opL(u);


            for (let i = 0; i < xArr.length; i++) {
                for (let j = 0; j < yArr.length; j++) {
                    u[i][j] = u[i][j] + tau * (rightHandSideValues[i][j] - lUArrArr[i][j]);
                }
            }
        }

        return u;
    }

    const simpleIterationSolution = simpleIteration()


    const deviation = simpleIterationSolution.map((xArr, i) => (
        xArr.map((x, j) => x - zGrid[i][j])
    ))

    return (
        <div style={{width:'100%'}}>
            <Plot
                data={[
                    {
                        // x: xArr,
                        // y: yArr,
                        x: yArr,
                        y: xArr,
                        z: zGrid,
                        // type: 'scatter3d',
                        type: 'surface',
                        mode: 'markers',
                        marker: { size: 3 },
                        lighting: {
                            ambient: 0.4, // Уменьшаем амбиентное освещение
                            diffuse: 0.8, // Увеличиваем диффузное освещение для сильных теней
                            specular: 0.9, // Увеличиваем отражение для ярких бликов
                            roughness: 0.5, // Меньше шероховатости, более гладкие тени
                        },

                    },
                ]}
                layout={{
                    title: '3D Graph',
                    width: layoutSize,
                    height: layoutSize,
                    autosize: true,
                    scene: {
                        xaxis: { title: 'X Axis' },
                        yaxis: { title: 'Y Axis' },
                        zaxis: { title: 'Z Axis' },
                        camera: {
                            eye: { x: 1.5, y: 1.5, z: 1.5 },
                        },
                    },
                    lighting: {
                        ambient: 0.3, // Уровень амбиентного освещения
                        diffuse: 0.7, // Уровень диффузного освещения
                        specular: 0.8, // Уровень зеркального отражения
                        roughness: 0.5, // Шероховатость (для более мягких теней)
                        fresnel: 0.1, // Эффект френеля для теней
                    },
                }}
                config={{ responsive: true }}
            />
            {/* Heatmap */}
            <Plot
                data={[
                    {
                        // x: xArr,
                        // y: yArr,
                        x: yArr,
                        y: xArr,
                        z: zGrid,
                        type: 'heatmap',
                        colorscale: 'Viridis', // Можно выбрать другой colorscale
                    },
                ]}
                layout={{
                    title: 'Heatmap',
                    width: layoutSize / 2,
                    height: layoutSize / 2,
                    xaxis: { title: 'X Axis' },
                    yaxis: { title: 'Y Axis' },
                }}
                config={{ responsive: true }}
            />
            <Plot
                data={[
                    {
                        // x: xArr,
                        // y: yArr,
                        x: yArr,
                        y: xArr,
                        z: simpleIterationSolution,
                        type: 'heatmap',
                        colorscale: 'Viridis', // Можно выбрать другой colorscale
                    },
                ]}
                layout={{
                    title: 'Heatmap',
                    width: layoutSize / 2,
                    height: layoutSize / 2,
                    xaxis: { title: 'X Axis' },
                    yaxis: { title: 'Y Axis' },
                }}
                config={{ responsive: true }}
            />
            <Plot
                data={[
                    {
                        // x: xArr,
                        // y: yArr,
                        x: yArr,
                        y: xArr,
                        z: deviation,
                        type: 'heatmap',
                        colorscale: 'Viridis', // Можно выбрать другой colorscale
                    },
                ]}
                layout={{
                    title: 'Heatmap',
                    width: layoutSize / 2,
                    height: layoutSize / 2,
                    xaxis: { title: 'X Axis' },
                    yaxis: { title: 'Y Axis' },
                }}
                config={{ responsive: true }}
            />
        </div>


    )
}

export default Lab2;