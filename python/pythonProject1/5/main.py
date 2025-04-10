from mpi4py import MPI
import numpy as np
import time


def merge(left, right):
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged

comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

if rank == 0:
    # Генерируем случайный массив
    data = np.random.randint(0, 100, size=10000).tolist()  # Массив из 100 случайных чисел
    # print(data)
else:
    data = None

start_time = time.time()
data = comm.bcast(data, root=0)

local_data = np.array_split(data, size)[rank]

local_sorted = sorted(local_data)

gathered_data = comm.gather(local_sorted, root=0)

if rank == 0:
    result = gathered_data[0]
    for i in range(1, size):
        result = merge(result, gathered_data[i])
    d_time = time.time() - start_time

    # print("Отсортированный массив:", result)
    print("Отсортированный массив:", np.all(sorted(data) == result))
    print("Время", d_time)