a = 10
print( a, id(a))

def num():
    print(globals()["a"], id(globals()["a"]))

    globals()["a"] = 15   # change global a

    print("After change:", globals()["a"],id(globals()["a"]))

    a = 15  # local variable
    print("Local a:", a,id(a))

num()