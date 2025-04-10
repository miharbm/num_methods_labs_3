import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# Параметры
max_iter = 10000
x_start, x_end = 0, np.pi
y_start, y_end = 0, 1
h = 0.01

# Создание массивов x и y
x_arr = np.arange(x_start + h / 2, x_end - h / 2, h)
y_arr = np.arange(y_start + h / 2, y_end - h / 2, h)


# Функции
def u0_func(x, y):
    return np.sin(4 * x) * y * np.exp(-5 * y)


def f(x, y):
    return -(9 * y - 10) * np.sin(4 * x) * np.exp(-5 * y)


def phi_b(x):
    return -np.sin(4 * x)


def phi_t(x):
    return -(4 / np.exp(5)) * np.sin(4 * x)


# Создание сетки
X, Y = np.meshgrid(x_arr, y_arr, indexing='ij')
Z_grid = u0_func(X, Y)


# Правая часть уравнения
def right_hand_side():
    res = np.zeros((len(x_arr), len(y_arr)))

    for i in range(len(x_arr)):
        for j in range(len(y_arr)):
            res[i, j] += f(x_arr[i], y_arr[j])

    for i in range(len(x_arr)):
        res[i, 0] += phi_b(x_arr[i]) / h
        res[i, -1] += phi_t(x_arr[i]) / h

    return res


# Оператор L_D
def op_LD(u):
    res = np.zeros_like(u)

    for i in range(1, len(x_arr)):
        for j in range(len(y_arr)):
            res[i, j] += (-u[i - 1, j]) / (h ** 2)

    for i in range(len(x_arr) - 1):
        for j in range(len(y_arr)):
            res[i, j] += (-u[i + 1, j]) / (h ** 2)

    for i in range(len(x_arr)):
        for j in range(1, len(y_arr)):
            res[i, j] += (-u[i, j - 1]) / (h ** 2)

    for i in range(len(x_arr)):
        for j in range(len(y_arr) - 1):
            res[i, j] += (-u[i, j + 1]) / (h ** 2)

    # Условие периодичности
    for j in range(len(y_arr)):
        res[0, j] += (-u[-1, j]) / (h ** 2)

    for j in range(len(y_arr)):
        res[-1, j] += (-u[0, j]) / (h ** 2)

    return res


# Оператор D
def op_D(u):
    res = np.zeros_like(u)

    for i in range(1, len(x_arr)):
        for j in range(len(y_arr)):
            res[i, j] += 1 / (h ** 2)

    for i in range(len(x_arr) - 1):
        for j in range(len(y_arr)):
            res[i, j] += 1 / (h ** 2)

    for i in range(len(x_arr)):
        for j in range(1, len(y_arr)):
            res[i, j] += 1 / (h ** 2)

    for i in range(len(x_arr)):
        for j in range(len(y_arr) - 1):
            res[i, j] += 1 / (h ** 2)

    # Условие периодичности
    for j in range(len(y_arr)):
        res[0, j] += 1 / (h ** 2)

    for j in range(len(y_arr)):
        res[-1, j] += 1 / (h ** 2)

    return res


# Метод Якоби
def jacob_method():
    u = np.zeros((len(x_arr), len(y_arr)))
    rhs = right_hand_side()
    op_D_values = op_D(u)

    for _ in range(max_iter):
        ldu = op_LD(u)

        for i in range(len(x_arr)):
            for j in range(len(y_arr)):
                u[i, j] = (1 / op_D_values[i, j]) * (rhs[i, j] - ldu[i, j])

    return u


# Решение методом Якоби
jacob_solution = jacob_method()

# Отклонение
deviation = jacob_solution - Z_grid

# Визуализация
fig = plt.figure(figsize=(18, 12))

# 3D график начальной сетки
ax1 = fig.add_subplot(231, projection='3d')
ax1.plot_surface(X, Y, Z_grid, cmap='viridis')
ax1.set_title('Initial Grid')

# 3D график решения методом Якоби
ax2 = fig.add_subplot(232, projection='3d')
ax2.plot_surface(X, Y, jacob_solution, cmap='viridis')
ax2.set_title('Jacobian Solution')

# Heatmap начальной сетки
ax3 = fig.add_subplot(233)
ax3.imshow(Z_grid, extent=[y_start, y_end, x_start, x_end], origin='lower', cmap='viridis')
ax3.set_title('Initial Grid Heatmap')

# Heatmap решения методом Якоби
ax4 = fig.add_subplot(234)
ax4.imshow(jacob_solution, extent=[y_start, y_end, x_start, x_end], origin='lower', cmap='viridis')
ax4.set_title('Jacobian Solution Heatmap')

# Heatmap отклонения
ax5 = fig.add_subplot(235)
ax5.imshow(deviation, extent=[y_start, y_end, x_start, x_end], origin='lower', cmap='viridis')
ax5.set_title('Deviation Heatmap')

plt.tight_layout()
plt.show()