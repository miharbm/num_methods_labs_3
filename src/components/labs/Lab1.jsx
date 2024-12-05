import "./labs.scss"
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
    floor
} from 'mathjs'
import {useMemo} from "react";
import {bisection} from "../methods/index.js"
import {VictoryChart, VictoryLegend, VictoryLine, VictoryTheme} from "victory";

const Lab1 = () => {
    const h = 0.01;
    const l = 2;
    const rho = 1;
    const m = rho * l / 2;

    const alphaL = 1;
    const alphaR = 1;
    const betaL = 0;
    const betaR = 0;

    const muRoots = (mu) => mu * tan(mu) - 4

    const xStart = - l;
    const xEnd = l;

    const xArr = useMemo(() => {
        return range(xStart, xEnd + h / 2 , h).toArray()
    }, [xEnd, xStart]);


    const matrixL =  useMemo(() => {
        const sparseMatrix = sparse();

        // sparseMatrix.set([1, 0], -1); // Поддиагональ
        sparseMatrix.set([0, 0], 1 + (2 * alphaL * h) / (2 * betaL + alphaL * h)); // Главная диагональ
        sparseMatrix.set([0, 1], -1); // Наддиагональ

        for (let i = 1; i < xArr.length - 1; i++) {
            sparseMatrix.set([i, i - 1], -1); // Поддиагональ
            sparseMatrix.set([i, i], 2); // Главная диагональ
            sparseMatrix.set([i, i + 1], -1); // Наддиагональ

            if (i === floor(xArr.length / 2)) {
                const factor = rho * h / (rho * h + m)
                sparseMatrix.set([i, i - 1], -1 * factor); // Поддиагональ
                sparseMatrix.set([i, i], 2 * factor); // Главная диагональ
                sparseMatrix.set([i, i + 1], -1 * factor); // Наддиагональ
            }
        }

        sparseMatrix.set([xArr.length - 1, xArr.length - 2], -1); // Поддиагональ
        sparseMatrix.set([ xArr.length - 1, xArr.length - 1], 1 + (2 * alphaR * h) / (2 * betaR + alphaR * h)); // Главная диагональ
        // sparseMatrix.set([xArr.length - 2, xArr.length - 1], -1); // Наддиагональ

        return multiply(sparseMatrix, 1/ h**2);
    }, [m, xArr])


    const findMuRoots = (n, tol = 1e-6 ) => {
        let roots = [];

        let a = 0;
        let b = 0;

        for (let i = 0; i < n; i++) {
            b = a + Math.PI
            roots.push(bisection(muRoots, a, b, tol))
            a = b;
        }

        return roots;
    }


    const generateVInit = (even) => {
        let arr = []

        for (let i = 0; i < floor(xArr.length / 2); i++) {
            arr.push(random());
        }

        const reversedArr = arr.slice().reverse()

        if (xArr.length % 2 === 1) {
            arr.push(random());
        }

        if (even === false) {
            return arr.concat(reversedArr.map(v => v * -1));

        }

        return arr.concat(reversedArr);
    }

    const lambdasInit = [0.39, 2.46, 3.87, 9.86, 11.607, 22.2]
    // const lambdasInit = [2.46, 9.86, 22.2, 40, 60, 90]
    const vInitEven = generateVInit(true)
    const vInitNotEven = generateVInit(false)

    const rayleighIterations = (v, lambda) => {
        const vNewTemp = lusolve( subtract(matrixL, multiply(identity(xArr.length), lambda)), v );
        // const vNew = multiply(vNewTemp,  1 / norm(vNewTemp.toArray().flat()));
        const vNewTempArray = vNewTemp.toArray().flat()
        const vNew = multiply( vNewTemp,  1 / vNewTempArray.reduce((max, current) => (
             abs(current) > abs(max) ? current : max
         ), vNewTempArray[0]) );
        const newLambda = dot(multiply(matrixL, vNew), vNew) / dot(vNew, vNew)

        if (abs(newLambda - lambda) < 0.000001) {
            return {
                lambda: newLambda,
                v: vNew
            };
        }

        return rayleighIterations(vNew, newLambda);
    }

    const xCalculated = lambdasInit.map((lambdaInit, index) => (
        rayleighIterations(index % 2 === 1 ?  vInitNotEven : vInitEven, lambdaInit))
    )
    console.log(xCalculated)

    // const arraysToRevers = [3, 4]
    const arraysToRevers = []
    xCalculated.forEach(({v}, indexArr) => {
        if (v.get([3, 0]) < 0) {
            arraysToRevers.push(indexArr);
        }
    })

    console.log("arraysToRevers", arraysToRevers)
    const data = xCalculated.map(({v, lambda}, indexArr) => (
        {
            data: v.toArray().flat().map((v, index) => ({
                x: xArr[index],
                // y: v
                y: arraysToRevers.includes(indexArr) ? v * (-1) : v
            })),
            lambda: lambda
        }
    ))


    const lambdas = findMuRoots(3).map(mu => (mu / l) ** 2);

    const xK = lambdas.map(lambda => (
        {
            data: xArr.map(x => ({
                x,
                y: sin(sqrt(lambda) * (l - abs(x)))
            })),
            lambda
        }
    ))

    const lambdas2 = useMemo(() => {
        let lambdasTemp = [];
        for (let n = 1; n <= 3; n++) {
            lambdasTemp.push((Math.PI * n / l) ** 2)
        }
        return lambdasTemp;
    }, [])

    const xN = lambdas2.map(lambda => (
        {
            data: xArr.map(x => ({
                x,
                y: sin(sqrt(lambda) * x)
            })),
            lambda
        }
    ))

    const xAccurateSorted = [...xK, ...xN].sort((a, b) => a.lambda - b.lambda);
    const xAccurate = xAccurateSorted.map(({data, lambda}) => {
        if (data[3].y < 0) {
            return {
                data: data.map(({x, y}) => ({
                    x,
                    y: -y
                })),
                lambda
            }
        } else {
            return {
                data,
                lambda
            }
        }
    })

    const deviation = data.map((line, indexLine) => (
        {
            data: line.data.map(({x, y}, i) => ({
                x,
                y: abs(y - xAccurate[indexLine].data[i].y)
            })),
            lambda: line.lambda
        }
    ))


    return (
        <div className="layout">
            <div>
                1
            </div>
            <div className="layout__chart">
                <VictoryChart theme={VictoryTheme.material} height={400} width={800}>
                    {xAccurate.map((line, index) => (
                        <VictoryLine
                            key={index}
                            data={line.data}
                            style={{
                                data: { stroke: `hsl(${(index / (xK.length + xN.length)) * 360}, 70%, 50%)` }
                            }}
                        />
                    ))}
                    <VictoryLegend
                        x={800}
                        y={0}
                        centerTitle
                        orientation="vertical"
                        gutter={20}
                        style={{ border: { stroke: "black" }, title: { fontSize: 20 } }}
                        data={
                            xAccurate.map((line, index) => (
                                {
                                    name: `lambda = ${line.lambda}`,
                                    symbol: {
                                        fill: `hsl(${(index / (xK.length + xN.length)) * 360}, 70%, 50%)`,
                                        type: 'square'
                                    }
                                }
                            ))
                        }
                    />
                </VictoryChart>
                <VictoryChart theme={VictoryTheme.material} height={400} width={800}>
                    {data.map((line, index) => (
                        <VictoryLine
                            key={index}
                            data={line.data}
                            style={{
                                data: { stroke: `hsl(${(index / data.length) * 360}, 70%, 50%)` }
                            }}
                        />
                    ))}
                    <VictoryLegend
                        x={800}
                        y={0}
                        centerTitle
                        orientation="vertical"
                        gutter={20}
                        style={{ border: { stroke: "black" }, title: { fontSize: 20 } }}
                        data={
                            data.map((line, index) => (
                                {
                                    name: `lambda = ${line.lambda}`,
                                    symbol: {
                                        fill: `hsl(${(index / data.length) * 360}, 70%, 50%)`,
                                        type: 'square'
                                    }
                                }
                            ))
                        }
                    />
                </VictoryChart>
                <VictoryChart theme={VictoryTheme.material} height={400} width={800}>
                    {deviation.map((line, index) => (
                        <VictoryLine
                            key={index}
                            data={line.data}
                            style={{
                                data: { stroke: `hsl(${(index / data.length) * 360}, 70%, 50%)` }
                            }}
                        />
                    ))}
                    <VictoryLegend
                        x={800}
                        y={0}
                        centerTitle
                        orientation="vertical"
                        gutter={20}
                        style={{ border: { stroke: "black" }, title: { fontSize: 20 } }}
                        data={
                            deviation.map((line, index) => (
                                {
                                    name: `lambda = ${line.lambda}`,
                                    symbol: {
                                        fill: `hsl(${(index / data.length) * 360}, 70%, 50%)`,
                                        type: 'square'
                                    }
                                }
                            ))
                        }
                    />
                </VictoryChart>
            </div>
        </div>
    )
}

export default Lab1;