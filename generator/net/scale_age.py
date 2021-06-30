import math
import numpy as np
from scipy import interpolate
import matplotlib.pyplot as plt


def f(x):
    return math.log10(x)


# a = 1
# b = 30e+9
# eps = (b - a) // 3
# # eps = 3e+9
#
# k = 2.1
# x_ages = list(np.arange(0, b, eps))
# x_ages[0] = 1
# print(len(x_ages))
# # x_ages = [a, 1e+9, 2e+9, 3e+9, 4e+9, 11e+9, 12e+9, 13e+9, 27e+9, 28e+9, 29e+9, b]
# # y_ages = [0, 100,   200,  275,  300,   450,   500,   525,    725,   800,   900, 1000]
# tmp = [f(x_ages[i]) for i in range(0, len(x_ages) // 2)]
# print(len(tmp))
# # y_ages = tmp[0:(len(tmp) if (len(x_ages) % 2 == 0) else (len(tmp) - 1))] + [-i + k * tmp[len(x_ages) // 2 - 1] for i in
# #                                                                          reversed(tmp)]
# y_ages = tmp + (([tmp[len(tmp) - 1] * k / 2]) if (len(x_ages) % 2 != 0) else []) + [-i + k * tmp[len(x_ages) // 2 - 1]
#                                                                                     for i in reversed(tmp)]
# print(len(y_ages))
#
# spline = interpolate.splrep(x_ages, y_ages, s=0, k=2)
# spline_inv = interpolate.splrep(y_ages, x_ages, s=0, k=2)


base_a = 1
base_divider = 4
base_k = 2.3


def gen_spline(b, a=base_a, divider=base_divider, k=base_k, inv=False):
    # print("AGE:", b)
    eps = (b - a) // divider

    x_ages = list(np.arange(0, b, eps))
    x_ages[0] = 1
    # print(len(x_ages))

    tmp = [f(x_ages[i]) for i in range(0, len(x_ages) // 2)]
    # print(len(tmp))

    y_ages = tmp + (([tmp[len(tmp) - 1] * k / 2]) if (len(x_ages) % 2 != 0) else []) + [
        -i + k * tmp[len(x_ages) // 2 - 1] for i in reversed(tmp)]
    # print(len(y_ages))

    spline = interpolate.splrep(y_ages, x_ages, s=0, k=2) if inv else interpolate.splrep(x_ages, y_ages, s=0, k=2)

    return spline


def scale_age(x, last_age):
    val = interpolate.splev(x, gen_spline(b=last_age, inv=False), der=0)
    return val


# scale_age_factor = scale_age(2952141953419)


def unscale_age(x1, last_age):
    val = interpolate.splev(x1, gen_spline(b=last_age, inv=True), der=0)
    return val


def test(a, b, divider, k=2.1):
    spline = gen_spline(b=b, a=a, divider=divider, k=k, inv=False)
    eps = (b - a) // divider

    x_ages = list(np.arange(0, b, eps))
    x_ages[0] = 1

    x_for_plot = list(np.arange(a, b, eps / 10))

    tmp = [f(x_ages[i]) for i in range(0, len(x_ages) // 2)]
    # print(len(tmp))

    y_ages = tmp + (([tmp[len(tmp) - 1] * k / 2]) if (len(x_ages) % 2 != 0) else []) + [
        -i + k * tmp[len(x_ages) // 2 - 1] for i in reversed(tmp)]

    plt.scatter(x_ages, y_ages, label='Points', color='blue')

    y_interpolated = interpolate.splev(x_for_plot, spline, der=0)

    # x_calc = interpolate.splev(y_interpolated, spline_inv, der=0)

    # print(np.array(x_for_plot))
    # print(x_calc)

    plt.plot(x_for_plot, y_interpolated, label='Interpolated')

    plt.xlabel('X')
    plt.ylabel('Y')
    plt.legend()
    plt.show()


# test(a=1, b=30e+9, divider=base_divider, k=base_k)
