#Question 9
import numpy as np
from numpy import*
A = array([[1,2,3,4],[2,3,4,5],[4,3,5,6],[3,5,63,2]])
B = array([[4,3,5,6],[3,5,63,2],[1,2,3,4],[2,3,4,5]])
print('matrix addition')
C = A+B
print(C)
print('matrix multiplication')
D = dot(A,B)
print(D)
print('subtraction')
E = A-B
print(E)
print('element wise multiplication')
F = A*B
print(F)
det = np.linalg.det(A)
det1 = np.linalg.det(B)
print("Determinant =", det1)
print("Determinant =", det)
