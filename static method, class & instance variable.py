class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    def show(self):
        print("Product:", self.name)
        print("Price:", self.price)

    @staticmethod
    def discount(price):
        return price * 0.9   # 10% discount

# object
p1 = Product("Shoes", 2000)

p1.show()
final_price = Product.discount(p1.price)
print("Final Price after discount:", final_price)