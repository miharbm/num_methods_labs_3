from mpi4py import MPI
import numpy as np
import timeit
import time


def f(x):
    return 4 / (1 + x**2)

def compute_integral(a, b, n):
    h = (b - a) / n
    integral = 0.0
    for i in range(n):
        x = a + i * h + h / 2
        integral += f(x)
    integral *= h
    return integral

comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

a = 0.0
b = 1.0
n = 1000000

local_n = n // size
local_a = a + rank * (b - a) / size
local_b = local_a + (b - a) / size

start_time = time.time()
local_integral = compute_integral(local_a, local_b, local_n)

global_integral = comm.reduce(local_integral, op=MPI.SUM, root=0)
d_time = time.time() - start_time

if rank == 0:
    print(f"Значение интеграла: {global_integral} время: {d_time}")