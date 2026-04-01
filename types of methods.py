class Calculator:
    def __init__(self, num1 , num2):
        self.num1 = num1
        self.num2 = num2
    def sum(self):
        result = self.num1 + self.num2
        print("sum:",result)
    @staticmethod
    def multiply(num3 , num4):
        return num3*num4
s1 = Calculator(2,4)
s1.sum()
print(Calculator.multiply(4,6))