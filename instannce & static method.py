class Calculator:
    def add(self, a, b):
        return a + b

    @staticmethod
    def multiply(a, b):
        return a * b

# object
c = Calculator()

print("Addition:", c.add(5, 3))
print("Multiplication:", Calculator.multiply(5, 3))