#Question 5:-
from numpy import*
import numpy as np
arr = array(range(1,10))
arr1 = arr.reshape(3,3)
print(arr1)
print("transpose :- ",transpose(arr1))
print("diagonal :-",diagonal(arr1))
print("sum of diagonal",sum(diagonal(arr1)))
#Question 8
matrix = np.arange(1,17).reshape(4,4)
print("matrix:\n",matrix)
upper = np.triu(matrix)
lower = np.tril(matrix)
print("upper_triangle matrix",upper)
print("lower_triangle matrix",lower)
difference = upper - lower
print("Difference:\n",difference)
#Question 7
m = np.zeros((6,6), dtype =  int)
m[0, : ]=1
m[-1, :]=1
m[ :, 0]=1
m[:, -1]= 1
print(m)
# Question No:- 3
matrix = np.zeros ((5,5),dtype = int)
matrix [2,:] = 1
matrix [:, 2] = 1
print(matrix)
#Question 4:-
arr = array(range(1,17))
print(arr)
arr1 = arr.reshape(4,4)
print(arr1)
print(diagonal(arr1))
print(transpose(arr1))
print(sum(diagonal(arr1)))


