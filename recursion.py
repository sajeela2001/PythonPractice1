import sys
sys.setrecursionlimit(2000)
print(sys.getrecursionlimit( ))
i = 0
def greet ( ):
    i + 1 == 1
    print('Hello!',i)

def greet(n):
    if n == 0:   # base case
        return
    print("Helloo!")
    greet(n-1)

greet(5)
