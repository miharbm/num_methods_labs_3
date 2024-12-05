
const  bisection = (func, a, b, tol = 1e-6, maxIter = 100) =>{
    let fa = func(a);
    let fb = func(b);
    // if (fa * fb > 0) {
    //     throw new Error("Function must have opposite signs at the endpoints a and b.");
    // }

    let mid;
    for (let i = 0; i < maxIter; i++) {
        mid = (a + b) / 2;
        let fmid = func(mid);

        if (Math.abs(fmid) < tol || Math.abs(b - a) < tol) {
            return mid; // Root found
        }

        if (fa * fmid < 0) {
            b = mid;
            fb = fmid;
        } else {
            a = mid;
            fa = fmid;
        }
    }

    throw new Error("Max iterations reached without finding root.");
}

export default bisection;