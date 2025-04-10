import threading
import multiprocessing as mp
import time


def f(x):
    """Функция для интегрирования: 4 / (1 + x^2)"""
    return 4.0 / (1.0 + x * x)


def integrate_threaded(a, b, n, results, index):
    """Численное интегрирование методом трапеций в потоке."""
    h = (b - a) / n
    s = 0.5 * f(a)

    for i in range(1, n):
        s += f(a + h * i)
    s += 0.5 * f(b)

    results[index] = h * s
    print(f"Поток {index}: [{a:.6f}, {b:.6f}], {n} отрезков, результат = {results[index]:.6f}")


def worker_process(args):
    """Функция для процесса, который внутри запускает потоки."""
    process_id, num_processes, a, b, total_intervals, num_threads = args

    # Разбиваем интервал процесса
    h = (b - a) / num_processes
    a1 = a + h * process_id
    b1 = a1 + h if process_id < num_processes - 1 else b
    n1 = total_intervals // num_processes

    # Разбиваем подотрезок еще на потоки
    thread_intervals = n1 // num_threads
    thread_results = [0] * num_threads
    threads = []

    for i in range(num_threads):
        ta = a1 + (b1 - a1) * i / num_threads
        tb = a1 + (b1 - a1) * (i + 1) / num_threads if i < num_threads - 1 else b1
        thread = threading.Thread(target=integrate_threaded, args=(ta, tb, thread_intervals, thread_results, i))
        threads.append(thread)
        thread.start()

    # Дождаться выполнения всех потоков
    for thread in threads:
        thread.join()

    # Суммируем частичные результаты потоков
    return sum(thread_results)


def main():
    a = 0.0  # Нижний предел
    b = 1.0  # Верхний предел
    total_intervals = 100000000  # Количество отрезков

    num_processes = int(input("Введите число процессов: "))
    num_threads = int(input("Введите число потоков на процесс: "))

    start_time = time.time()

    if num_processes < 2:
        # Без процессов, но с потоками
        thread_results = [0] * num_threads
        threads = []
        for i in range(num_threads):
            ta = a + (b - a) * i / num_threads
            tb = a + (b - a) * (i + 1) / num_threads if i < num_threads - 1 else b
            thread = threading.Thread(target=integrate_threaded,
                                      args=(ta, tb, total_intervals // num_threads, thread_results, i))
            threads.append(thread)
            thread.start()

        for thread in threads:
            thread.join()

        result = sum(thread_results)
    else:
        # Параллельный запуск процессов
        pool = mp.Pool(processes=num_processes)
        args = [(i, num_processes, a, b, total_intervals, num_threads) for i in range(num_processes)]
        results = pool.map(worker_process, args)

        pool.close()
        pool.join()

        result = sum(results)

    end_time = time.time()

    print(f"\nВремя выполнения: {end_time - start_time:.3f} секунд")
    print(f"Результат: {result:.15f}")


if __name__ == "__main__":
    main()
