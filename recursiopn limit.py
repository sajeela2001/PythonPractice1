import sys
print(sys.getrecursionlimit( ))
def greet():
    print('Helloo!')
    greet( )
    sys.setrecursionlimit(2000)
    print(sys.getrecursionlimit( ))
    greet( )