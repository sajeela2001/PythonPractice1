from numpy import*
def add_sub(a,b):
    c = a + b
    d = a - b
    print(c)
    print(d)
add_sub(10,20)
# pass by value
def change(x):
    x = 20
    print("Inside the Function:", x)
x = 10
change(x)
print("Outside the Function:", x)
#pass by reference
def change(lst):
    lst[0] = 100

lst = [10,20,30]
change(lst)

print(lst)
