def fact(n):
    f = 1
    for i in range(1 , n + 1):
     f = f * i
    return f
g = 5
result = fact(g)
print(result)
# OR 
print(fact(n=5))
