#Question 8
import numpy as np
matrix = np.arange(1,17).reshape(4,4)
print("matrix:\n",matrix)
upper = np.triu(matrix)
lower = np.tril(matrix)
print("upper_triangle matrix",upper)
print("lower_triangle matrix",lower)
difference = upper - lower
print("Difference:\n",difference)