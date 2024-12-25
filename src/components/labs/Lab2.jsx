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

    const xStart = 0;
    const xEnd = Math.PI;
    const yStart = 0;
    const yEnd = 1;

    const h = 0.005;

    const u0Func = (x, y) => {
        return sin(4 * x) * y * exp(-5 * y);
    }

    const f = (x, y) => {
        return (9 * y - 10) * sin(4 * x) * exp(-5 * y);
    }

    const phiB = (x) => {
        return - sin(4 * x);
    }

    const phiT = (x) => {
        return 4 / exp(5) * sin(4 * x); // МОЖЕТ БЫТЬ ТУТ БУДЕТ ЕЩЕ ИКС
    }

    const xArr = useMemo(() => {
        return range(xStart, xEnd + h / 2 , h).toArray()
    }, [xEnd, xStart]);

    const yArr = useMemo(() => {
        return range(yStart, yEnd + h / 2 , h).toArray()
    }, [yEnd, yStart]);


    const zGrid = useMemo(() => {
        return yArr.map(y => xArr.map(x => u0Func(x, y)));
    }, [xArr, yArr]);


    return (
        <Plot
            data={[
                {
                    x: xArr,
                    y: yArr,
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
    )
}

export default Lab2;