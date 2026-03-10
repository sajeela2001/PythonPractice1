#question 2:-
from numpy import*
arr = array([[1,2,6],
             [2,3,4],
             [45,3,43]])
print("original array:-",arr)
arr.flatten()
print("1D array:-",arr)
arr1 = arr.reshape(3,3)
print("3D array:-",arr1)
print("a 2D array cannot be formed due to the size of matrix")

