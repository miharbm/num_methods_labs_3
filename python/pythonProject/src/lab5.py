import numpy as np
import matplotlib.pyplot as plt
from scipy.sparse import linalg, lil_matrix, eye
from matplotlib.animation import FuncAnimation

h = 0.01
x_l, x_r = -1, 1
y_l, y_r = 0, 1
H = y_r - y_l
r0 = 0.2 * H
c_factor = 100
q = 100
x0 = 0

lx, ly = np.abs(x_r - x_l), np.abs(y_r - y_l)
Nx, Ny = int(np.round(lx / h)), int(np.round(ly / h))
hx, hy = lx / Nx, ly / Ny

x = np.linspace(x_l + hx / 2, x_r - hx / 2, Nx)
y = np.linspace(y_l + hy / 2, y_r - hy / 2, Ny)
t, tau = np.linspace(0, 2, 120, retstep=True)

X, Y = np.meshgrid(x, y, indexing="ij")

C = np.ones((Nx, Ny))
C[(X ** 2 + (Y - H / 2) ** 2) < r0 ** 2] *= c_factor


def f(X, Y, q, x0):
    sigma = 0.05
    return q * np.exp(-((X - x0) ** 2 + Y ** 2) / (2 * sigma ** 2))


def RHS(X, Y, q, x0):
    return f(X, Y, q, x0)


def getL(Nx, Ny, hx, hy):
    k = np.arange(Nx * Ny, dtype=int).reshape((Nx, Ny))
    L = lil_matrix((Nx * Ny, Nx * Ny))

    for i in range(Nx):
        for j in range(Ny):
            idx = k[i, j]

            L[idx, k[(i - 1) % Nx, j]] = -1 / (hx ** 2 * C[i, j])
            L[idx, k[(i + 1) % Nx, j]] = -1 / (hx ** 2 * C[i, j])
            L[idx, idx] += 2 / (hx ** 2 * C[i, j])

            if j == 0:
                L[idx, idx] += 1 / (hy ** 2 * C[i, j])
                L[idx, k[i, j + 1]] = -1 / (hy ** 2 * C[i, j])
            elif j == Ny - 1:
                L[idx, k[i, j - 1]] = -1 / (hy ** 2 * C[i, j])
                L[idx, idx] += 1 / (hy ** 2 * C[i, j])
            else:
                L[idx, k[i, j - 1]] = -1 / (hy ** 2 * C[i, j])
                L[idx, k[i, j + 1]] = -1 / (hy ** 2 * C[i, j])
                L[idx, idx] += 2 / (hy ** 2 * C[i, j])

        L[idx, idx] += 4 / C[i, j]
    return L.tocsr()


u_prev = np.zeros(Nx * Ny)
L = getL(Nx, Ny, hx, hy)
F = RHS(X, Y, q, x0).flatten()
A = eye(Nx * Ny, format='csr') + tau * L
B = eye(Nx * Ny, format='csr') - tau * L
C = tau * F

fig, ax = plt.subplots()
ax.set_xlabel('X')
ax.set_ylabel('Y')
for i in range(len(t)):
    ax.imshow(u_prev.reshape(Nx, Ny).T, origin='lower', cmap='hot', animated=True)
    u_prev = linalg.spsolve(A, B @ u_prev + C)
    fig.canvas.draw()
    plt.pause(0.1)

plt.show()
